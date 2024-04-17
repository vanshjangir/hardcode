const fs = require('fs')
const net = require('net')
const {MongoClient} = require('mongodb')

function connectMongoDB(){
  const uri = "mongodb+srv://vansh:kWZ2MMhvZV2yJcst@hardcode.b6g1pwr.mongodb.net/?retryWrites=true&w=majority&appName=hardcode"
  const client = new MongoClient(uri);
  const db = client.db('hardcode');
  return db;
}


function createDockerClient(dport, dhost){
  const docker_client = new net.Socket();
  docker_client.connect(dport, dhost);
  console.log("connected to docker client");
  return docker_client;
}

function loadFiles(id){
  fs.writeFileSync(`./codefiles/usercode_${id}.cpp`, '', 'utf8');
  fs.writeFileSync(`./codefiles/useroutput_${id}.txt`, '', 'utf8');
  fs.writeFileSync(`./codefiles/input_${id}.txt`, '', 'utf8');
  fs.writeFileSync(`./codefiles/error_${id}.txt`, '', 'utf8');
}

module.exports = {
  createDockerClient: createDockerClient,
  connectMongoDB: connectMongoDB,
  loadFiles
};
