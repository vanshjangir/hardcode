const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const app = express()
const port = 3000
const secret_key = "secret_key"
const {auth} = require('./auth')
const {admin} = require('./adminMiddleware')
const dbModule = require('./database');


app.use(cors());
app.use(express.json());
app.get('/:id', async (req, res) => {
    const db = await dbModule.connectToDatabase();
    const databaseProblem = await db.collection('databaseProblem').find({}).toArray();

    const id = req.params.id;
    res.json(databaseProblem.slice(id-1,id));
})

app.post('/login', async (req, res) => {
    
    const user = req.body;
    let role = "user";
    const db = await dbModule.connectToDatabase();
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

//app.post('/signup', async (req, res) => {
//    const user = req.body;
//    const db = await dbModule.connectToDatabase();
//    const USERS = await db.collection('users').find({}).toArray();
//})

app.get('/problem/:id', auth, async (req, res) => {
    const db = await dbModule.connectToDatabase();
    const databaseProblem = await db.collection('databaseProblem').find({}).toArray();
    
    id = req.params.id;
    foundProblem = databaseProblem.find(x => x.title == id);
    if(foundProblem)
        res.status(200).json(foundProblem);
    else 
        res.status(404).send("Problem not found");
})

app.post('/setproblem', admin, async (req, res) => {
    const db = await dbModule.connectToDatabase();
    const takeProblem = req.body;

    const databaseProblem = db.collection('databaseProblem');
    databaseProblem.insertOne(takeProblem);
    res.send('successful');
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
