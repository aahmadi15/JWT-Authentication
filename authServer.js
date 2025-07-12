import dotenv from 'dotenv'

import http from 'http'

import {user} from './middleware/db.js'

import express from 'express'
import jwt from 'jsonwebtoken'
import ejs from 'ejs';

const app = express()
app.use(express.static('public'));

app.use(express.urlencoded({extended:false}))
app.use(express.json());

dotenv.config({path: ".env"});

let usercredential
let userStore
let hashedPassword
let accessToken


app.set('view-engine', 'ejs')

console.log (user.collection.username)


/*app.get('/posts', authenticateToken, (req, res) =>{
    res.json(posts.filter(post => post.username === req.user.name));
})*/

/*app.post('/token', (req,res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user)=>{
            if (err) return res.sendStatus(403)
                accessToken = generateAccessToken({username: usercredential})
        res.json({accessToken: accessToken})
            
    })
})*/

app.post('/login', (req,res)=>{
    refreshToken = jwt.sign(user.collection.username, process.env.REFRESH_TOKEN_SECRET)
        hashedPassword = bcrypt.hash(req.body.password, 10)
            
            usercredential = req.body.email

            userStore = {user:username}

            
    const accessToken = generateAccessToken(user.username)
    const refreshToken = jwt.sign(newUser.username, process.env.REFRESH_TOKEN_SECRET)
    res.json({accessToken: accessToken, refreshToken: refreshToken})
})

/*app.delete('/logout', (req,res) =>{
    refreshToken = refreshToken.filter(token => token !== req.body.token)
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
}*/

/*function generateAccessToken(user){
    return jwt.sign(user.usercredential, process.env.JWT_SECRET_KEY, {expiresIn: '15s'})
}*/

app.listen(3000)
