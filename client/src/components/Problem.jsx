import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import '../index.css'

const Problem = () => {

  const [problem, setProblem] = useState({});
  const [code, setCode] = useState("");
  const [result, setResult] = useState("");
  const location = useLocation();
  const nav = useNavigate();
  const token = localStorage.getItem('token');

  const loadProblem = async () => {  
    if(!token){
      return nav('/login');
    }

    const response = await fetch(`https://hardcodeserver.vercel.app${location.pathname}`, {
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
    const response = await fetch('https://hardcodeserver.vercel.app/submission', {
      method: "POST",
      headers: {
        authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'title': problem.title,
        'code': code, 
      }),
    });

    const received = await response.json();
    setResult(received.result); 
    
  }

  useEffect(()=>{
    loadProblem();
  },[])

  return (
    <div id="problempage">
      <div id="problempage-left">
        <h1>{problem.title}</h1>
        <h4>Description</h4>
        <p>{problem.description}</p>
        <h4>Input</h4>
        <p>{problem.input}</p>
        <h4>Output</h4>
        <p>{problem.output}</p>
      </div>
      <div id="problempage-right">
        <h3>Write your code here</h3>
        <textarea id="problempage-textarea" onChange={(e) => setCode(e.target.value)}></textarea>
        <button id="problempage-submitbutton" onClick={onsubmit}>SUBMIT</button>
        <p>{result}</p>
      </div>
    </div>
  )
}

export default Problem;
