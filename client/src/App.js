import './App.css'
import LoginSignup from './pages/LoginSignup.jsx';
import Register from './pages/Register.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import NewPassword  from './pages/NewPassword.jsx';
import { BrowserRouter as Router, Routes, Route, Link, BrowserRouter} from 'react-router-dom';
//import { Form } from 'react-router-dom';
function App(){
    return (
        <BrowserRouter> 
            <nav className = "navStyle">
                <Link to = "/">Home</Link> | {" "}
                <Link to = "/Register">Register</Link>  {" "}
            </nav>
            <Routes>
                <Route path = '/' element = {<LoginSignup/>}/>
                <Route path = '/Register' element = {<Register/>}/>
                <Route path = '/forgotPassword' element = {<ResetPassword/>}/>
                <Route path = '/resetPassword' element = {<NewPassword/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;