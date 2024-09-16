import { useEffect, useState } from 'react';
import './style/home.css'
import '../index.css'
import { useNavigate } from 'react-router-dom';

const Home = () => {
  
  const api = import.meta.env.VITE_API_URL
  const [problem, setProblem] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("user");
  const nav = useNavigate();

  const getProblem = async () => {
    const response = await fetch(api, {
      method: "GET",
    });
    
    const json = await response.json();
    setProblem(json);
  }

  const getRole = async () => {
    const response = await fetch(api+'/role', {
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
          <h1 id='hardcode-logo'>HardCode</h1>
        </div>
        <div id="navbar-buttons">
          {isLoggedIn ? (
            <div id='profile-cont'>
              <img id='profile-logo' src='/profile.png'/>
              <a href='' onClick={() => nav(`/profile/:${username}`)} id='profile'>{username.toUpperCase()}</a>
            </div>
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
            <button id='submissionsbutton' onClick={()=> nav(`/submissions/:${username}`)}>Submissions</button>
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
        {problem.map((prob, index) => (
          <div id='problemrow' className={`rownum${index%2}`}>
            <div id='problemtitle' onClick={() => {nav(`problem/${prob.title}`)}}>
              <a href=''>{prob.title}</a>
            </div>
            <div className={`${prob.difficulty.toLowerCase()}`}>
              {prob.difficulty}
            </div>
          </div>
        ))}
      </div>
    </div>

  )
}

export default Home;
