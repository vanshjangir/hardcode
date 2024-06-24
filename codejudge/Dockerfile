FROM ubuntu:latest

WORKDIR /app

RUN mkdir /app/run

RUN apt-get update && apt-get install -y \
    nodejs \
    npm

RUN touch run/INPUT \
    run/OUTPUT \
    run/ERROR \
    run/usercode.cpp \
    run/META \
    run/STATUS

COPY package.json /app

COPY package-lock.json /app

RUN npm install

COPY run/main.cpp /app/run/main.cpp

RUN g++ run/main.cpp -o run/main

COPY index.js /app

CMD ["npx", "nodemon", "start"]
