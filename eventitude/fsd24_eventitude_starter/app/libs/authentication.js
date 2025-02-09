
users = require('../models/user.server.models');



const isAuthenticated = function(req, res, next){
    let token = req.get('X-Authorization');
    console.log("Token received in request:", token);

    users.getIdFromToken(token, (err, id) => {
        if(err || id === null) {
            console.log("Authentication Failed");
            return res.sendStatus(401);
        }
        req.user_id = id;
        next();
    });
};

module.exports = {
    isAuthenticated : isAuthenticated
};
