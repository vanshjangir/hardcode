import { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../index.css'
import './style/signup.css'

const Signup = () => {

  const api = import.meta.env.VITE_API_URL
  const [Semail, setEmail] = useState("");
  const [Spassword, setPassword] = useState("");
  const [signupResponse, setSignupResponse] = useState("");
  const nav = useNavigate();

  const submit = async () => {
    setSignupResponse("")
    if(Spassword == ""){
      setSignupResponse("blank password");
      return;
    }
    const response = await fetch(api+'/signup', {
      method: "POST",
      headers: {
        'Content-Type': "application/json",
      },
      body: JSON.stringify({
        email: Semail,
        password: Spassword,
      }),
    })
    
    const json = await response.json();
    if(response.status === 200){
      nav(-1);
    }else{
      setSignupResponse(json.msg)
    }
  }

  return (
    <div id="signup">
      <div id="signup-cont">
        <input placeholder="email" onChange={(e) => setEmail(e.target.value)} />
        <br/>
        <input placeholder="password" onChange={(e) => setPassword(e.target.value)}/>
        <br/>
        <button type="button" onClick={submit}>Sign Up</button>
        <br/>
        {signupResponse}
      </div>
    </div>
  )
}

export default Signup;
