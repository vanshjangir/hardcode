FROM node:alpine AS builder

WORKDIR /app

RUN apk add --no-cache gcc g++

RUN mkdir /app/run

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

FROM node:alpine

WORKDIR /app

RUN apk add --no-cache gcc g++

COPY --from=builder /app/run/main /app/run/main
COPY --from=builder /app/node_modules /app/node_modules
COPY index.js /app/index.js

CMD ["npx", "nodemon", "start"]
