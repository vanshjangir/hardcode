FROM gcc:latest

WORKDIR /app

RUN mkdir codefiles

COPY main.cpp /app

RUN g++ main.cpp -o main

CMD ["./main"]
