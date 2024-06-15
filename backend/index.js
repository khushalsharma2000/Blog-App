const express=require('express')
const app=express()
const mongoose=require('mongoose')
const dotenv=require('dotenv')
const cors=require('cors')
const multer=require('multer')
const path=require("path")
const cookieParser=require('cookie-parser')
const authRoute=require('./routes/auth')
const userRoute=require('./routes/users')
const postRoute=require('./routes/posts')
const commentRoute=require('./routes/comments')
const session = require('express-session');
const axios = require('axios');
const slackUser = require('./models/slackUser')

//database
const connectDB=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL)
        console.log("database is connected successfully!")

    }
    catch(err){
        console.log(err)
    }
}



//middlewares
dotenv.config()
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET, // Change this to a secret key for session encryption
    resave: false,
    saveUninitialized: true
}));
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'DELETE', 'PUT',],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use("/images",express.static(path.join(__dirname,"/images")))

app.get("/auth/slack", (req, res) => {
    console.log("Received request to /auth/slack");
    const scopes = "channels:read";
    res.redirect(
        `https://khushal-co.slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_CLIENT_ID}&user_scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(process.env.SLACK_REDIRECT_URI)}`
    );
});

app.get("/auth/slack/callback", async (req, res) => {
    const { code } = req.query;
    try {
        const tokenResponse = await axios.post(
            "https://slack.com/api/oauth.v2.access",
            null,
            {
                params: {
                    code,
                    client_id: process.env.SLACK_CLIENT_ID,
                    client_secret: process.env.SLACK_CLIENT_SECRET,
                    redirect_uri: process.env.SLACK_REDIRECT_URI,
                },
            }
        );
         console.log(tokenResponse.data);

        if (tokenResponse.data.ok) {
            const accessToken = tokenResponse.data.authed_user.access_token;
            const userId = tokenResponse.data.authed_user.id;
            

            const existingUser = await slackUser.findOne({ userId: userId });
            if(!existingUser) {

            req.session.slack_access_token = accessToken;


            req.session.slack_user_id = tokenResponse.data.authed_user.id;



            const channelsResponse = await axios.get(
                "https://slack.com/api/conversations.list",
                {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );

            if (channelsResponse.data.ok) {
                const channelId = channelsResponse.data.channels[0].id
                const user = new slackUser({
                    userId,
                    channelId,
                });
              await user.save();
                
                    // .map((channel) => channel.name)
                    // .join(", ");
                // res.send(
                //     `Authorization successful! Here are your channels: ${channels}`
                // );
                res.redirect(`${process.env.HOME_URL}?token=${accessToken}`);
            } else {
                res
                    .status(500)
                    .send(
                        "Error fetching channels: " + channelsResponse.data.error
                    );
            }
        }else{
            res.redirect(`${process.env.HOME_URL}?token=${accessToken}`);
        } 
    }
    else {
        res
            .status(500)
            .send("Error authorizing with Slack: " + tokenResponse.data.error);
    }

}
     catch (error) {
        console.error(error);
        res
            .status(500)
            .send(
                "Server error when exchanging code for token or fetching channels."
            );
    }
});


app.use("/api/auth",authRoute)
app.use("/api/users",userRoute)
app.use("/api/posts",postRoute)
app.use("/api/comments",commentRoute)

//image upload
const storage=multer.diskStorage({
    destination:(req,file,fn)=>{
        fn(null,"images")
    },
    filename:(req,file,fn)=>{
        fn(null,req.body.img)
        // fn(null,"image1.jpg")
    }
})

const upload=multer({storage:storage})
app.post("/api/upload",upload.single("file"),(req,res)=>{
    // console.log(req.body)
    res.status(200).json("Image has been uploaded successfully!")
})


app.listen(process.env.PORT,()=>{
    connectDB()
    console.log("app is running on port "+process.env.PORT)
})