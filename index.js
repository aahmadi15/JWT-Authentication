import http from 'http'
import fsp from 'fsp'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import {config} from 'dotenv'
import express from 'express'
import ejs from 'ejs';
//import {generateAccessToken, authenticateToken} from 'authServer.js'

import {mongoose} from 'mongoose'
mongoose.connect('mongodb://localhost:27017/tokens').then(()=>{
    console.log("mongodb connected")    
})
.catch((error)=>console.log(error))
/* creating my usermodel */
const token = new mongoose.Schema({
    username: {type:String, unique: true, required: true},
    password: {type:String, required: true},
    accessToken: {type:String, required: true}
});

const newUser = new mongoose.model("User", token)
 
const secret = process.env.JWT_SECRET_KEY;

let passcredential
let usercredential
let hashedPassword
let accessToken


const app = express()

app.set('view-engine', 'ejs')
app.use(express.static('public'));

app.use(express.urlencoded({extended:false}))
app.use(express.json());

config({path: ".env"});

const user = new newUser({
    username : usercredential,
    password : hashedPassword,
    accessToken: accessToken
});

const users = []
//const userid = req.body.email


app.get('/', (req, res) => {
    res.render('register.ejs'); 
});

app.get('/login', (req,res)=>{
    res.render('login.ejs')
})

app.get('/register', (req,res)=>{
    res.render('register.ejs')
})

/*app.get('/posts', authenticateToken, (req, res) =>{
    res.json(posts.filter(post => post.username === req.user.name));
})*/

app.post('/register', async (req, res) =>{
    try{
// will try putting the above in authserver declaration
        const coll = await user.collection.countDocuments();
        console.log(coll)
                passcredential = {password: req.body.password}
                passcredential.toString()
                usercredential = {username: req.body.email}
                const existUser = await newUser.findOne({username: req.body.email})
                const existPass = await newUser.findOne({password: req.body.password})
                console.log(existUser)
                console.log(req.body.email)
               //if (req.body.usercredential == existUser && req.body.password == existPass)
               //{
                    console.log(user)
                    console.log(req.body.email)
                    res.redirect('/login')
                    console.log(coll);
               //}
               // else{
                //    throw new Error ('user or password already exists');   
               // }               
    }
    catch(error){
        //res.writeHead(500, {'Content-Type': 'text/plain'})
        console.log(error)
        // this just ends the session with an error - we dont want that - res.end('Server Error');
        res.redirect('/login')
    }
    /*catch{
        res.redirect('/register')
    }*/
})


app.post('/login', async (req,res)=>{
    console.log (usercredential)
    console.log(passcredential)
    
    const check = await newUser.findOne({ username: req.body.username });
    /*if (!check) {
        return res.status(400).send('Cannot find user');
    }*/

    const salt = await bcrypt.genSalt(10)

    let passwordToString = passcredential.toString()
    hashedPassword = await bcrypt.hash(passwordToString, salt)

    const accessToken = jwt.sign(usercredential, process.env.JWT_SECRET_KEY, {expiresIn: '604800'});
    //let accessToken = accessMyToken({user}, usercredential);

    await user.save().then(() => {
    console.log('User saved!');
    res.json({success:true, token: 'JWT '+ token, user : {username: usercredential,
            password: passcredential,
            accessToken: accessToken}
    })
    //res.json({ accessToken });
  })
  .catch(err => {
    console.error('Save error:', err);
    res.status(400).json({ error: 'User validation failed', details: err });
  });
    //res.redirect('/token');
})


function accessMyToken(user){
    console.log(user.usercredential)
    return jwt.sign({user}, secret, {expiresIn: '604800'});
}

app.post('/token', (req,res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user)=>{
            if (err) return res.sendStatus(403)
                accessToken = generateAccessToken({username: usercredential})
        res.json({accessToken: accessToken})
            
    })
})

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

function generateAccessToken(user){
    return jwt.sign({usercredential}, process.env.JWT_SECRET_KEY, {expiresIn: '604800'})
}

app.listen(`${process.env.PORT}`, ()=>{
    console.log(`server is running at http://localhost:${process.env.PORT}`);
})