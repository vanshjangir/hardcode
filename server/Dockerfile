FROM node:latest

WORKDIR /app

COPY package.json /app

COPY package-lock.json /app

RUN npm install

RUN mkdir container

COPY container/ /app/container

COPY adminMiddleware.js /app

COPY auth.js /app

COPY index.js /app

CMD ["npm", "start"]
