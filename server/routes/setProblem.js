const express = require('express');
const router = express.Router();
const {admin} = require('../utils/adminMiddleware');

router.post('/', admin, async (req, res) => {
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

module.exports = router;
