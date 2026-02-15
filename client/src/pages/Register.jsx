

import React, {Navigate, useState} from 'react'
import './LoginSignup.css'


export default function Register (){
    const [username, setUser] = useState('');
            const [password, setPassword] = useState('');
            const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const handleOnSubmit = async(event) =>{
        event.preventDefault();

        try{
            const result = await fetch('http://localhost:4000/register', {
                method: "post",
                body: JSON.stringify({username, password}),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const data = await result.json();

            if (!result.ok)
    {
        setSuccess(data.message);
        return;
    }
    setSuccess('User registered Successfully')
    }
catch(error) {
        
        setError(error)
    }
    }
    return (
        <form onSubmit={handleOnSubmit}>
        <div className = "container">
            <div className = 'container'>
        <div className="header">
            <div className="text">Register</div>
        </div>
        <div className="inputs">
            <div className="username"> 
              <input name='username' type="email" placeholder='username' onChange={(e)=> {setUser(e.target.value)}}/>    
                    </div>
            <div className="password">
              <input name='password' type="password" placeholder='password' onChange={(e)=> {setPassword(e.target.value)}}/>
            </div>
            <input type="submit" value= "Submit"/>
            </div>
            
            <div style = {{color:"red"}}>{error}</div>
            <div style = {{color:"green"}}>{success}</div>
            
    </div>


        </div>
        </form>
    )
}



export {Register};