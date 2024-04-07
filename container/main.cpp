#include <iostream>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <fstream>
using namespace std;

int main(int argc, char **argv){

    int s_socket;
    int c_socket;
    struct sockaddr_in s_addr;
    struct sockaddr_in c_addr;
    socklen_t c_addr_len = sizeof(c_addr);
    fstream error_file("codefiles/error.txt");

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

    if(listen(s_socket, 10) == -1){
        close(s_socket);
        cout << "listening error\n";
        fflush(stdout);
        return -1;
    }

    cout << "listening...\n";
    fflush(stdout);

    c_socket = accept(s_socket, (struct sockaddr*)&c_addr, &c_addr_len);
    if(c_socket == -1){
        cout << "connection failed\n";
        fflush(stdout);
        close(c_socket);
        return -1;
    }else{
        cout << "connection established\n";
        fflush(stdout);
    }

    while(1){
        char buffer[256];
        int compilationCode;
        recv(c_socket, buffer, sizeof(buffer), 0);

        const char* compileCommand = "g++ codefiles/user_code.cpp -o codefiles/user_code 2> codefiles/error.txt";
        
        compilationCode = system(compileCommand);

        if(compilationCode != 0){
            error_file << "COMPILATION ERROR\n";
            fflush(stdout);

            send(c_socket, "incomplete", 10, 0);
            cout << "user fucked up\n";
            fflush(stdout);
            continue;
        }

        const char* executeCommand = "./codefiles/user_code < codefiles/input.txt > codefiles/useroutput.txt 2> codefiles/error.txt";
        int executionCode = system(executeCommand);

        send(c_socket, "complete", 8, 0);
        cout << "result sent\n";
        fflush(stdout);
        continue;
    }
    return 0;
}
