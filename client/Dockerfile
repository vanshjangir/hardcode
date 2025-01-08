FROM node:alpine AS builder

WORKDIR /app

COPY package.json /app

COPY package-lock.json /app

RUN npm install

COPY . .

COPY .env /app

RUN npm run build

FROM nginx:stable-alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
