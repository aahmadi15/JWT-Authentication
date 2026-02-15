import React, {Navigate, useState} from 'react'
import './LoginSignup.css'
import { Link } from 'react-router-dom';
export default function LoginSignup () {
    const [username, setUser] = useState('');
        const [password, setPassword] = useState('');
        
        
        const [error, setError] = useState('');

        
        
        const handleOnSubmit = async (event) => {
        event.preventDefault();
        
try{
    const result = await fetch(
    'http://localhost:4000/login', {
        method: "post",
        body: JSON.stringify({username, password, error}),
        headers: {
            'Content-Type': 'application/json'
        }
    })
       const data = await result.json();
       console.log(data)
   if (!result.ok)
    {
        setError(data.message)
        console.log(error)
        return;
    }    
    setError(data.message);
    console.log("Login success", data)}
    
catch(error) {
        
        setError(error)
        
    }
        }   
    return (
    <form onSubmit={handleOnSubmit}>
    <div className = 'container'>
        <div className="header">
            <div className="text">Login</div>
        </div>
        <div className="inputs">
            <div className="username"> 
              <input name='username' type="email" placeholder='username' onChange={(e)=> {setUser(e.target.value)}}/>   
                    </div>
            <div className="password">
              <input name='password' type="password" placeholder='password'onChange={(e)=> {setPassword(e.target.value)}}/>
              
            </div>
            <div className='errors'>
                {error}
            </div>
            <input type="submit" value= "Submit"/>
            </div>
            
            
            <div className ="forgetPassword"> Lost Password {" "}
                <Link to = "/register">
                <span>Click Here</span>
                </Link>
            </div>
            <div className ="submit-container">
            </div>
    </div>
    </form>
    
    )
}

export {LoginSignup};