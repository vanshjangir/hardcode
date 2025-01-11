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


async function runTestcase(givenProblem, userSubmission) {
  for (let i = 0; i < givenProblem.testcase.length; i++) {
    const replyQueue = `${userSubmission.username}_${userSubmission.title}_t${i+1}`;
    
    await rmqChannel.assertQueue(replyQueue, { durable: false });
    
    const problemData = {
      id: replyQueue,
      memlimit: givenProblem.memlimit,
      timelimit: givenProblem.timelimit,
      input: givenProblem.testcase[i].input,
      output: givenProblem.testcase[i].output,
      code: userSubmission.code,
    };

    const consumePromise = consumeMessage(replyQueue);
    
    await rmqChannel.sendToQueue('codejudge', Buffer.from(JSON.stringify(problemData)));

    try {
      const recvData = await consumePromise;
      
      if (recvData.status !== "ACCEPTED") {
        return {
          result: recvData.status,
          log: recvData.status === "WRONG ANSWER" 
            ? `Wrong answer at testcase ${i+1}`
            : recvData.err,
          input: givenProblem.testcase[i].input,
          output: givenProblem.testcase[i].output,
          youroutput: recvData.useroutput,
        };
      }
    } catch (error) {
      console.error(`Error processing testcase ${i+1}:`, error);
      return { result: "SERVER ERROR", log: "Internal Server Error" };
    }
  }
  
  return { result: "ACCEPTED", log: "All Testcase Passed" };
}

async function consumeMessage(replyQueue) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error("Timeout waiting for response"));
    }, 100000);

    const consumer = rmqChannel.consume(replyQueue, async (msg) => {
      if (msg != null) {
        cleanup();
        const recvData = JSON.parse(msg.content.toString());
        await rmqChannel.deleteQueue(replyQueue);
        resolve(recvData);
      }
    }, { noAck: true });

    function cleanup() {
      clearTimeout(timeoutId);
      if (consumer && consumer.consumerTag) {
        rmqChannel.cancel(consumer.consumerTag).catch(console.error);
      }
    }
  });
}

module.exports = router;
