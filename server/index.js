const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const app = express()
const port = 3000
const secret_key = "secret_key"
const {auth} = require('./auth')
const connectToDatabase = require('./database');

const PROBLEMS = [
    {
        title: "MergeSort",
        Acceptance: "40",
        Difficulty: "Hard",
        description: "You are given an array, sort it",
        input: " 4 4 56 221 1",
        output: "1 4 4 56 221",
    },
    {
        title: "BinarySearch",
        Acceptance: "60",
        Difficulty: "Medium",
        description: "You are given an array and a element, search the element in that array",
        input: "1, 3 4 5 6 6",
        output: "-1",
    },
    {
        title: "TwoPointers",
        Acceptance: "50",
        Difficulty: "Easy",
        description: "You are given an array, given the max sum of an sub array",
        input: "1 -1 2 3 -5",
        output: "5",
    }
]

const USERS = [
    {
        email: "vansh",
        password: "jangir"
    }
]

app.use(cors());
app.use(express.json());
app.get('/:id', (req, res) => {
    const db = connectToDatabase();
    const databaseProblem = db.collection('databaseProblem');
    const id = req.params.id;
    res.json(databaseProblem.slice(id-1, id));
})

app.post('/login', (req, res) => {
    
    const user = req.body;
    foundUser = USERS.find(x => x.email === user.email);
    if(foundUser)
        if(foundUser.password === user.password){
            const token = jwt.sign({
                id: user.email,
            }, secret_key);
            res.status(200).json({token});
        }
        else
        res.status(401).json({msg:"Incorrect Password"});
    else 
        res.status(401).send({msg:"User Not Found"});    
})

app.get('/signup', (req, res) => {

})

app.get('/problem/:id', auth, (req, res) => {
    id = req.params.id;
    foundProblem = PROBLEMS.find(x => x.title == id);
    if(foundProblem)
        res.status(200).json(foundProblem);
    else 
        res.status(404).send("Problem not found");
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
