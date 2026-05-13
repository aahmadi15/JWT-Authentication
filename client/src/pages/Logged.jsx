import {useState, useEffect} from 'react'
import './LoginSignup.css'
export default function Logged (){
    const [success, setSuccess] = useState('');
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => { 
        const fetchDashboard = async () => {
        const accessToken = localStorage.getItem('accessToken');
        
        if (!accessToken){
            setError('Not Logged in');
            return
        }

        try{
            console.log('2. fetching dashboard...'); 
            const result = await fetch('http://localhost:4000/dashboard', {
                method: "get", 
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            })
            console.log('3. result status:', result.status);
            const data = await result.json()

            if (!result.ok){
                setError(data.message);
                return;
            }
            setUser(data.user);
            setSuccess('You are logged in')
        }
        

        catch(error){
            setError(error.message)
        }
    }
    fetchDashboard();
    }, [])
    return (
        <div className="container">
            <div className="header">
                <div className="text">Dashboard</div>
            </div>
            <div style={{ color: 'red' }}>{error}</div>
            <div style={{ color: 'green' }}>{success}</div>
            {user && <p>Welcome, {user}</p>}
        </div>
    )
}
