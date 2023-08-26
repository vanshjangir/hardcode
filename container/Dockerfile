FROM gcc:latest

WORKDIR /usr/src/app

COPY main.cpp input.txt ./

RUN g++ main.cpp -o app

CMD ["./app", "<", "input.txt"]
