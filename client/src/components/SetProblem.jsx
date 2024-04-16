import { useState } from "react";
import '../index.css'

const SetProblem = () => {

  const [problemTitle, typeProblemTitle] = useState("");
  const [problemAcceptance, typeProblemAcceptance] = useState("");
  const [problemDescription, typeProblemDescription] = useState("");
  const [problemDifficulty, typeProblemDifficulty] = useState("");
  const [problemInput, typeProblemInput] = useState("");
  const [problemOutput, typeProblemOutput] = useState("");
  
  const token = localStorage.getItem('token'); 

  const submitProblem = async () => {
    const response = await fetch(`http://144.144.144.144:3000/setproblem`, {
      method: "POST",
      body: JSON.stringify({
        title: problemTitle,
        description: problemDescription,
        acceptance: problemAcceptance,
        difficulty: problemDifficulty,
        input: problemInput,
        output: problemOutput,
      }),
      headers: {
        'Content-Type': 'application/json',
        authorization: token,
      }
    });

    const json = await response.json();
    console.log(json);
    
  } 

  return (
    <div>
      <input placeholder="title" onChange={(e)=> typeProblemTitle(e.target.value)}/>
      <input placeholder="description" onChange={(e)=> typeProblemDescription(e.target.value)}/>
      <input placeholder="acceptance" onChange={(e)=> typeProblemAcceptance(e.target.value)}/>
      <input placeholder="difficulty" onChange={(e)=> typeProblemDifficulty(e.target.value)}/>
      <input placeholder="input" onChange={(e)=> typeProblemInput(e.target.value)}/>
      <input placeholder="output" onChange={(e)=> typeProblemOutput(e.target.value)}/>
      <button type="button" onClick={submitProblem}>submit</button>
    </div>
  )
}

export default SetProblem;
