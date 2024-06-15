const axios = require('axios');

const verifyToken1 = (req, res) => {
    const bearerHeader = req.headers['authorization'];

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
            // console.log(response.data);
            res.status(200).json(response.data);
        }).catch(error => {
            console.log('Error fetching user info:', error);
            res.status(401).json({ error: 'Unauthorized' });
        });
    } else {
        res.status(401).json({ error: 'Authorization header not found' });
    }
};

module.exports = verifyToken1;
