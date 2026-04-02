import 'dotenv/config'; // ← loads .env before anything else, ES module safe

import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import express from 'express'
import cors from 'cors';
import cookieParser from 'cookie-parser'
import crypto from "crypto"
import nodemailer from 'nodemailer'
import { mongoose } from 'mongoose'
import { Resend } from 'resend';

// Now process.env is available
console.log('SECRET:', process.env.JWT_SECRET_KEY?.slice(0, 10));
console.log('REFRESH:', process.env.JWT_REFRESH_TOKEN?.slice(0, 10));
console.log('ENV PATH:', process.cwd());
const resend = new Resend(process.env.RESEND_API_KEY);
const app = express();
var corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true
}
app.use(express.json());
app.use(cookieParser());

app.options('*', cors(corsOptions)) 
app.use(cors(corsOptions));

const verifyMail = async (userEmail, reset) => {
    
        const {error} = await resend.emails.send({
            from:    'Auth App <onboarding@resend.dev>',
            to:      userEmail,
            subject: 'Password Reset',
            html: `<div><a href="${reset}">Click here to reset password</a></div>`,
        });

        // Open this URL in your browser to see the email
        if (error) throw new Error(error.message);
        console.log('Mail sent success')
    };

mongoose.connect('mongodb://localhost:27017/tokens').then(()=>{
    console.log("mongodb connected")    
})
.catch((error)=>console.log(error))
/* creating my usermodel */
const token = new mongoose.Schema({
    username: {type:String, unique: true, required: true},
    password: {type:String, required: true},
    refreshToken: {type: String},
    resetToken: {type: String},
    resetTokenExpiry: {type: Date},
    //JWTs need to be stateless - accessToken: {type:String, required: true}
});

const newUser = new mongoose.model("users", token)
 
const secret = process.env.JWT_SECRET_KEY;

app.use(express.urlencoded({extended:false}))


app.get('/register', (req,res)=>{
    console.log ('weeee')
})

app.get('/login', (req, res)=>{
    console.log('welcome')
})

app.get('/dashboard', authenticateToken, (req, res) => {
  res.json({ message: "Protected data", user: req.user });
});

/*app.get('/posts', authenticateToken, (req, res) =>{
    res.json(posts.filter(post => post.username === req.user.name));
})*/

app.post('/login', async (req, res) =>{

                let usercredential = req.body.username;
                let passcredential = req.body.password;
            
                let errorMessage = req.body.error;
                console.log (usercredential)
                console.log(passcredential)
                let passwordToString = passcredential.toString()

        try {     
                if (!usercredential || !passcredential )
               {
                    console.log(usercredential)
                    return res.status(400).json({message: "Empty fields - try again"})                      
               }   
               const existUser = await newUser.findOne({username: usercredential})
                console.log(existUser)
                    //res.redirect('/login')
               if (!existUser) {
                return res.status(400).json({message: "user does not exist"});
              }
              const passMatch = await bcrypt.compare(passcredential, existUser.password) //place this due to logic error in case no user is entered causing issue with crash
               if (!passMatch)
               {
                    errorMessage = `Password not recognized`
                    console.log(errorMessage)
                    return res.status(400).json({message: "password not recognized"})                      
               }
               
                    if (existUser.refreshToken)
                    {
                        existUser.refreshToken = null;
                        await existUser.save()
                    }
                    const {accessToken, refreshToken} = accessMyToken(existUser);
                    console.log(accessToken);

                existUser.refreshToken = refreshToken;
                await existUser.save();
            
            const options = {
                expires: new Date(Date.now() + 3 * 24 *60 *60 * 1000),
                httpOnly: true,
                secure:true, 
                sameSite: "strict"
            };


            res.cookie("refreshToken", refreshToken, options
            );

            res.status(200).json({message: "logged in", accessToken,
                        user: {
                            username: existUser.username}
        })
        

                }       
                catch(error){
                    console.log(error)
                    return res.status(500).json({message: "Server error"});
                }
})


