import { useState } from "react"
import { useNavigate } from "react-router-dom";
import '../index.css'
import './style/login.css'
const Login = () => {

  const api = import.meta.env.VITE_API_URL
  const [Uemail, setEmail] = useState("");
  const [Upassword, setPassword] = useState("");
  const [loginResponse, setLoginResponse] = useState("");
  const nav = useNavigate();

  const submit = async () => {
    const response = await fetch(api+'/login', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: Uemail,
        password: Upassword
      })
    })

    const status = response.status;
    const json = await response.json();
    if(status === 200){
      localStorage.setItem("token", json.token);
      localStorage.setItem("username", Uemail);
      nav(-1);
    }
    else{
      setLoginResponse(json.msg);
    }
  }

  return (
    <div id="login">
      <div id="login-cont">
        <input placeholder="email" id="loginpage-input-email" onChange={(e) => setEmail(e.target.value)}/>
        <br/>
        <input placeholder="password" id="loginpage-input-password" onChange={(e) => setPassword(e.target.value)}/>
        <br/>
        <button type="button" onClick={submit}>Submit</button>
        <br/>
        {loginResponse}
      </div>
    </div>
  )
}

export default Login;
