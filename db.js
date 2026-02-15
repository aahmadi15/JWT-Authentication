import {mongoose} from 'mongoose'
mongoose.connect('mongodb://localhost:27017/tokens').then(()=>{
    console.log("mongodb connected")    
})
.catch((error)=>console.log(error))

const token = new mongoose.Schema({
    username: {type:String, unique: true, required: true},
    password: {type:String, required: true},
    accessToken: {type:String, required: true}
});

const newUser = new mongoose.model("User", token)

const user = await new newUser({
    username : usercredential,
    password : hashedPassword,
    accessToken: accessToken
})

export {newUser, token}