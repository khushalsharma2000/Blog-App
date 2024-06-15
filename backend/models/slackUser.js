const mongoose=require('mongoose')

const slackUserSchema=new mongoose.Schema({
    userId:{
        type:String,
        required:true,
    },
    channelId:{
        type:String,
        required:true,
    },
    follower: {
        type:Array,
      },
},{timestamps:true})

module.exports=mongoose.model("slackUser",slackUserSchema)