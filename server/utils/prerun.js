const fs = require('fs')
const net = require('net')
require('dotenv').config()
const {MongoClient} = require('mongodb')

function connectMongoDB(){
  const uri = process.env.MONGODB_URI
  const client = new MongoClient(uri);
  const db = client.db('hardcode');
  return db;
}


function createDockerClient(dport, dhost){
  const docker_client = new net.Socket();
  try{
    docker_client.connect(dport, dhost);
    console.log("connected to docker client");
    return docker_client;
  }
  catch(error){
    console.log("Error in connection:", error);
    return null;
  }
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
