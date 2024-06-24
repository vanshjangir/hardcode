const express = require('express');
const router = express.Router();
const {auth} = require('../utils/auth');
const {connectToRabbitmq} = require('../utils/prerun');
let rmqChannel;

router.post('/', auth, async (req, res) => {
  const userSubmission = req.body;
  const databaseProblem = await db.collection('problems').find({}).toArray();
  const givenProblem = databaseProblem.find(x => x.title === userSubmission.title);

  if(!rmqChannel){
    rmqChannel = await connectToRabbitmq()
  }
  res.status(200).json(await runTestcase(givenProblem, userSubmission));
});


async function runTestcase(givenProblem, userSubmission){
  for(let i=0; i<givenProblem.testcase.length; i++){
    var mainQueue = 'codejudge';
    var replyQueue = `${userSubmission.username}_${userSubmission.title}_t${i+1}`;
    var problemData = {
      id: `${userSubmission.username}_${userSubmission.title}_t${i+1}`,
      memlimit: givenProblem.memlimit,
      timelimit: givenProblem.timelimit,
      input: givenProblem.testcase[i].input,
      output: givenProblem.testcase[i].output,
      code: userSubmission.code,
    }

    await rmqChannel.assertQueue(mainQueue, {durable: false});
    await rmqChannel.sendToQueue(mainQueue, Buffer.from(JSON.stringify(problemData)));
    await rmqChannel.assertQueue(replyQueue, {durable: false})

    try{
      const recvData = await consumeMessage(replyQueue);
      if(recvData.status != "ACCEPTED"){
        const submission = {
          result: "",
          log: "",
          input: givenProblem.testcase[i].input,
          output: givenProblem.testcase[i].output,
          youroutput: recvData.useroutput,
        }
        if(recvData.status === "WRONG ANSWER"){
          submission.result = "WRONG ANSWER";
          submission.log =  `Wrong answer at testcase ${i+1}`;
        }else{
          submission.result = recvData.status;
          submission.log = recvData.err;
        }
        return submission;
      }
    }catch{
      return {result: "SERVER ERROR", log: "Internal Server Error"};
    }
  }
  return {result: "ACCEPTED", log: "All Testcase Passed"}
}

async function consumeMessage(replyQueue){
  return new Promise((resolve, reject) => {
    rmqChannel.consume(replyQueue, async (msg) => {
      if(msg != null){
        const recvData = JSON.parse(msg.content.toString());
        await rmqChannel.deleteQueue(replyQueue);
        resolve(recvData);
      }
      else{
        reject(new Error("No data available on replyQueue"));
      }
    }, {noAck: true});
  });
}

module.exports = router;
