import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import '../index.css'
import './style/problempage.css'

const Problem = () => {

  const [problem, setProblem] = useState("");
  const [logs, setLogs] = useState("");
  const [code, setCode] = useState("");
  const [result, setResult] = useState("");
  const [output, setOutput] = useState("");
  const [input, setInput] = useState("");
  const [yourOutput, setYourOutput] = useState("");
  const location = useLocation();
  const nav = useNavigate();
  const token = localStorage.getItem('token');

  const loadProblem = async () => {  
    if(!token){
      return nav('/login');
    }

    const response = await fetch(`http://54.147.52.167:3000${location.pathname}`, {
      method: "GET",
      headers: {
        authorization: token,
      }
    });

    const json = await response.json();
    setProblem(json);
  }

  const onsubmit = async () => {
    setResult("PENDING");
    setLogs("LOGS");
    const response = await fetch('http://54.147.52.167:3000/submission', {
      method: "POST",
      headers: {
        authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'title': problem.title,
        'code': code,
        'username': localStorage.getItem('username'),
      }),
    });

    const received = await response.json();
    setResult(received.result);
    setLogs(received.log);
    setOutput(received.output);
    setInput(received.input);
    setYourOutput(received.youroutput);
  }

  useEffect(()=>{
    loadProblem();
  },[])

  const getResultColor = () => {
    if(result === "ACCEPTED")
      return "green";
    else if(result === "PENDING")
      return "white";
    else
      return "#af1a2a";
  }

  return (
    <div id="problempage">
      <div id="left">
        <h1>{problem.title}</h1>
        <h4>Description</h4>
        <div id="problemdescription">
          <p>{problem.description}</p>
        </div>
      </div>
      <div id="right">
        <textarea id="textarea" onChange={(e) => setCode(e.target.value)}></textarea><br/>
        <button id="submitbutton" onClick={onsubmit}>SUBMIT</button>
        <p style={{color: getResultColor()}}>{result}</p>
        <p><pre>{logs}</pre></p>
        <div id="statusbox">
          <div id="status-input">
            <p>Input</p>
            <p>{input}</p>
          </div> 
          <div id="status-input">
            <p>Output</p>
            <p>{output}</p>
          </div> 
          <div id="status-input">
            <p>Your Output</p>
            <p>{yourOutput}</p>
          </div> 
        </div>
      </div>
    </div>
  )
}

export default Problem;
