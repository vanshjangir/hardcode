FROM node:latest

WORKDIR /app

COPY package.json /app

COPY package-lock.json /app

RUN npm install

COPY .eslintrc.cjs /app

COPY vite.config.js /app

COPY index.html /app

COPY public /app

RUN mkdir /app/src

COPY src/assets /app/src/assets

COPY src/App.jsx /app/src

COPY src/main.jsx /app/src

COPY src/index.css /app/src

COPY src/components /app/src/components

COPY .env /app

CMD ["npm", "run", "dev"]
