### BASIC WORKING
The client sends a request containing the code, problem id, etc to the server. The nodejs server gets the code and writes it in a file, and also write the corresponding input in a file.\
A Docker container (code runner) is listening for a tcp connection, the nodejs server connects to the code runner and sends the name of the file, memlimit, timelimit etc.\
The code runner runs the user submitted code and redirects the output to another file. The nodejs server reads the output file and checks it.\
The code runner and nodejs server runs on different docker containers and shares a volume and a network. The code runner upon running the code sends the response (SUCCESS, COMPILATION_ERROR, MEMLIMT_EXCEEDED etc)
to the node js server. The nodejs server then sends the appropriate response to the client.

### HOW IT SCALES
Just spawns multiple code runners and round robin the submission requests to them (currently not implemented).\
Also not sharing the volume and just sending the whole code directly to the code runners can be a better solution as then the code runners can be deployed separately on different machines.

### ANOTHER APPROACH
Using a messaging queue. It is simpler to manage than to do health checks to the code runners and then manage requests among them as discussed above.
