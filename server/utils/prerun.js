require('dotenv').config()
const amqp = require('amqplib/callback_api')
const {MongoClient} = require('mongodb')

function connectMongoDB(){
  const uri = process.env.MONGODB_URI
  const client = new MongoClient(uri);
  const db = client.db('hardcode');
  return db;
}

function connectToRabbitmq(){

  return new Promise((resolve, reject) => {
    amqp.connect('amqp://localhost', async function(err, connection){
      if(err){
        throw err;
      }
      connection.createChannel( async function(err1, channel){
        if(err1){
          reject(null);
          console.log("Connection to Rabbitmq unsuccessful")
        }else{
          console.log("Connection to Rabbitmq successful")
          resolve(channel);
        }
      })
    })
  })
}

module.exports = {
  connectMongoDB: connectMongoDB,
  connectToRabbitmq,
};
