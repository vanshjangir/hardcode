import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import '../index.css'
import './style/problempage.css'

const Problem = () => {

  const api = import.meta.env.VITE_API_URL
  const [problem, setProblem] = useState("");
  const [logs, setLogs] = useState("");
  const [code, setCode] = useState("");
  const [result, setResult] = useState("RESULT");
  const [output, setOutput] = useState("");
  const [input, setInput] = useState("");
  const [yourOutput, setYourOutput] = useState("");
  const location = useLocation();
  const nav = useNavigate();
  const token = localStorage.getItem('token');
  const [testcase, setTestcase] = useState({});

  const loadProblem = async () => {  
    if(!token){
      return nav('/login');
    }

    const response = await fetch(`${api}${location.pathname}`, {
      method: "GET",
      headers: {
        authorization: token,
      }
    });

    const json = await response.json();
    setProblem(json);
    setTestcase(json.testcase[0])
  }

  const onsubmit = async () => {
    setResult("PENDING");
    setLogs("LOGS");
    const response = await fetch(api+'/submission', {
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
      return "orange";
    else if(result === "RESULT")
      return "white";
    else
      return "#af1a2a";
  }

  return (
    <div id="problempage">
      <div id="left">
        <h1>{problem.title}</h1>
        <p className="problemheader">Description</p>
        <div id="problemdescription">
          <p>{problem.description}</p>
        </div>
        <p className="problemheader">Input Format</p>
        <div id="probleminput">
          <p>{testcase.input}</p>
        </div>
        <p className="problemheader">Output Format</p>
        <div id="problemoutput">
          <p>{testcase.output}</p>
        </div>
      </div>
      <div id="right">
        <textarea id="textarea" placeholder="write your cpp code here" onChange={(e) => setCode(e.target.value)}></textarea><br/>
        <div id="submitstatus">
          <button id="submitbutton" onClick={onsubmit}>SUBMIT</button>
          <p style={{color: getResultColor()}}><b>{result}</b></p>
        </div>
        <div id="statusbox">
          {
            (result === "ACCEPTED" || result === "WRONG ANSWER") ? (
              <>
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
              </>
            ):(
              <div>
                <p><pre>{logs}</pre></p>
              </div>
            )
          }
        </div>
      </div>
    </div>
  )
}

export default Problem;
