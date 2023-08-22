import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Problem = () => {

  const [problem, setProbem] = useState({});
  const location = useLocation();
  const nav = useNavigate();
  const token = localStorage.getItem('token');

  const loadProblem = async () => {  
    if(!token){
      return nav('/login');
    }

    const response = await fetch(`http://localhost:3000${location.pathname}`, {
      method: "GET",
      headers: {
        authorization: token,
      }
    });

    const json = await response.json();
    setProbem(json);
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
        <textarea id="problempage-textarea"></textarea>
      </div>
    </div>
  )
}

export default Problem;
