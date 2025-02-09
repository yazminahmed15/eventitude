const Joi = require("joi");
const users = require ('../models/user.server.models');


const create_account= (req, res) => {

    const schema  = Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(30).pattern(new RegExp('^(?=.*[0-9])(?=.*[a-z])[a-zA-Z0-9!@#$%^&*]{8,30}$')).required(),   
    });

    const { error } = schema.validate(req.body);
    if(error) return res.status(400).send({
        "error_message": error.details[0].message
    }); 

    users.addNewUser(req.body, (err, success) =>{
        if(err){

            if(err.errno === 19){
                return res.status(400).send({
                    "error_message": "A user with that email already exists"
                })
            }

            return res.sendStatus(500);
        }

        return res.status(201).send({
            user_id: success.user_id
        })
    })

}


const login = (req, res) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(30).pattern(new RegExp('^(?=.*[0-9])(?=.*[a-z])[a-zA-Z0-9!@#$%^&*]{8,30}$')).required(), 
    })


    const { error } = schema.validate(req.body);
    if(error) return res.status(400).send({
        "error_message": error.details[0].message}); 

    
    users.authenticateUser(req.body.email, req.body.password, (err, id) => {

        if(err === 404) return res.status(400).send({"error_message" : "Invalid email/pasword supplied"})
        if (err) return res.sendStatus(500)
            
        users.getToken(id,  (err, token ) => {
            if (err) return res.sendStatus(500)
            
            if(token) {
                    return res.status(200).send({"user_id": id, "session_token": token})
            } else {
                users.setToken(id, (err, token) => {
                    if (err) return res.sendStatus(500)
                    return res.status(200).send({"user_id": id, "session_token": token})
                })
            }
        })  
    });
}


const logout = (req, res) => { 
    let token = req.get('X-Authorization'); 

    if (!token) {
        return res.sendStatus(400) 
    }

    users.removeToken(token, (err) => {
        if(err) {
           
        if(err === 404) {
            return res.sendStatus(401)
        } 
            return res.sendStatus(500) 
        }

        return res.sendStatus(200)
    });
}


module.exports = {
    create_account : create_account,
    login: login,
    logout: logout
}