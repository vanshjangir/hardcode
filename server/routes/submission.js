const express = require('express');
const router = express.Router();
const fs = require('fs')
const {auth} = require('../utils/auth');
const {createDockerClient, loadFiles} = require('../utils/prerun');

async function runTestCase(userSubmission, givenProblem, i) {

  const docker_client = createDockerClient(8080, "144.144.144.122");

  loadFiles(userSubmission.username + "_" + userSubmission.title);

  fs.writeFileSync(
    `./codefiles/usercode_${userSubmission.username}_${userSubmission.title}.cpp`,
    userSubmission.code, 'utf-8'
  );

  fs.writeFileSync(
    `./codefiles/input_${userSubmission.username}_${userSubmission.title}.txt`,
    givenProblem.testcase[i].input, 'utf-8'
  );

  const subData = userSubmission.username + "_" +
    userSubmission.title + "\0" +
    givenProblem.timelimit + "\0" +
    givenProblem.memlimit + "\0";

  docker_client.write(subData);

  const data = await new Promise((resolve) => {
    docker_client.on('data', (data) => {
      resolve(data);
    });
  });

  const result = data.toString();
  const fileoutput = fs.readFileSync(
    `./codefiles/useroutput_${userSubmission.username}_${userSubmission.title}.txt`,
    'utf-8'
  ).trim();
  const fileerror = fs.readFileSync(
    `./codefiles/error_${userSubmission.username}_${userSubmission.title}.txt`,
    'utf-8'
  );

  console.log(`result is:${result}`);

  if(result !== "SUCCESS"){
    return {result: result, log: fileerror};
  }
  
  console.log(fileoutput);
  if(fileoutput !== givenProblem.testcase[i].output){
    return {result: "WRONG ANSWER", log: `wrong answer on testcase ${i+1}`, youroutput: fileoutput, output: givenProblem.testcase[i].output, input: givenProblem.testcase[i].input};
  }
  else{
    return {result: "ACCEPTED", log: `All testcase passed`};
  }
}


router.post('/', auth, async (req, res) => {
  const userSubmission = req.body;
  const databaseProblem = await db.collection('problems').find({}).toArray();
  const givenProblem = databaseProblem.find(x => x.title === userSubmission.title);

  for(let i=0; i<givenProblem.testcase.length; i++){
    const testcaseResult = await runTestCase(userSubmission, givenProblem, i);
    if(testcaseResult.result !== "ACCEPTED"){
      return res.status(200).json(testcaseResult);
    }
  }
  res.status(200).json({result: "ACCEPTED", log: "All testcase passed"});
});

module.exports = router;
