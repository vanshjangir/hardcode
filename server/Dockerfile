FROM node:alpine

WORKDIR /app

RUN mkdir /app/codefiles

RUN mkdir /app/routes

RUN mkdir /app/utils

COPY package.json /app

COPY package-lock.json /app

RUN npm install

COPY .env /app

COPY routes /app/routes

COPY utils /app/utils

COPY index.js /app

CMD ["npx", "nodemon", "start"]
