import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from './components/Home.jsx'
import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx'
import Problem from './components/Problem.jsx'
import SetProblem from './components/SetProblem.jsx'
import Contests from './components/Contests.jsx'
import CreateContest from './components/CreateContest.jsx'
import Profile from './components/Profile.jsx'
import Submissions from './components/Submissions.jsx'


const App = () => {

  return(
    <Router>
      <Routes>
        <Route path = "/" element={<Home />}></Route>
        <Route path = "/login" element={<Login />}></Route>
        <Route path = "/signup" element={<Signup />}></Route>
        <Route path = "/problem/:id" element={<Problem />}></Route>
        <Route path = "/setproblem" element={<SetProblem />}></Route>
        <Route path = "/contests" element={<Contests />}></Route>
        <Route path = "/createcontests" element={<CreateContest />}></Route>
        <Route path = "/profile/:username" element={<Profile />}></Route>
        <Route path = "/submissions/:username" element={<Submissions />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
