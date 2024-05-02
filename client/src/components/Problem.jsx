import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import './style/problempage.css'
import '../index.css'

const Problem = () => {

  const [problem, setProblem] = useState("");
  const [logs, setLogs] = useState("");
  const [code, setCode] = useState("");
  const [result, setResult] = useState("");
  const location = useLocation();
  const nav = useNavigate();
  const token = localStorage.getItem('token');

  const loadProblem = async () => {  
    if(!token){
      return nav('/login');
    }

    const response = await fetch(`http://144.144.144.144:3000${location.pathname}`, {
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
    const response = await fetch('http://144.144.144.144:3000/submission', {
      method: "POST",
      headers: {
        authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'title': problem.title,
        'code': code,
        'type': 'submit',
        'username': localStorage.getItem('username'),
      }),
    });

    const received = await response.json();
    setResult(received.result);
    setLogs(received.log);
  }

  const onrun = async () => {
    setResult("PENDING");
    setLogs("LOGS");
    const response = await fetch('http://144.144.144.144:3000/submission', {
      method: "POST",
      headers: {
        authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'title': problem.title,
        'code': code,
        'type': 'run',
        'username': localStorage.getItem('username'),
      }),
    });

    const received = await response.json();
    setResult(received.result);
    setLogs(received.log);
  }

  useEffect(()=>{
    loadProblem();
  },[])

  return (
    <div id="problempage">
      <div id="left">
        <h1>{problem.title}</h1>
        <h4>Description</h4>
        <pre>{problem.description}</pre>
        <h4>Input</h4>
        <pre>{problem.input}</pre>
        <h4>Output</h4>
        <pre>{problem.output}</pre>
      </div>
      <div id="right">
        <h3>Code</h3>
        <textarea id="textarea" onChange={(e) => setCode(e.target.value)}></textarea><br/>
        <button id="runbutton" onClick={onrun}>RUN</button>
        &nbsp;
        <button id="submitbutton" onClick={onsubmit}>SUBMIT</button>
        <p>RESULT<br/>{result}</p>
        <p>LOGS<br/><pre>{logs}</pre></p>
      </div>
    </div>
  )
}

export default Problem;
