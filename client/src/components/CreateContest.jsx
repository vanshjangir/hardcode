import { useState } from "react";
import "./style/createcontest.css"

const CreateContest = () => {

  const api = import.meta.env.VITE_API_URL
  const [cID, setCID] = useState("");
  const [cName, setCName] = useState("");
  const [cDuration, setCDuration] = useState("");

  const submit = () => {
    const response = fetch('http://54.147.52.167:3000/createcontest', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        name: cName,
      },
    })
  }

  return(
    <div id="createcontest">
      <div id="non-problem-side">
        Name<br/>
        <input placeholder="Contest Name"/><br/>
        Duration<br/>
        <input placeholder="Duration"/><br/>
        Time and Date<br/>
        <input placeholder="Time and Date"/><br/>
        Organizer<br/>
        <input placeholder="Organizer Name"/><br/>
        <br/>
        <button onClick={submit}>Create</button>
        {cID}<br/>
      </div>
      <h4>How to create a Contest?</h4>
      <p>
        Fill in the above details and add submit, you will get a contest ID (cID). Save it.<br/>
        Click the Set problem button, and add as many problems as you want.<br/>
        These problems can be seen on the problem set after the contest is over.
      </p>
    </div>
  )
}

export default CreateContest;
