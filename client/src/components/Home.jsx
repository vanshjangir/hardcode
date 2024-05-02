import { useEffect, useState } from 'react';
import './style/home.css'
import '../index.css'
import { useNavigate } from 'react-router-dom';

const Home = () => {
  
  const [problem, setProblem] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const nav = useNavigate();

  const getProblem = async (id) => {
    const response = await fetch(`http://144.144.144.144:3000/${id}`, {
      method: "GET",
    });
    
    const json = await response.json();
    setProblem(json);

  }

  const logout = async () => {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    loginStatus();
  }
    
  const loginStatus = async () => {
    const user = localStorage.getItem('username');
    if(user){
      setUsername(user);
      setIsLoggedIn(true);
    }else{
      setIsLoggedIn(false);
    }
  }

  useEffect(()=>{
    loginStatus();
    getProblem(1);
  },[])


  return (
    <div id="homepage">
      <div id="navbar">
        <div id="navbar-title">
          <h3>HardCode</h3>
        </div>
        <div id="navbar-buttons">
          {isLoggedIn ? (
            <>
              <a href='' onClick={() => nav(`/profile/:{username}`)}>{username}</a>
              &nbsp;
              <button id='logoutbutton' onClick={logout}>logout</button>
            </>
          ): (
            <>
              <button id="loginbutton" onClick={()=> nav('/login')}>login</button>
              &nbsp;
              <button id="signupbutton" onClick={()=> nav('/signup')}>signup</button>
            </>
          )}
        </div>
      </div>
      <br/>
      <div id='contest'>
        <button id='contestbutton' onClick={()=> nav('/contests')}>Contests</button>
        &nbsp;
        <button id='create-contestbutton' onClick={()=> nav('/createcontests')}>Create contest</button>
        &nbsp;
        <button id='setproblembutton' onClick={()=> nav('/setproblem')}>Set Problem</button>
      </div>
      <br/>
      <h2>Problem Set</h2>
      <div id="problem-content">
        <div id='pagebutton'>
          <button onClick={() => getProblem(1)}>1</button>
          <button onClick={() => getProblem(2)}>2</button>
        </div>
        <div id="problem-cont">
          <table id="problem-table">
            <thead>
              <tr>
                <td>Title</td>
                <td>Difficulty</td>
              </tr>
            </thead>
            <tbody>
              {problem.map((prob) => (
                <tr key={prob.title}>
                  <td onClick={() => {nav(`problem/${prob.title}`)}}>
                  <a href=''>{prob.title}</a>
                  </td>
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
