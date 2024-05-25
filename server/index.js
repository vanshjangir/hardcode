require('dotenv').config()

const express = require('express')
const cors = require('cors')
const app = express()
const port = process.env.PORT
const loginRoute = require('./routes/login');
const signupRoute = require('./routes/signup');
const homeRoute = require('./routes/home');
const problemRoute = require('./routes/problem');
const setProblemRoute = require('./routes/setProblem');
const submissionRoute = require('./routes/submission');

const {connectMongoDB} = require('./utils/prerun');
const db = connectMongoDB();

global.db = db;

app.use(cors());
app.use(express.json());

app.use('/', homeRoute)
app.use('/login', loginRoute);
app.use('/signup', signupRoute);
app.use('/problem', problemRoute);
app.use('/setproblem', setProblemRoute);
app.use('/submission', submissionRoute);

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})

module.exports = app;
