import { useState } from "react"
import { useNavigate } from "react-router-dom";

const Login = () => {

  const [Uemail, setEmail] = useState("");
  const [Upassword, setPassword] = useState("");
  const nav = useNavigate();

  const submit = async () => {
    const response = await fetch('http://localhost:3000/login', {
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
      nav(-1);
    }
    else{
      console.log("dlfjl")
    }
  }

  return (
    <div>
      <input placeholder="email" id="loginpage-input-email" onChange={(e) => setEmail(e.target.value)}/>
      <input placeholder="password" id="loginpage-input-password" onChange={(e) => setPassword(e.target.value)}/>
      <button type="button" onClick={submit}>Submit</button>
    </div>
  )
}

export default Login;
