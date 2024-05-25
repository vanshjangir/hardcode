const express = require('express');
const router = express.Router();
const {auth} = require('../utils/auth');

router.get('/:id', auth, async (req, res) => {
  const databaseProblem = await db.collection('problems').find({}).toArray();
  
  id = req.params.id;
  foundProblem = databaseProblem.find(x => x.title == id);
  if(foundProblem)
    res.status(200).json(foundProblem);
  else 
    res.status(404).send("Problem not found");
})

module.exports = router;
