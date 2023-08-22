import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from './components/Home.jsx'
import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx'
import Problem from './components/Problem.jsx'


const App = () => {

  return(
    <Router>
      <Routes>
        <Route path = "/" element={<Home />}></Route>
        <Route path = "/login" element={<Login />}></Route>
        <Route path = "/signup" element={<Signup />}></Route>
        <Route path = "/problem/:id" element={<Problem />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
