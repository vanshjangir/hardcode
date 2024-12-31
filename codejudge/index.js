const fs = require('fs');
const {exec} = require('child_process')
const amqp = require('amqplib/callback_api');

amqp.connect('amqp://rabbitmq', function(err, connection){
  if(err){
    throw err;
  }
  connection.createChannel( async function(err1, channel){
    if(err1){
      throw err1;
    }
    
    let mainQueue = 'codejudge';
    let recvData;

    channel.assertQueue(mainQueue, {durable: false});
    channel.consume(mainQueue, async function(msg){
      recvData = await JSON.parse(msg.content.toString());
      console.log(recvData)

      const id = recvData.id;
      const metadata = `${recvData.timelimit}\0${recvData.memlimit}\0`

      fs.writeFileSync("run/usercode.cpp", recvData.code, (err)=>{if(err){
        console.log("Error opening usercode.cpp")
      }})
      fs.writeFileSync("run/INPUT", recvData.input, (err)=>{if(err){
        console.log("Error opening INPUT")
      }})
      fs.writeFileSync("run/OUTPUT", "", (err)=>{if(err){
        console.log("Error opening OUTPUT")
      }})
      fs.writeFileSync("run/ERROR", "", (err)=>{if(err){
        console.log("Error opening ERROR")
      }})
      fs.writeFileSync("run/STATUS", "", (err)=>{if(err){
        console.log("Error opening STATUS")
      }})
      fs.writeFileSync("run/META", metadata, (err)=>{if(err){
        console.log("Error opening META")
      }})

      const result = await testCode(recvData.output);

      channel.assertQueue(id, {durable: false});
      channel.sendToQueue(id, Buffer.from(JSON.stringify(result)))

      console.log("sent it:",result);

    },{noAck: true});
  });
});


async function testCode(output){
  return new Promise((resolve, reject) => {
    exec("/app/run/main", {cwd: '/app/run/'}, (err) => {
      if (err) {
        console.error(err);
        reject(null);
        return;
      }

      const userOutput = fs.readFileSync('./run/OUTPUT', 'utf-8');
      const status = fs.readFileSync('./run/STATUS', 'utf-8');
      const error = fs.readFileSync('./run/ERROR', 'utf-8');
      let result;

      if(status === "SUCCESS"){
        if(userOutput.trimEnd() === output.trimEnd()){
          result = {status: "ACCEPTED", err: null, useroutput: userOutput};
        }
        else{
          result = {status: "WRONG ANSWER", err: null, useroutput: userOutput};
        }
      }else{
        result = {status: status, err: error, useroutput: userOutput};
      }
      resolve(result);
    });
  })
}
