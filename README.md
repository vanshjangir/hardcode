# EasyCode

### TODO
1. Multi Language Support (currently only supports cpp submissions)

### Requirements
1. node and npm
2. docker
3. MongoDB

### Build
1. In the client and server directory
```
npm install
```
2. In the container directory
```
docker build -t code-runner .
```

### Run
1. In the client directory
```
npm run dev
```
2. In the server directory (with sudo if linux)
```
npm start
```
