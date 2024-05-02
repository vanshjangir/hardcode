import { useState } from "react";
import './style/setproblem.css'

const SetProblem = () => {

  const [problemTitle, typeProblemTitle] = useState("");
  const [problemDescription, typeProblemDescription] = useState("");
  const [problemDifficulty, typeProblemDifficulty] = useState("");
  const [problemInput, typeProblemInput] = useState("");
  const [problemOutput, typeProblemOutput] = useState("");
  const [problemTestcaseInput, typeProblemTestcaseInput] = useState("");
  const [problemTestcaseOutput, typeProblemTestcaseOutput] = useState("");
  const [problemMemLimit, typeProblemMemLimit] = useState("");
  const [problemTimeLimit, typeProblemTimeLimit] = useState("");
  const [result, setResult] = useState("");
  
  const token = localStorage.getItem('token'); 

  const submitProblem = async () => {
    setResult("updating...");
    const response = await fetch(`http://144.144.144.144:3000/setproblem`, {
      method: "POST",
      body: JSON.stringify({
        title: problemTitle,
        description: problemDescription,
        difficulty: problemDifficulty,
        input: problemInput,
        output: problemOutput,
        testcaseinput: problemTestcaseInput,
        testcaseoutput: problemTestcaseOutput,
        memlimit: problemMemLimit,
        timelimit: problemTimeLimit,
      }),
      headers: {
        'Content-Type': 'application/json',
        authorization: token,
      }
    });

    const json = await response.json();
    setResult(json.msg);
    console.log(json);
    
  } 

  return (
    <div id="setproblem">
      <h2>Set Problem</h2>
      <p>NOTE: Only Admins can set a problem</p>
      <table>
        <tbody>
          <tr>
            <td>
              Title
            </td>
            <td>
              <textarea placeholder="title" onChange={(e)=> typeProblemTitle(e.target.value)}/>
            </td>
          </tr>
          <tr>
            <td>
              Description
            </td>
            <td>
              <textarea placeholder="description" id="description-area" onChange={(e)=> typeProblemDescription(e.target.value)}/>
            </td>
          </tr>
          <tr>
            <td>
              Difficulty
            </td>
            <td>
              <select onChange={(e)=> typeProblemDifficulty(e.target.value)}>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>
              Input
            </td>
            <td>
              <textarea placeholder="example input" className="io" onChange={(e)=> typeProblemInput(e.target.value)}/>
            </td>
          </tr>
          <tr>
            <td>
              Output
            </td>
            <td>
              <textarea placeholder="example output" className="io" onChange={(e)=> typeProblemOutput(e.target.value)}/>
            </td>
          </tr>
          <tr>
            <td>
              Testcase Input
            </td>
            <td>
              <textarea placeholder="testcase input" className="testcase" onChange={(e)=> typeProblemTestcaseInput(e.target.value)}/>
            </td>
          </tr>
          <tr>
            <td>
              Testcase Output<br/>separate every testcase output with a blank line
            </td>
            <td>
              <textarea placeholder="testcase output" className="testcase" onChange={(e)=> typeProblemTestcaseOutput(e.target.value)}/>
            </td>
          </tr>
          <tr>
            <td>
              Time Limit (in s)
            </td>
            <td>
              <select onChange={(e)=> typeProblemTimeLimit(e.target.value)}>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
                <option>6</option>
                <option>7</option>
                <option>8</option>
                <option>9</option>
                <option>10</option>
                <option>11</option>
                <option>12</option>
                <option>13</option>
                <option>14</option>
                <option>15</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>
              Memory Limit (in mb)
            </td>
            <td>
              <textarea placeholder="memory limit" onChange={(e)=> typeProblemMemLimit(e.target.value)}/>
            </td>
          </tr>
        </tbody>
      </table>
      <button type="button" onClick={submitProblem}>submit</button>
      <p>{result}</p>
    </div>
  )
}

export default SetProblem;
