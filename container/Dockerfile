FROM gcc:latest

WORKDIR /app

COPY main.cpp ./

RUN g++ main.cpp -o main

CMD ["./main", "<", "input.txt" , ">", "useroutput.txt", "2>", "error.txt"]
