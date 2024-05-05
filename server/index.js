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
    return {result: "WA", log: `wrong answer on testcase ${i+1}`, youroutput: fileoutput, output: givenProblem.testcase[i].output, input: givenProblem.testcase[i].input};
  }
  else{
    return {result: "AC", log: `accepted`};
  }
}

app.post('/submission', auth, async (req, res) => {
  const userSubmission = req.body;
  const databaseProblem = await db.collection('problems').find({}).toArray();
  const givenProblem = databaseProblem.find(x => x.title === userSubmission.title);

  for(let i=0; i<givenProblem.testcase.length; i++){
    const testcaseResult = await runTestCase(userSubmission, givenProblem, i);
    if(testcaseResult.result !== "AC"){
      return res.status(200).json(testcaseResult);
    }
  }
  res.status(200).json({result: "AC", log: "accept"});
})

const db = connectMongoDB();

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})

module.exports = app;
