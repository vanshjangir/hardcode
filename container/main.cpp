#include <iostream>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <sys/resource.h>
#include <sys/wait.h>
#include <fcntl.h>

#define INTERNAL_SERVER_ERROR   -4
#define SUCCESSFUL              0

using namespace std;

void out(int c_socket, string s, int len, int status){
    send(c_socket, s.c_str(), len, 0);
    close(c_socket);
    cout << s << endl;
    cout << "exiting with: " << status << endl;
    fflush(stdout);
}

void parse(char buffer[], char id[], char timeMAX[], char memMAX[]){

    int c=0;
    for(int i=0;;i++){
        id[i] = buffer[c];
        if(buffer[c] == '\0'){
            c++;
            break;
        }
        c++;
    }
    for(int i=0;;i++){
        timeMAX[i] = buffer[c];
        if(buffer[c] == '\0'){
            c++;
            break;
        }
        c++;
    }
    for(int i=0;;i++){
        memMAX[i] = buffer[c];
        if(buffer[c] == '\0'){
            c++;
            break;
        }
        c++;
    }

}

void run(int c_socket){
    int rc;
    pid_t pid;
    char id[64];
    char buffer[100];
    char timeMAX[5];
    char memMAX[5];
    char compileCommand[256];
    char execute[100];
    char input[100];
    char useroutput[100];
    char error[100];

    rc = recv(c_socket, buffer, sizeof(buffer), 0);
    parse(buffer, id, timeMAX, memMAX);

    if(rc <= 0){
        return;
    }else{
        printf("received id: %s\n", id);
    }

    snprintf(compileCommand, 256, "g++ codefiles/usercode_%s.cpp \
            -o codefiles/usercode_%s 2> codefiles/error_%s.txt", id, id, id);
    snprintf(execute, 100, "./codefiles/usercode_%s", id);
    snprintf(input, 100, "codefiles/input_%s.txt", id);
    snprintf(useroutput, 100, "codefiles/useroutput_%s.txt", id);
    snprintf(error, 100, "codefiles/error_%s.txt", id);

    rc = system(compileCommand);
    if(rc != 0){
        out(c_socket, "COMPILATION_ERROR", 17, 0);
        return;
    }

    pid = fork();
    if(pid == -1){
        out(c_socket, "INTERNAL_ERROR", 14, 0);
        return;
    }
    else if(pid == 0){
        // child process
        
        struct rlimit memLimit, timeLimit;

        int inputFile = open(input, O_RDONLY);
        int useroutputFile = open(useroutput, O_WRONLY | O_CREAT);
        int errorFile = open(error, O_WRONLY | O_CREAT);

        if(inputFile == -1 || useroutputFile == -1 || errorFile == -1){
            perror("FILE ERROR");
            exit(INTERNAL_SERVER_ERROR);
        }

        dup2(inputFile, STDIN_FILENO);
        dup2(useroutputFile, STDOUT_FILENO);
        dup2(errorFile, STDERR_FILENO);
        close(inputFile);
        close(useroutputFile);
        close(errorFile);

        memLimit.rlim_cur = 1024*1024*(stoi(memMAX));
        memLimit.rlim_max = 1024*1024*(stoi(memMAX));
        timeLimit.rlim_cur = stoi(timeMAX);
        timeLimit.rlim_max = stoi(timeMAX)+1;

        setrlimit(RLIMIT_AS, &memLimit);
        setrlimit(RLIMIT_CPU, &timeLimit);

        rc = execlp(execute, execute, NULL);
        if(rc == -1){
            perror("execl failed");
            exit(INTERNAL_SERVER_ERROR);
        }
    }
    else{
        //parent process
        
        int status;
        waitpid(pid, &status, 0);

        if(WIFEXITED(status)){
            int exitStatus = WEXITSTATUS(status);
            cout << "EXITED\n";

            if(exitStatus == SUCCESSFUL){
                out(c_socket, "SUCCESS", 7, exitStatus);
            }
            else if(exitStatus == INTERNAL_SERVER_ERROR){
                out(c_socket, "INTERNAL_ERROR", 14, exitStatus);
            }
            else{
                out(c_socket, "RUNTIME_ERROR", 13, exitStatus);
            }
        }
        else if(WIFSIGNALED(status)){
            int signal = WTERMSIG(status);
            cout << "SIGNALED\n";
            
            if(signal == SIGSEGV){
                out(c_socket, "MEMORY_LIMIT_EXCEEDED", 21, signal);
            }
            else if(signal == SIGXCPU){
                out(c_socket, "TIME_LIMIT_EXCEEDED", 19, signal);
            }
            else{
                out(c_socket, "SOMETHING_ELSE", 14, signal);
            }
        }
    }
}

int main(int argc, char **argv){

    int s_socket;
    struct sockaddr_in s_addr;

    s_socket = socket(AF_INET, SOCK_STREAM, 0);
    if(s_socket == -1){
        cout << "error creating socket\n";
        fflush(stdout);
        return -1;
    }

    s_addr.sin_family = AF_INET;
    s_addr.sin_addr.s_addr = htonl(INADDR_ANY);
    s_addr.sin_port = htons(8080);

    if(bind(s_socket, (struct sockaddr*)&s_addr, sizeof(s_addr)) == -1){
        close(s_socket);
        cout << "binding error\n";
        fflush(stdout);
        return -1;
    }

    if(listen(s_socket, 100) == -1){
        close(s_socket);
        cout << "listening error\n";
        fflush(stdout);
        return -1;
    }

    cout << "listening...\n";
    fflush(stdout);

    while(1){
        int c_socket;
        struct sockaddr_in c_addr;
        socklen_t c_addr_len = sizeof(c_addr);
        
        c_socket = accept(s_socket, (struct sockaddr*)&c_addr, &c_addr_len);
        if(c_socket == -1){
            cout << "connection failed\n";
            fflush(stdout);
            close(c_socket);
            continue;
        }else{
            cout << "connection established\n";
            fflush(stdout);
        }

        run(c_socket);
    }
    return 0;
}
