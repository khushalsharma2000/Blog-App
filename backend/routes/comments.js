const express=require('express')
const router=express.Router()
const User=require('../models/User')
const bcrypt=require('bcrypt')
const Post=require('../models/Post')
const Comment=require('../models/Comment')
const verifyToken = require('../verifyToken')
const slackUser = require('../models/slackUser')
const axios = require('axios')
//CREATE
async function sendSlackNotification(userId, blogTitle, commentContent, username) {
    const token = process.env.SLACK_TOKEN; // Replace with your actual Slack OAuth token

    try {
        
        const response = await axios.post('https://slack.com/api/chat.postMessage', {
            channel: userId,
            text: `New comment on your blog post titled "${blogTitle}": ${commentContent} by ${username}` 
        }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data.ok) {
            console.log('Notification sent successfully');
        } else {
            console.error('Error sending notification:', response.data.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
router.post("/create",verifyToken,async (req,res)=>{
    try{
        const token = req.headers['authorization'].split(" ")[1];
        
        const newComment=new Comment(req.body)
        const savedComment=await newComment.save()
        const {comment,username,postId,userId} = req.body;
        const postData = await Post.findById(postId);
        const user = await slackUser.findOne({userId: postData.userId});
        console.log(user.channelId);
        await sendSlackNotification(user.userId, postData.title, comment,username);
        res.status(200).json(savedComment)
    }
    catch(err){
        res.status(500).json(err)
    }
     
})

//UPDATE
router.put("/:id",verifyToken,async (req,res)=>{
    try{
       
        const updatedComment=await Comment.findByIdAndUpdate(req.params.id,{$set:req.body},{new:true})
        res.status(200).json(updatedComment)

    }
    catch(err){
        res.status(500).json(err)
    }
})


//DELETE
router.delete("/:id",verifyToken,async (req,res)=>{
    try{
        await Comment.findByIdAndDelete(req.params.id)
        
        res.status(200).json("Comment has been deleted!")

    }
    catch(err){
        res.status(500).json(err)
    }
})




//GET POST COMMENTS
router.get("/post/:postId",async (req,res)=>{
    try{
        const comments=await Comment.find({postId:req.params.postId})
        res.status(200).json(comments)
    }
    catch(err){
        res.status(500).json(err)
    }
})


module.exports=router