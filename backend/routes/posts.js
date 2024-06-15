const express=require('express')
const router=express.Router()
const User=require('../models/User')
const bcrypt=require('bcrypt')
const Post=require('../models/Post')
const Comment=require('../models/Comment')
const slackUser=require('../models/slackUser')
const { WebClient } = require('@slack/web-api');

const verifyToken = require('../verifyToken')
const axios = require('axios');

//CREATE
async function sendSlackNotification(blogTitle, username, userId) {
    const token = process.env.SLACK_TOKEN; // Replace with your actual Slack OAuth token

    try {
        // Open a conversation with the user
        // const openChannelResponse = await axios.post('https://slack.com/api/conversations.open', {
        //     users:userId
        // }, {
        //     headers: {
        //         'Authorization': `Bearer ${token}`,
        //         'Content-Type': 'application/json'
        //     }
        // });

        // if (!openChannelResponse.data.ok) {
        //     throw new Error(openChannelResponse.data.error);
        // }

        // const channelId = openChannelResponse.data.channel.id;

        // Send the message to the channel
        const response = await axios.post('https://slack.com/api/chat.postMessage', {
            channel: userId,
            text: `New blog post titled "${blogTitle}" by ${username}` 
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
    

// Your OAuth token from the Slack app
// const token = 'xoxb-your-slack-bot-token';

// Initialize the Slack Web API client with the token
// const web = new WebClient(token);

// // The ID of the channel you want to send a message to
// // const channelId = 'C12345678';

// // The message text
// const messageText = 'Hello, this is a notification from another workspace!';

// // Function to send the message
// async function sendMessage() {
//   try {
//     // Use the chat.postMessage method to send the message
//     const conversationResult = await web.conversations.open({
//         users: userId,
//       });
  
//       const dmChannelId = conversationResult.channel.id;
  
//       // Use the chat.postMessage method to send the message
//       const result = await web.chat.postMessage({
//         channel: dmChannelId,
//         text: messageText,
//       });
      
//       console.log('Message sent: ', result.ts);
//   } catch (error) {
//     console.error('Error sending message: ', error);
//   }
// }

// // Call the function to send the message
// sendMessage();

}

router.post("/create", verifyToken, async (req, res) => {
    try {
        const newPost = new Post(req.body);
        const savedPost = await newPost.save();
        const { username, userId, title } = req.body;

        const user = await slackUser.findOne({ userId: userId });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        for (const followerId of user.follower) {
            // const follower = await slackUser.findOne({ userId: followerId });
            await sendSlackNotification(title, username, followerId);
            
            // if (follower && follower.channelId) {
            //      console.log(follower.channelId);
            //     await sendSlackNotification(title, username, follower.channelId);
            // } else {
            //     console.error(`User ID not found for user ${followerId}`);
            // }
        }

        res.status(200).json(savedPost);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ error: err.message });
    }
});

//UPDATE
router.put("/:id",verifyToken,async (req,res)=>{
    try{
       
        const updatedPost=await Post.findByIdAndUpdate(req.params.id,{$set:req.body},{new:true})
        res.status(200).json(updatedPost)

    }
    catch(err){
        res.status(500).json(err)
    }
})


//DELETE
router.delete("/:id",verifyToken,async (req,res)=>{
    try{
        await Post.findByIdAndDelete(req.params.id)
        await Comment.deleteMany({postId:req.params.id})
        res.status(200).json("Post has been deleted!")

    }
    catch(err){
        res.status(500).json(err)
    }
})


//GET POST DETAILS
router.get("/:id",async (req,res)=>{
    try{
        const post=await Post.findById(req.params.id)
        res.status(200).json(post)
    }
    catch(err){
        res.status(500).json(err)
    }
})

//GET POSTS
router.get("/",async (req,res)=>{
    const query=req.query
    
    try{
        const searchFilter={
            title:{$regex:query.search, $options:"i"}
        }
        const posts=await Post.find(query.search?searchFilter:null)
        res.status(200).json(posts)
    }
    catch(err){
        res.status(500).json(err)
    }
})

//GET USER POSTS
router.get("/user/:userId",async (req,res)=>{
    try{
        const posts=await Post.find({userId:req.params.userId})
        res.status(200).json(posts)
    }
    catch(err){
        res.status(500).json(err)
    }
})



module.exports=router