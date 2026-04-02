import {useState} from 'react'
import './LoginSignup.css'
import {useSearchParams} from 'react-router-dom'

export default function ResetPassword (){
    const [success, setSuccess] = useState('');
            const [username, setUsername] = useState('');
            const [error, setError] = useState('');
    const handleOnSubmit = async(event) =>{
        event.preventDefault();
        setError('');
        setSuccess('');

        try{
            const result = await fetch(`http://localhost:4000/forgotPassword`, {
                method: "post",
                body: JSON.stringify({username}),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const data = await result.json();

    if (!result.ok)
    {
        setError(data.message);
        return;
    }
    setSuccess('Password Reset Successfully')
    }
catch(error) {
        
        setError(error.message)
    }
    }
    return (
        <form onSubmit={handleOnSubmit}>
        <div className = "container">
            
        <div className="header">
            <div className="text">Reset</div>
        </div>
        <div className="inputs">
              <input name='user' type="text" placeholder='username' onChange={(e)=> {setUsername(e.target.value)}}/>
             {/* ... <div className="new-password">
              <input name='newpass' type="password" placeholder='New Password' onChange={(e)=> {setPassword(e.target.value)}}/>
            </div> */}
            <input type="submit" value= "Submit"/>
            </div>
            
            <div style = {{color:"red"}}>{error}</div>
            <div style = {{color:"green"}}>{success}</div>
            
    </div>
    </form>
    )
}
