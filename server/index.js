const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const app = express()
const port = 3000
const secret_key = "secret_key"
const {auth} = require('./auth')
const {admin} = require('./adminMiddleware')
const fs = require('fs')
const { exec } = require('child_process');

const {MongoClient} = require('mongodb')
const uri = "mongodb+srv://vansh:kWZ2MMhvZV2yJcst@hardcode.b6g1pwr.mongodb.net/?retryWrites=true&w=majority&appName=hardcode"
const client = new MongoClient(uri);
const db = client.db('hardcode');

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
        return res.send("user already exists");
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
    databaseProblem.insertOne(takeProblem);
    res.send('successful');
})

app.post('/submission', auth, async (req, res) => {
    const userSubmission = req.body;
    const databaseProblem = await db.collection('problems').find({}).toArray();
    const givenProblem = databaseProblem.find(x => x.title === userSubmission.title);
    
    fs.writeFileSync('./container/user_code.cpp', userSubmission.code, 'utf-8');
    fs.writeFileSync('./container/input.txt', givenProblem.input, 'utf-8' );
    fs.writeFileSync('./container/output.txt', givenProblem.output, 'utf-8');
    fs.writeFileSync('./container/useroutput.txt', '','utf-8');
    fs.writeFileSync('./container/error.txt', '','utf-8');
    
    const dockerCommand = `sudo docker run --rm \
    -v ./user_code.cpp:/app/user_code.cpp \
    -v ./input.txt:/app/input.txt \
    -v ./output.txt:/app/output.txt \
    -v ./useroutput.txt:/app/useroutput.txt \
    -v ./error.txt:/app/error.txt code-runner`;

    exec(dockerCommand, {cwd: './container/'}, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error}`);
            res.status(500).send(`Error: ${error}`);
            return;
        }
        
        const fileoutput = fs.readFileSync('./container/useroutput.txt', 'utf-8');
        console.log(fileoutput);
        if(fileoutput == givenProblem.output){
            res.status(200).json({result: "ACCEPTED"});     
        }
        else{
            res.status(200).json({result: "WRONG ANSWER"});     
        }
    });

})

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})

module.exports = app;
