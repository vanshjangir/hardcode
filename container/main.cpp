#include <iostream>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <thread>
using namespace std;

void run(int c_socket){
    int rc;
    char id[64];
    char compileCommand[256];
    char executeCommand[256];

    rc = recv(c_socket, id, sizeof(id), 0);
    if(rc <= 0){
        return;
    }else{
        printf("received id: %s\n", id);
    }

    snprintf(compileCommand, 256, "g++ codefiles/usercode_%s.cpp \
            -o codefiles/usercode_%s 2> codefiles/error_%s.txt", id, id, id);
    snprintf(executeCommand, 256, "./codefiles/usercode_%s < codefiles/input_%s.txt \
            1> codefiles/useroutput_%s.txt 2> codefiles/error_%s.txt", id, id, id, id);

    rc = system(compileCommand);
    if(rc != 0){
        send(c_socket, "COMPILATION_ERROR", 17, 0);
        close(c_socket);
        cout << "COMPILATION_ERROR\n";
        fflush(stdout);
        return;
    }
    
    rc = system(executeCommand);
    if(rc != 0){
        send(c_socket, "RUNTIME_ERROR", 13, 0);
        close(c_socket);
        cout << "RUNTIME_ERROR\n";
        fflush(stdout);
        return;
    }

    send(c_socket, "SUCCESS", 7, 0);
    close(c_socket);
    cout << "SUCCESS\n";
    fflush(stdout);
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

        thread runThread(run, c_socket);
        runThread.detach();
    }
    return 0;
}
