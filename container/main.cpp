#include<iostream>
#include<cstdlib>
using namespace std;

int main(){
    const char* compileCommand = "g++ user_code.cpp -o user_code";
    int compilationCode = system(compileCommand);

    if(compilationCode != 0){
        cerr << "COMPILATION FAILED" << endl;
        return compilationCode;
    }

    const char* executeCommand = "./user_code < input.txt > useroutput.txt 2> error.txt";
    int executionCode = system(executeCommand);

    if(executionCode != 0){
        cerr << "EXECUTION FAILED" << endl;
        return executionCode;
    }

    return 0;
}
