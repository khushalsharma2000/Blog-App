const axios = require('axios');

const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    // console.log(bearerHeader);

    if (typeof bearerHeader !== 'undefined') {
        const token = bearerHeader.split(' ')[1];

        // Uncomment and complete the JWT verification if needed
        // jwt.verify(token, process.env.SECRET, (err, data) => {
        //     if (err) {
        //         return res.status(404).json(err);
        //     }
        //     res.status(200).json(data);
        // });

        axios.get('https://slack.com/api/auth.test', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(response => {
            // console.log(req.body);
            // Assuming the verification is successful, call next to proceed to the next middleware
            req.body.userId=response.data.user_id;
            req.body.username=response.data.user;
            next();
        }).catch(error => {
            console.error('Error fetching user info:', error.message);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
                res.status(error.response.status).json({
                    error: error.response.data,
                    message: 'Failed to fetch user info from Slack API'
                });
            } else if (error.request) {
                console.error('Request data:', error.request);
                res.status(500).json({ error: 'No response received from Slack API' });
            } else {
                console.error('Error message:', error.message);
                res.status(500).json({ error: 'Error in setting up request to Slack API' });
            }
        });
    } else {
        res.status(401).json({ error: 'Authorization header not found' });
    }
};

module.exports = verifyToken;
