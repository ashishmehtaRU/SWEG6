const express=require("express")
const db=require("./db")

const router=express.Router()

router.post("/register",(req,res)=>{
const username=req.body.username
const email=req.body.email
const password=req.body.password

db.run("insert users",[username,email,password],function(err){
if(err){res.status(500).json({error:err})}
else{res.json({message:"user created"})}
})
})

router.post("/login",(req,res)=>{
const email=req.body.email
const password=req.body.password

db.get("select email and user",[email,password],(err,row)=>{
if(row){res.json({message:"sucessful login"})}
else{res.status(401).json({message:"not valid"})}
})
})

router.post("/logout",(req,res)=>{
res.json({message:"logout"})
})

module.exports=router