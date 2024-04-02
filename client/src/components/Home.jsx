import { useEffect, useState } from 'react';
import '../index.css'
import { useNavigate } from 'react-router-dom';

const Home = () => {
  
  const [problem, setProblem] = useState([]);
  const nav = useNavigate();

  const getProblem = async (id) => {
    const response = await fetch(`https://hardcodeserver.vercel.app/${id}`, {
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
        <div id="homepage-navbar-title">
          <p>EasyCode</p>
        </div>
        <div id="homepage-navbar-buttons">
          <button id="homepage-loginbutton" onClick={()=> nav('/login')}>login</button>
          <button id="homepage-signupbutton" onClick={()=> nav('/signup')}>signup</button>
        </div>
      </div>
      <div id="homepage-problem-content">
        <div id='homepage-pagebutton'>
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
                  <td>{prob.acceptance}</td>
                  <td>{prob.difficulty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

  )
}

export default Home;
