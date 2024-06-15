const express = require('express')
const router = express.Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const axios = require('axios')
const verifyToken1 = require('./verify')
const dotenv = require('dotenv')


//REGISTER
router.post("/register", async (req, res) => {
    const { email } = req.body;
    console.log(email)

  try {
    const slackToken = process.env.SLACK_TOKEN
    const response = await axios.post('https://slack.com/api/users.admin.invite', {
      email: email,
      token: slackToken,
      resend: true
    }, {
      headers: {
        'Authorization': `Bearer ${slackToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.ok) {
      res.json({ success: true });
    } else {
        console.log(response.data);
      res.json({ success: false, error: response.data.error });
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
})


//LOGIN
router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email })

        if (!user) {
            return res.status(404).json("User not found!")
        }
        const match = await bcrypt.compare(req.body.password, user.password)

        if (!match) {
            return res.status(401).json("Wrong credentials!")
        }
        const token = jwt.sign({ _id: user._id, username: user.username, email: user.email }, process.env.SECRET, { expiresIn: "3d" })
        const { password, ...info } = user._doc
        // console.log(info);
        res.status(200).json({ info, token })


    }
    catch (err) {
        res.status(500).json(err)
    }
})



//LOGOUT
router.get("/logout", async (req, res) => {
    try {
        res.clearCookie("token", { sameSite: "none", secure: true }).status(200).send("User logged out successfully!")

    }
    catch (err) {
        res.status(500).json(err)
    }
})

//REFETCH USER
router.get("/refetch", (req, res) => {
    verifyToken1(req,res);
})



module.exports = router