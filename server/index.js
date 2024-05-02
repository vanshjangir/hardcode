const fs = require('fs')
const express = require('express')
const jwt = require('jsonwebtoken')
const cors = require('cors')

const {auth} = require('./auth')
const {admin} = require('./adminMiddleware')
const {createDockerClient, loadFiles} = require('./prerun');
const {connectMongoDB} = require('./prerun');

const port = 3000
const secret_key = "secret_key"

const app = express()

app.use(cors());
app.use(express.json());

app.get('/:id', async (req, res) => {
  const databaseProblem = await db.collection('problems').find({}).toArray();
  const id = req.params.id;
  res.json(databaseProblem.slice(2*(id-1),2*id));
})

app.post('/login', async (req, res) => {
    
  const user = req.body;
  let role = "user";
  const USERS = await db.collection('users').find({}).toArray();
  const ADMIN = await db.collection('admins').find({}).toArray();

  foundAdmin = ADMIN.find(x => x.email === user.email && x.password === user.password);
  foundUser = USERS.find(x => x.email === user.email);
  
  if(foundAdmin)
    role = "admin";
  if(foundUser)
    if(foundUser.password === user.password){
      const token = jwt.sign({
        id: user.email,
        role: role,
      }, secret_key);
      res.status(200).json({token});
    }
    else
      res.status(401).json({msg:"Incorrect Password"});
  else 
    res.status(401).send({msg:"User Not Found"});    
})

app.post('/signup', async (req, res) => {
  const user = req.body;
  const USERS = await db.collection('users').find({}).toArray();
  const userCollection = db.collection('users');
  
  foundUser = USERS.find(x => x.email === user.email);
  if(foundUser){
    return res.status(409).send({msg:"user already exists"});
  }
  
  userCollection.insertOne(user);
  return res.status(200).send('successful');
})

app.get('/problem/:id', auth, async (req, res) => {
  const databaseProblem = await db.collection('problems').find({}).toArray();
  
  id = req.params.id;
  foundProblem = databaseProblem.find(x => x.title == id);
  if(foundProblem)
    res.status(200).json(foundProblem);
  else 
    res.status(404).send("Problem not found");
})

app.post('/setproblem', admin, async (req, res) => {
  const takeProblem = req.body;

  const databaseProblem = db.collection('problems');
  const problemArray = await databaseProblem.find({}).toArray();
  
  const foundProblem = problemArray.find(x => x.title === takeProblem.title);
  if(foundProblem){
    res.status(400).json({msg: "problem title exists"});
  }
  else{
    databaseProblem.insertOne(takeProblem);
    res.status(200).json({msg: "successful"});
  }
});


async function checkTestcase(useroutput, acutaloutput){
  acutaloutput = acutaloutput.trim()
  let numTestcases = 1;
  let ituser = 0;
  const useroutputArray = useroutput.split("\n");
  const actualoutputArray = acutaloutput.split("\n");

  for(let i=0; i<actualoutputArray.length; i++){
    if(actualoutputArray[i] === ''){
      numTestcases++;
      continue;
    }
    if(useroutputArray[ituser++] != actualoutputArray[i]){
      return {result: "WA", log: `wrong answer at testcase ${numTestcases}\n${useroutput}`};
    }
  }
  return {result: "AC", log: `accepted`};
}

app.post('/submission', auth, async (req, res) => {
  const userSubmission = req.body;
  const databaseProblem = await db.collection('problems').find({}).toArray();
  const givenProblem = databaseProblem.find(x => x.title === userSubmission.title);

  const docker_client = createDockerClient(8080, "144.144.144.122");
  loadFiles(userSubmission.username+"_"+userSubmission.title);
  
  fs.writeFileSync(
    `./codefiles/usercode_${userSubmission.username}_${userSubmission.title}.cpp`,
    userSubmission.code, 'utf-8');

  if(userSubmission.type == 'run'){
    fs.writeFileSync(
      `./codefiles/input_${userSubmission.username}_${userSubmission.title}.txt`,
      givenProblem.input, 'utf-8' );
  }else{
    fs.writeFileSync(
      `./codefiles/input_${userSubmission.username}_${userSubmission.title}.txt`,
      givenProblem.testcaseinput, 'utf-8' );
  }

  const subData = userSubmission.username + "_" +
    userSubmission.title + "\0" +
    givenProblem.timelimit + "\0" +
    givenProblem.memlimit + "\0";

  docker_client.write(subData);
  docker_client.on('data', async (data) => {

    const result = data.toString();
    const fileoutput = fs.readFileSync(
      `./codefiles/useroutput_${userSubmission.username}_${userSubmission.title}.txt`,
      'utf-8').trim();
    const fileerror = fs.readFileSync(
      `./codefiles/error_${userSubmission.username}_${userSubmission.title}.txt`,
      'utf-8');

    console.log(`result is:${result}`);
    
    if(result != "SUCCESS"){
      return res.status(200).json({result: result, log: fileerror});
    }

    console.log(fileoutput);

    if(userSubmission.type === 'run'){
      if(fileoutput == givenProblem.output){
        res.status(200).json({result: "AC", log: "accept"});
      }
      else{
        res.status(200).json({result: "WA", log: fileoutput});
      }
    }else{
      const testResult = await checkTestcase(fileoutput, givenProblem.testcaseoutput);
      res.status(200).json({result: testResult.result, log: testResult.log})
    }

  });
})

const db = connectMongoDB();

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})

module.exports = app;
