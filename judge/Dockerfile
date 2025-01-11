FROM alpine:latest AS build

RUN apk add --no-cache g++ go

COPY . .

RUN g++ -static run/main.cpp -o run/main
RUN go build -o judge .

FROM python:3.12-alpine

WORKDIR /app

RUN mkdir run
RUN touch run/INPUT \
    run/OUTPUT \
    run/ERROR \
    run/usercode.py \
    run/META \
    run/STATUS

COPY --from=build run/main /app/run/
COPY --from=build judge /app/

ENTRYPOINT ["/app/judge"]
