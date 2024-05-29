import { useEffect, useState } from 'react';
import './style/home.css'
import '../index.css'
import { useNavigate } from 'react-router-dom';

const Home = () => {
  
  const [problem, setProblem] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("user");
  const nav = useNavigate();

  const getProblem = async () => {
    const response = await fetch('http://54.147.52.167:3000', {
      method: "GET",
    });
    
    const json = await response.json();
    setProblem(json);
  }

  const getRole = async () => {
    const response = await fetch('http://54.147.52.167:3000/role', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "username": localStorage.getItem('username'),
      })
    })

    const json = await response.json();
    setRole(json.role);
  }

  const logout = async () => {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    getRole();
    loginStatus();
  }
    
  const loginStatus = async () => {
    const user = localStorage.getItem('username');
    if(user){
      setUsername(user);
      setIsLoggedIn(true);
      getRole();
    }else{
      setIsLoggedIn(false);
    }
  }

  useEffect(()=>{
    loginStatus();
    getProblem();
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
              <a href='' onClick={() => nav(`/profile/:{username}`)} id='profile'>{username}</a>
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

        {role === "admin" ? (
          <>
            &nbsp;
            <button id='create-contestbutton' onClick={()=> nav('/createcontests')}>Create contest</button>
            &nbsp;
            <button id='setproblembutton' onClick={()=> nav('/setproblem')}>Set Problem</button>
          </>
        ): (
          <></>
        )}

        {isLoggedIn ? (
          <>
            &nbsp;
            <button id='logoutbutton' onClick={logout}>logout</button>
          </>
        ):(
          <></>
        )}

      </div>
      <br/>
      <h2>Problem Set</h2>
      <div id="problem-content">
        <div id="problem-cont">
          <table id="problem-table">
            <thead>
              <tr>
                <td><h3>Title</h3></td>
                <td className='rightaligned'><h3>Difficulty</h3></td>
              </tr>
            </thead>
            <tbody>
              {problem.map((prob) => (
                <tr key={prob.title}>
                  <td onClick={() => {nav(`problem/${prob.title}`)}} id='problemrow'>
                  <a href=''>{prob.title}</a>
                  </td>
                  <td className='rightaligned'>{prob.difficulty}</td>
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
