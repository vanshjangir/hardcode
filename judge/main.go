package main

import (
    "context"
    "encoding/json"
    "fmt"
    "os"
    "os/exec"
    "path/filepath"
    "strings"
    "time"

    amqp "github.com/rabbitmq/amqp091-go"
)

type ReceivedData struct {
    ID        string `json:"id"`
    Code      string `json:"code"`
    Input     string `json:"input"`
    Output    string `json:"output"`
    Timelimit string `json:"timelimit"`
    Memlimit  string `json:"memlimit"`
}

type JudgeResult struct {
    Status     string `json:"status"`
    Err        string `json:"err"`
    UserOutput string `json:"useroutput"`
}

func main() {
    conn, err := amqp.Dial("amqp://rabbitmq")
    if err != nil {
        panic(fmt.Sprintf("Failed to connect to RabbitMQ: %v", err))
    }
    defer conn.Close()

    ch, err := conn.Channel()
    if err != nil {
        panic(fmt.Sprintf("Failed to open channel: %v", err))
    }
    defer ch.Close()

    mainQueue := "codejudge"
    
    q, err := ch.QueueDeclare(
        mainQueue,
        false,
        false,
        false,
        false,
        nil,
    )
    if err != nil {
        panic(fmt.Sprintf("Failed to declare queue: %v", err))
    }

    err = ch.Qos(
        1,
        0,
        false,
    )
    if err != nil {
        panic(fmt.Sprintf("Failed to set QoS: %v", err))
    }

    msgs, err := ch.Consume(
        q.Name,
        "",
        false,
        false,
        false,
        false,
        nil,
    )
    if err != nil {
        panic(fmt.Sprintf("Failed to register a consumer: %v", err))
    }

    forever := make(chan bool)
    ctx := context.Background()

    go func() {
        for d := range msgs {
            var recvData ReceivedData
            if err := json.Unmarshal(d.Body, &recvData); err != nil {
                fmt.Printf("Error parsing message: %v\n", err)
                d.Ack(false)
                continue
            }
            fmt.Printf("Received data: %+v\n", recvData)

            metadata := fmt.Sprintf("%s\x00%s\x00", recvData.Timelimit, recvData.Memlimit)
            files := map[string]string{
                "run/usercode.py": recvData.Code,
                "run/INPUT":        recvData.Input,
                "run/OUTPUT":       "",
                "run/ERROR":        "",
                "run/STATUS":       "",
                "run/META":         metadata,
            }

            for path, content := range files {
                if err := writeFile(path, content); err != nil {
                    fmt.Printf("Error writing file %s: %v\n", path, err)
                    d.Ack(false)
                    continue
                }
            }

            result, err := testCode(recvData.Output)
            if err != nil {
                fmt.Printf("Error testing code: %v\n", err)
                d.Ack(false)
                continue
            }

            resultJSON, err := json.Marshal(result)
            if err != nil {
                fmt.Printf("Error marshaling result: %v\n", err)
                d.Ack(false)
                continue
            }

            ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
            err = ch.PublishWithContext(ctx,
                "",
                recvData.ID,
                false,
                false,
                amqp.Publishing{
                    ContentType: "application/json",
                    Body:        resultJSON,
                })
            cancel()

            if err != nil {
                fmt.Printf("Error publishing result: %v\n", err)
                d.Ack(false)
                continue
            }

            d.Ack(false)
            fmt.Printf("Sent result to queue %s: %+v\n", recvData.ID, result)
        }
    }()

    fmt.Println("Waiting for messages. To exit press CTRL+C")
    <-forever
}

func writeFile(path string, content string) error {
    dir := filepath.Dir(path)
    if err := os.MkdirAll(dir, 0755); err != nil {
        return fmt.Errorf("failed to create directory: %v", err)
    }
    return os.WriteFile(path, []byte(content), 0644)
}

func testCode(expectedOutput string) (JudgeResult, error) {
    cmd := exec.Command("/app/run/main")
    cmd.Dir = "/app/run/"
    
    if err := cmd.Run(); err != nil {
        return JudgeResult{}, fmt.Errorf("error running code: %v", err)
    }

    userOutput, err := os.ReadFile("./run/OUTPUT")
    if err != nil {
        return JudgeResult{}, fmt.Errorf("error reading output: %v", err)
    }

    status, err := os.ReadFile("./run/STATUS")
    if err != nil {
        return JudgeResult{}, fmt.Errorf("error reading status: %v", err)
    }

    errorContent, err := os.ReadFile("./run/ERROR")
    if err != nil {
        return JudgeResult{}, fmt.Errorf("error reading error file: %v", err)
    }

    result := JudgeResult{
        UserOutput: string(userOutput),
    }

    if string(status) == "SUCCESS" {
        if strings.TrimSpace(string(userOutput)) == strings.TrimSpace(expectedOutput) {
            result.Status = "ACCEPTED"
        } else {
            result.Status = "WRONG ANSWER"
        }
        result.Err = ""
    } else {
        result.Status = string(status)
        result.Err = string(errorContent)
    }

    return result, nil
}
