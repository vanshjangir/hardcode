FROM node:latest

WORKDIR /app

RUN mkdir /app/codefiles

COPY package.json /app

COPY package-lock.json /app

RUN npm install

COPY adminMiddleware.js /app

COPY auth.js /app

COPY prerun.js /app

COPY index.js /app

CMD ["npm", "start"]
