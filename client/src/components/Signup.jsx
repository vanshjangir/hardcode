import { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../index.css'

const Signup = () => {

  const [Semail, setEmail] = useState("");
  const [Spassword, setPassword] = useState("");
  const nav = useNavigate();

  const submit = async () => {
    const response = await fetch('http://144.144.144.144:3000/signup', {
      method: "POST",
      headers: {
        'Content-Type': "application/json",
      },
      body: JSON.stringify({
        email: Semail,
        password: Spassword,
      }),
    })

    if(response.status == 200){
      nav(-1);
    }
  }

  return (
    <div>
      <input placeholder="email" onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="password" onChange={(e) => setPassword(e.target.value)}/>
      <button type="button" onClick={submit}>SignIn</button>
    </div>
  )
}

export default Signup;
