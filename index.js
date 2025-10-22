import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import {config} from 'dotenv'
import express from 'express'
import cors from 'cors';

//import {generateAccessToken, authenticateToken} from 'authServer.js'

import {mongoose} from 'mongoose'


const app = express()

var corsOptions = {
    origin: 'http://localhost:3000'
}


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
    accessToken: {type:String, required: true}
});

const newUser = new mongoose.model("users", token)
 
const secret = process.env.JWT_SECRET_KEY;

let passcredential;
let usercredential;
let hashedPassword
let passwordToString;
let accessToken

const userCheck = new newUser({
    username : usercredential,
    password : hashedPassword,
    accessToken: accessToken
});

app.use(express.urlencoded({extended:false}))
app.use(express.json());

config({path: ".env"});


app.get('/register', (req,res)=>{
    console.log ('weeee')
})

app.get('/login', (req, res)=>{
    console.log('welcome')
})

/*app.get('/posts', authenticateToken, (req, res) =>{
    res.json(posts.filter(post => post.username === req.user.name));
})*/

app.post('/register', async (req, res) =>{
    
// will try putting the above in authserver declaration
        //const coll = await user.collection.countDocuments();
        //console.log(coll)
            
            //const {username, password, error} = req.body;

            //console.log(data)
                usercredential = req.body.username;
                passcredential = req.body.password;
                let errorMessage = req.body.error;
                console.log (usercredential)
                console.log(passcredential)
                passwordToString = passcredential.toString()
                const existUser = await newUser.findOne({username: usercredential})
                const existPass = await newUser.findOne({password: passcredential})
                console.log(existUser)

               if ((existUser) && (existPass))
               {
                    errorMessage = 'An error was not found';
                    console.log(errorMessage)
                    res.status(200).send(errorMessage)
                    //res.redirect('/login')
               }
               if ((existUser) && (!existPass))
               {
                    errorMessage = `Password not recognized`
                    console.log(errorMessage)
                    res.status(200).send(errorMessage)                      
               }
              else{
                    errorMessage = 'An error was found';
                                        console.log(errorMessage)
                    res.status(200).send(errorMessage)
                }               }
    /*catch(error){
        res.writeHead(500, {'Content-Type': 'text/plain'})
        console.log(error)
        // this just ends the session with an error - we dont want that - res.end('Server Error');
        res.redirect('/login')
    }
    /*catch{
        res.redirect('/register')
    }*/
)


app.post('/login', async (req,res)=>{
    //const {usercredential, passcredential} = req.body;
    console.log (usercredential)
    console.log(passcredential)
    const check = await newUser.findOne({ username: req.body.username });
    /*if (!check) {
        return res.status(400).send('Cannot find user');
    }*/
    usercredential = req.body.username;
    passcredential = req.body.password;
    const salt = await bcrypt.genSalt(10)
    console.log(salt);

    hashedPassword = await bcrypt.hash(passwordToString, salt)

    console.log(hashedPassword)
    accessToken = accessMyToken();

   const user = new newUser({
    username : usercredential,
    password : hashedPassword,
    accessToken: accessToken
});

    await user.save().then(()=>{
        console.log('User saved!');
    })
  
    //return res.json(accessToken)
    res.json({success:true, token: 'JWT '+ token, user : {username: usercredential,
            password: hashedPassword,
            accessToken: accessToken}
    })
    //res.redirect('/token');
    //res.json({ accessToken });
  })
  /*catch(err => {
    console.error('Save error:', err);
    res.status(400).json({ error: 'User validation failed', details: err });
  });*/
//})


function accessMyToken(){
    //console.log(user)
    return jwt.sign({userId: usercredential, pass:passcredential}, process.env.JWT_SECRET_KEY, {expiresIn: '604800'});
}

app.post('/token', (req,res) => {
    const refreshToken = req.body.token; 
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user)=>{
            if (err) return res.sendStatus(403)
                accessToken = generateAccessToken({username: usercredential})
        res.json({refreshToken})
            
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


app.listen(`${process.env.PORT}`, ()=>{
    console.log(`server is running at http://localhost:${process.env.PORT}`);
})