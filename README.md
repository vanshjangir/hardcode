# HardCode
Coding platform to solve problems

### Requirements
1. node and npm
2. docker
3. docker-compose

### Build and Run, may require extra privileges
```
docker-compose build
```
```
docker-compose up
```
Append server, client or judge after build/up for only that service

### Working
The client sends the request to the server with code and additional data. The server sends the data for each testcase to a queue. Another server(judge) receives the data from the queue and runs the user code and checks its status (accepted / wrong answer / time limit exceeded / memory limit exceeded / server error) and sends the status to the another queue corresponding to that submission only. The main server receives the data from that queue and checks the code for all the testcases.\
It can be scaled by just adding more judge servers.

### TODO
- [ ] Multi Language Support (currently only supports python submissions)
- [x] Scaling the submission backend
- [x] Decent Frontend
- [x] Memory Limit and Time Limit
- [ ] SSL
