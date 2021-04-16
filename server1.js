const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
const bcrypt = require("bcryptjs");
app.use(express.json());
app.listen(process.env.PORT || 4000)
const mongodb = require("mongodb");
const jwt = require("jsonwebtoken");

const URL = "mongodb+srv://dbuser:error404@cluster0.phwbo.mongodb.net/user?retryWrites=true&w=majority"
const DB = "user"
app.post('/register',async (req,res)=>{

    let connection = await mongodb.connect(URL);
    let db = connection.db(DB);
    try {
    if((await db.collection("user").find({email:req.body.email}).toArray()).length==0){
    let salt = await bcrypt.genSalt(10);
    let hash = await bcrypt.hash(req.body.password,salt);
    req.body.password = hash;
    console.log(req.body.password);
    req.body.income = [];
    req.body.expense = [];
    await db.collection("user").insertOne(req.body);
    res.json({"message":"user created"})
}
    else
    {
        res.json({"message":"user already exist"});
    }}
    catch(err)
    {
        console.log(err)
    }
})
app.post('/login',async (req,res)=>{

    let connection = await mongodb.connect(URL);
    let db = connection.db(DB);
    try {
    let user =(await db.collection("user").find({email:req.body.email}).toArray()); 
    if((await db.collection("user").find({email:req.body.email}).toArray()).length!=0){
     let p = await bcrypt.compare(req.body.password,user[0].password);
     if(p)
     {  
        let token = jwt.sign({_id:user[0]._id},"fhdskjhfkausdfkagsdfligasldfgasafa"); 
        res.json({"message":"Allowed",token,"userid":user[0]._id});
     } else
     {
        res.json({"message":"email or password is incorrect"});
     }
     }
    else
    {
        res.json({"message":"email or password is incorrect"});
    }}
    catch(err)
    {
        console.log(err)
        
    }
})

app.get("/user/:id", async (req,res)=>{
    let connection = await mongodb.connect(URL);
    let db = connection.db(DB);
    let user = await db.collection("user").find({_id:mongodb.ObjectID(req.params.id)}).toArray();
    console.log(user);
    res.json(user[0]);   
})

app.put("/income/:id",async(req,res)=>{
    let connection = await mongodb.connect(URL);
    let db = connection.db(DB);
    await db.collection("user").updateOne({_id:mongodb.ObjectID(req.params.id)},{$push:{income:req.body}});
    res.json({"message":"updated"})
})

app.put("/expense/:id",async(req,res)=>{
    let connection = await mongodb.connect(URL);
    let db = connection.db(DB);
    await db.collection("user").updateone({_id:mongodb.ObjectID(req.params.id)},{$push:{expense:req.body}});
    res.json({"message":"updated"})
})
