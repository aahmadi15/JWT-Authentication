import React from 'react'
import './LoginSignup.css'



const LoginSignup = () => {
    return (<div className = 'container'>
        <div className="header">
            <div className="text">Register</div>
            <div className="underline"></div>
        </div>
        <div className="inputs">
            <div className="username">
                <input type="email" />
            </div>
            <div className="password">
                <input type="password" />
            </div>
            <div className="forgetPassword"> Lost Password <span>Click Here</span></div>
            <div className="submit-container">
                <div className="submit">Sign Up</div>
                <div className="Login">Login</div>
            </div>
        </div>
    </div>)
}

export default LoginSignup