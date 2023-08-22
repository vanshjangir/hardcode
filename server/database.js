const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017'; 
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

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

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db('leetcodeDB');

    const databaseProblem = db.collection('databaseProblem');
    const checkCollection = await db.listCollections({name: 'databaseProblem'}).toArray();

    if(checkCollection.length <= 0){
      await db.createCollection('databaseProblem');
      console.log('created new collection- problem'); 
    }
    
    for(const problem of PROBLEMS){
        await databaseProblem.insertOne(problem);
    }

    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

module.exports = {
  connectToDatabase: connectToDatabase,
};

