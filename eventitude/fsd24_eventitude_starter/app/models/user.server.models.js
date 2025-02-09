const db = require('../../database');
const crypto = require("crypto");

//Add a user
const addNewUser = (user,done) => {
    const salt = crypto.randomBytes(64);
    const hash = getHash(user.password, salt);

    const sql= 'INSERT INTO users (first_name, last_name, email, password, salt) VALUES (?,?,?,?,?)';
    let values = [user.first_name, user.last_name, user.email, hash, salt.toString('hex')];

    db.run(sql, values, function(err) {
        if(err) return done(err);
        return done (null, {user_id: this.lastID})
    })
};


const getHash = function(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 100000, 256, 'sha256').toString('hex');
};


//Log-in a user
const authenticateUser = (email, password, done) => {

    const sql = 'SELECT user_id, password, salt FROM users WHERE email= ?' ;

    db.get(sql, [email], (err, row) => {
        if(err) return done(err)
        if(!row) return done(404) //wrong email

        if(row.salt === null) row.salt = ''
        let salt = Buffer.from(row.salt, 'hex')

        if(row.password === getHash(password, salt)) {
            return done(false, row.user_id)
        } else {
            return done(404); //wrong password
        }
    })
};


//Log-out a user 
const removeToken = (token, done) => {
    const sql = 'UPDATE users SET session_token=null WHERE session_token=?'

    db.run(sql, [token], (err) => {
        return done(err)
    })
};


//getTokenID
const getIDFromToken = (token, done) => {

    if (!token) {
        console.warn("Missing token")
        return done(null, null);
    }
        
    const sql = 'SELECT user_id FROM users WHERE session_token=?'
    
    db.get(sql, [token] , (err, row) => {
        if (err) {
            return done(err, null);
        }

        if(!row) {           
            return done(null, null);
        }

        return done(null, row.user_id);
            
    })
};




//getToken
const getToken = (id, done) => {
    const sql = 'SELECT session_token FROM users WHERE user_id=?'
    db.get(sql, [id], (err, row) => {
        if(err) return done(err);

        if(row && row.session_token === null){
            setToken(id, (err, token) => {
                if(err) return done(err);
                return done(null, token);
            }) 
        } else if (row) {
            return done(null, row.session_token);
        } else {
            return done(null, null);
        }
    })
}
            
        
//Check if it already exists (not sure if it goes in the routes users/ app.post)

const check_if_already_exists = (id, done) => {
    if(id === undefined || id === null)
        return done(true, null);
    else {
         const sql = 'SELECT * FROM users WHERE user_id=?'
        db.get (sql, [id] , (err, row) => {
            if(row != null)
                return done(null, row.user_id);
            return done(err, null);

        })
    }
};

//Set Token
const setToken =(id, done) => {
    let token = crypto.randomBytes(16).toString('hex');

    const sql = 'UPDATE users SET session_token=? WHERE user_id=?'

    db.run(sql, [token, id], (err) => {
        return done(err, token)
    })
};




module.exports = {
    addNewUser : addNewUser,//create a user
    authenticateUser : authenticateUser, //authenticate user
    getToken : getToken, //get existing token [done]
    getIdFromToken : getIDFromToken, // get the user id associated with the given token [not entirely sure if done but probably yes]
    setToken : setToken, //create and store a new token for a user
    removeToken: removeToken, //remove a token for a user
    check_if_already_exists : check_if_already_exists // check if the user already exists when creating new one
}