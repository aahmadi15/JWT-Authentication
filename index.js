import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import {config} from 'dotenv'
import express from 'express'
import cors from 'cors';
import cookieParser from 'cookie-parser'
//import {generateAccessToken, authenticateToken} from 'authServer.js'

import {mongoose} from 'mongoose'


const app = express()

var corsOptions = {
    origin: 'http://localhost:3000',
    credentials: true
}
app.use(express.json());
app.use(cookieParser());

app.options('*', cors(corsOptions)) 
app.use(cors(corsOptions));
app.use(function(req,res, next){
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Access-Control-Allow-Headers, Content-Type, Authorization, Origin, Accept");
    res.setHeader('Access-Control-Allow-Credentials', true)
     next();
})

mongoose.connect('mongodb://localhost:27017/tokens').then(()=>{
    console.log("mongodb connected")    
})
.catch((error)=>console.log(error))
/* creating my usermodel */
const token = new mongoose.Schema({
    username: {type:String, unique: true, required: true},
    password: {type:String, required: true},
    refreshToken: {type: String}
    //accessToken: {type:String, required: true}
});

const newUser = new mongoose.model("users", token)
 
const secret = process.env.JWT_SECRET_KEY;

app.use(express.urlencoded({extended:false}))
app.use(express.json());

config({path: ".env"});


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
let accessToken;

                let usercredential = req.body.username;
                let passcredential = req.body.password;
                let passwordToString
                let errorMessage = req.body.error;
                console.log (usercredential)
                console.log(passcredential)
                passwordToString = passcredential.toString()
                const existUser = await newUser.findOne({username: usercredential})
                console.log(existUser)

        try {     
                if (!usercredential || !passcredential )
               {
                    console.log(usercredential)
                    console.log(passcredential)
                    return res.status(400).json({message: "Empty fields - try again"})                      
               }   
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
                    accessToken = accessMyToken(usercredential);
                    console.log(accessToken);

            const options = {
                expires: new Date(Date.now() + 3 * 24 *60 *60 * 1000),
                httpOnly: true,
                secure:true, 
                sameSite: "strict"
            };

            const refreshToken = jwt.sign({
                username: existUser.usercredential,
            }, process.env.JWT_SECRET_KEY, {expiresIn: '1d'});

            
            existUser.refreshToken = refreshToken;
            await existUser.save();

            res.cookie("refreshToken", refreshToken, {
                options
            });

            res.status(200).json({message: "logged in", accessToken,
                        user: {
                            id: existUser._id,
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
                    console.log(passcredential)
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
    //password : hashedPassword
    //removed accessToken from usermodel as JWT supposed to be stateless
    refreshToken: refreshToken
});

    await user.save().then(()=>{
        console.log('User saved!');
    })

    return res.status(201).json({
        message: "User Registered successfully",
        token: accessToken,
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
    
    /*return jwt.sign({userId: usercredential, pass:passcredential}, process.env.JWT_SECRET_KEY, {expiresIn: '604800'});*/
    // Apparently this is bad practise for security purposes adding password as it can be uncoded and fetched.
    return jwt.sign(
        {userId: usercredential},
        process.env.JWT_SECRET_KEY,
        {expiresIn: '604800' })
}

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