#include <iostream>
#include <fstream>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <sys/resource.h>
#include <sys/wait.h>
#include <fcntl.h>

#define INTERNAL_SERVER_ERROR   -4
#define SUCCESSFUL              0

using namespace std;

void out(string s, int statusCode){
    ofstream file("STATUS");
    file << s;
    fflush(stdout);
}

void parse(const char buffer[], char timeMAX[], char memMAX[]){

    int c=0;
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

void run(){
    int rc;
    pid_t pid;
    string buffer;
    char timeMAX[5];
    char memMAX[5];
    char compileCommand[256];
    char execute[100];
    char input[100];
    char useroutput[100];
    char error[100];

    ifstream file("META");
    getline(file, buffer);
    parse(buffer.c_str(), timeMAX, memMAX);

    snprintf(compileCommand, 256, "g++ usercode.cpp -o usercode 2> ERROR");
    snprintf(execute, 100, "./usercode");
    snprintf(input, 100, "INPUT");
    snprintf(useroutput, 100, "OUTPUT");
    snprintf(error, 100, "ERROR");

    rc = system(compileCommand);
    if(rc != 0){
        out("COMPILATION_ERROR", 0);
        return;
    }

    pid = fork();
    if(pid == -1){
        out("INTERNAL_ERROR", 0);
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
                out("SUCCESS", exitStatus);
            }
            else if(exitStatus == INTERNAL_SERVER_ERROR){
                out("INTERNAL_ERROR", exitStatus);
            }
            else{
                out("RUNTIME_ERROR", exitStatus);
            }
        }
        else if(WIFSIGNALED(status)){
            int signal = WTERMSIG(status);
            cout << "SIGNALED\n";
            
            if(signal == SIGSEGV){
                out("MEMORY_LIMIT_EXCEEDED", signal);
            }
            else if(signal == SIGXCPU){
                out("TIME_LIMIT_EXCEEDED", signal);
            }
            else{
                out("SOMETHING_ELSE", signal);
            }
        }
    }
}

int main(int argc, char **argv){

    run();
    return 0;
}