app.post('/register', async (req,res)=>{
    //const {usercredential, passcredential} = req.body;
    
    const check = await newUser.findOne({ username: req.body.username });
    if (check){
        return res.status(400).json({message: "User already exists"})
    }
    usercredential = req.body.username;
    passcredential = req.body.password;
    const salt = await bcrypt.genSalt(10)
    console.log(salt);
    


    try {     
                if (!usercredential?.trim() && !passcredential?.trim())
               {
                    console.log(usercredential)
                    return res.status(400).json({message: "Empty fields - try again"})                      
               }   
                    //res.redirect('/login')
               if (!usercredential && passcredential)
               {
                return res.status(401).json({message: "Password entered, need user field"})
               }
     const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passcredential, salt);
    
    const user = new newUser({
    username : usercredential,
    password : hashedPassword,
    //removed accessToken from usermodel as JWT supposed to be stateless
    refreshToken: null
});

    await user.save().then(()=>{
        console.log('User saved!');
    })

    return res.status(201).json({
        message: "User Registered successfully",
        user:{
            username: usercredential,
            password: hashedPassword
        }
    })

    //need to add a cookie parser middleware

    }catch(error){
        console.error(error)
        return res.status(500).json({message:"Server error"})
    }})

function accessMyToken(usercredential){
    console.log('SECRET inside accessMyToken:', process.env.JWT_SECRET_KEY?.slice(0, 10));
    console.log('REFRESH inside accessMyToken:', process.env.JWT_REFRESH_TOKEN?.slice(0, 10));
    /*return jwt.sign({userId: usercredential, pass:passcredential}, process.env.JWT_SECRET_KEY, {expiresIn: '604800'});*/
    // Apparently this is bad practise for security purposes adding password as it can be uncoded and fetched.
    const accessToken = jwt.sign(
        {userId: usercredential},
        process.env.JWT_SECRET_KEY,
        {expiresIn: '15m' })
    const refreshToken = jwt.sign(
        {usercredential}, 
        process.env.JWT_REFRESH_TOKEN,
        {expiresIn: "7d"}
    )
    return {accessToken, refreshToken};
}

app.post('/forgotPassword', async (req, res )=>{
    const {username} = req.body;

    if (!username)
        return res.status(400).json({message: "Empty field"})
    try {
        const user = await newUser.findOne({username})
        if (!user) return res.status(200).json({message: "If the user exists a reset has been sent"});
    
        //user.password = await bcrypt.hash(password, salt)
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        user.resetToken = hashedToken;
        user.resetTokenExpiry = Date.now() + 15 * 60 * 1000;
        await user.save();
        const reset = `http://localhost:3000/resetPassword?token=${rawToken}`

        await verifyMail(user.email, reset);
    return res.status(200).json(
        {message: "If the user exists a reset has been sent"}
    );

    }
    catch (error){
        console.log('Error', error.message)
        res.status(500).json({message: "something went wrong"})
    }
    
});

app.post('/resetPassword', async (req, res) => {
    const {token, password} = req.body;

    if (!token || !password){
        return res.status(400).json({message: 'token and password are required'})
    }

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await newUser.findOne({
            resetToken: hashedToken,
            resetTokenExpiry: {$gt: Date.now()},
        });
        if (!user){
            return res.status(400).json({message: 'token is invalid or has expired'})
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        return res.status(200).json({message: 'Password has been reset successfully.'})
    }
    catch(error){
        console.log('Error:', error.message);
        return res.status(500).json({message: 'something went wrong'});
    }
})

app.post('/token', (req,res) => {
    try {
    const refreshToken = req.cookies.token; 
    if (!refreshToken) return res.status(401).json({message: "No refresh token provided"});
    
    const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_SECRET_KEY
    )
    const user = newUser.findById(decoded.userId)

    if (!user || user.refreshToken !== refreshToken){
        return res.status(403).json({message: "invalid refresh token"});
    }

    const newAccessToken = jwt.sign(
        {userId: user._id},
        process.env.JWT_SECRET_KEY,
        {expiresIn: "15m"}
    );

    return res.status(200).json({ accessToken: newAccessToken})
}
catch (error){
    return res.status(403).json({message: "Token expired or invalid"})
}
});

app.delete('/logout', (req,res) =>{
    refreshToken = refreshToken.filter(token => token !== req.body.token)
    res.redirect('/register')
})

function authenticateToken(req,res,nex){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401) //means user doesn't have access to the token in question
    
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403)  // checks if token no longer valid then throws a HTTP 403 error
        req.user = user
        next() // move on with middleware
    }) 
}


app.listen(`${process.env.PORT}`, ()=>{
    console.log(`server is running at http://localhost:${process.env.PORT}`);
})