import { useEffect, useState } from 'react';
import '../App.css'
import { useNavigate } from 'react-router-dom';

const Home = () => {
  
  const [problem, setProblem] = useState([]);
  const nav = useNavigate();

  const getProblem = async (id) => {
    const response = await fetch(`http://localhost:3000/${id}`, {
      method: "GET",
    });
    
    const json = await response.json();
    setProblem(json);

  }

  useEffect(()=>{
    getProblem(1);
  },[])


  return (
    <div id="homepage">
      <div id="homepage-navbar">
        <button id="homepage-loginbutton" onClick={()=> nav('/login')}>login</button>
        <button id="homepage-signupbutton" onClick={()=> nav('/signup')}>signup</button>
      </div>
      <div id='homepage-pagbutton'>
        <button onClick={() => getProblem(1)}>1</button>
        <button onClick={() => getProblem(2)}>2</button>
      </div>
      <div id="problem">
        <table>
          <thead>
            <tr>
              <td>Title</td>
              <td>Acceptance</td>
              <td>Difficulty</td>
            </tr>
          </thead>
          <tbody>
            {problem.map((prob) => (
              <tr key={prob.title}>
                <td onClick={() => {nav(`problem/${prob.title}`)}}>{prob.title}</td>
                <td>{prob.Acceptance}</td>
                <td>{prob.Difficulty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

  )
}

export default Home;
