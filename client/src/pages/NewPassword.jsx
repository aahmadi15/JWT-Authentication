import {useState} from 'react';

export default function NewPassword(){
    const token = new URLSearchParams(window.location.search).get('token');

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const passwordsMatch = password === confirmPassword && password.length >= 8;
    const canSubmit = passwordsMatch && !loading;
const handleOnSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token){
        setError('Invalid or missing reset link.  Please request a new one.');
        return;
    }
    if (password.length < 8){
        setError('Password must be at least 8 characters.');
        return;
    }
    if (password!== confirmPassword){
        setError('Passwords do not match.');
        return;
    }

    setLoading(true);
    try{
        const result = await fetch('http://localhost:4000/resetPassword',{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({token, password}),
        } );

        const data = await result.json();

        if (!result.ok){
            setError(data.message);
            return;
        } 
        
        setSuccess('Password reset successfully.  You can now log in')
    }   catch (err){
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }
return (
    <form onSubmit={handleOnSubmit}>
        <div className="container">
            <div className="header">
                <div className="text">Set New Password</div>
            </div>

            <div className="inputs">
                <div className="field">
                    <input type= {showPassword ? 'text': 'password'} 
                    placeholder='New Password'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    
                    />
                </div>
                <div className='field'>
                    <input type= {showPassword ? 'text':'password'}
                    placeholder='Confirm new password'
                    value={confirmPassword}
                    onChange={(e)=> setConfirm(e.target.value)} />
                </div>
                <input type="submit"
                value={loading ? 'Resetting':'Reset Password'} 
                disabled={!canSubmit}
                />
            </div>
            <div style={{color: 'red'}}>{error}</div>
            <div style={{color: 'green'}}>{success}</div>
        </div>
    </form>
)}