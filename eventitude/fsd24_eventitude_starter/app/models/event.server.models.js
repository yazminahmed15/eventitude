const db = require('../../database');



//Create an event // 
const addEvent = (event, done) => {
    const values = [event.name, event.description, event.location, event.start_date, event.close_registration, event.max_attendees, event.creator_id];
    const sql = 'INSERT INTO events (name, description, location, start_date, close_registration, max_attendees, creator_id) VALUES (?,?,?,?,?,?,?)' 
    
    db.run (sql, values, function (err){
        if (err) {
            return done(err);
        }
        
        return done(null, {event_id: this.lastID})  

    })
};

//Get a single event //  working in postman dont know why its failing some tests in comman prompt
const getOne = (event_id, done) => { 
    const sql = `SELECT 
            e.event_id, e.name, e.description, e.location, 
            e.start_date AS start, e.close_registration, e.max_attendees, 
            e.creator_id, 
            u.first_name AS creator_first_name, u.last_name AS creator_last_name, u.email AS creator_email,
            COUNT(a.user_id) AS number_attending 
        FROM events e
        LEFT JOIN users u ON e.creator_id = u.user_id
        LEFT JOIN attendees a ON e.event_id = a.event_id
        WHERE e.event_id = ?
        GROUP BY e.event_id, u.user_id;`;

    db.get(sql, [event_id], (err, event) => {
        if (err) {
            console.error(`Database events error for event_id ${event_id}`, err);
            return done(err);
        }
            
        if (!event) {
            console.warn(`Event not found for event_id ${event_id}`);
            return done(null, null);
        }

        console.log('Event retrieved from DB:', event);
        return done (null, event);

    })
}

const getAttendees = (event_id, done) => {
      const sql = `SELECT u.user_id, u.first_name, u.last_name, u.email
        FROM attendees a
        JOIN users u ON a.user_id = u.user_id
        WHERE a.event_id = ?`;

        db.all(sql, [event_id], (err, attendees) => {
            if (err) {
                console.error(`Database error in getAttendees:`, err);
                return done(err);
            }

            return done(null, attendees);
            
        }) 
    }

const getQuestions = (event_id, done) => {
    const sql = `SELECT q.question_id, q.question, q.votes,  q.asked_by AS asked_by_user_id, qu.first_name AS asked_by_first_name
    FROM questions q
    JOIN users qu ON q.asked_by = qu.user_id
    WHERE q.event_id = ?
    ORDER BY q.votes DESC;`;

    db.all(sql, [event_id], (err, questions) => {
        if (err) {
            console.error(`Database questions error for event_id ${event_id}`, err);
            return done(err);
            }      
            
            return done(null, questions);                
            
        })

}

//Update an event

const updateEvent = (event_id, event, creator_id, done) => { 

    let columnsUpdate = [];
    let values = [];

    if (event.name !== undefined) {
        columnsUpdate.push("name = ?");
        values.push(event.name);
    }
    if (event.description !== undefined) {
        columnsUpdate.push("description = ?");
        values.push(event.description);
    }
    if (event.location !== undefined) {
        columnsUpdate.push("location = ?");
        values.push(event.location);
    }
    if (event.start_date !== undefined) {
        columnsUpdate.push("start_date = ?");
        values.push(event.start_date);
    }
    if (event.close_registration !== undefined) {
        columnsUpdate.push("close_registration = ?");
        values.push(event.close_registration);
    }
    if (event.max_attendees !== undefined) {
        columnsUpdate.push("max_attendees = ?");
        values.push(event.max_attendees);
    }

    if (columnsUpdate.length === 0) {
        return done(null, false); // No fields to update
    }

    // Add creator_id and event_id for WHERE clause
    values.push(creator_id, event_id);
    
    const sql = `UPDATE events SET ${columnsUpdate.join(", ")} WHERE creator_id = ? AND event_id = ?`;
    
    db.run(sql, values, function(err) {
        if (err) return done(err);
        if(this.changes === 0 ) return done(null, false); // to check if update was successful (changes > 0) // no rows updated // (3rd down) successfully updated
        return done(null, true);
    })

};


//Register to attend an event 
const registerToAttendEvent = (event_id, user_id, done) => { //user must be logged in
    const sql = 'INSERT INTO attendees (event_id, user_id) VALUES (?,?)';

    db.run(sql, [event_id, user_id], (err) => {
        if (err) return done(err);
        return done(null);
    }); 
}



//check if user is already registered for event
const check_if_user_registered = (event_id, user_id, done) => {
    const sql = 'SELECT COUNT(*) AS count FROM attendees WHERE event_id = ? AND user_id = ?';
    let values = [event_id, user_id];

    db.get(sql, values, (err, row) => {
        if (err) return done(err);
        const isRegistered = row.count > 0;
        return done(null, isRegistered);
    })
} 


const getEventCapacity = (event_id, done) => {
    const sql = `SELECT e.max_attendees,
                (SELECT COUNT(*) FROM attendees WHERE event_id = e.event_id) AS current_attendees
        FROM events e
        WHERE e.event_id = ?;`;
    db.get(sql, [event_id], (err, row) => {
        if (err) return done(err);
        if (!row) return done(null, null); // Event not found
        return done(null, {
            max_attendees: row.max_attendees,
            current_attendees: row.current_attendees,
        });
    });
};

//Get Event by Id
const getEventById = (event_id, done) => {
    const sql = 'SELECT * FROM events WHERE event_id = ?';
    db.get(sql, [event_id] , (err, row) => {
        if (err) return done(err);
        if (!row) return done(null, null);
        done(null, row);
    });
}

const archiveEvent = (event_id,done) => {
    const sql = 'UPDATE events SET close_registration = -1 WHERE event_id = ?';
    
    db.run(sql, [event_id], done);
    
}

const checkUserEventPermissions = (event_id, user_id, done) => {

    const sql = `SELECT e.creator_id = ?  AS isCreator, 
    EXISTS (SELECT 1 FROM attendees WHERE event_id = ? AND user_id = ?) AS isRegistered
    FROM events e
    WHERE e.event_id = ?`;

    db.get(sql, [user_id, event_id, user_id, event_id], (err, row) => {

        if (err) {
            return done(err);
        }

        if (!row) {
            return done(null, false, false);
        }

        const isCreator = !!row.isCreator;
        const isRegistered = !!row.isRegistered;

        return done(null, isRegistered, isCreator); 

    })
}


//Search for an event 

const searchEvents = ({query, status, limit, offset, user_id}, done) => {

    const conditions = [];
    const params = [];
    const time = Date.now();


    if (query) {
        conditions.push("e.name LIKE ?");
        params.push(`%${query}%`);
    }

    if(status === "MY_EVENTS") {
        conditions.push("e.creator_id = ?");
        params.push(user_id);

    } else if (status === "ATTENDING"){
        conditions.push("EXISTS (SELECT 1 FROM attendees a WHERE a.event_id = e.event_id AND user_id = ?)");
        params.push(user_id);

    } else if(status === "OPEN") {
        conditions.push("e.close_registration > ?");
        params.push(time);

    } else if(status === "ARCHIVE"){
        conditions.push("e.close_registration <= ?");
        params.push(time);
    }


    const sql = `SELECT e.event_id, e.name, e.description, e.location, e.start_date, e.close_registration, e.max_attendees,
               e.creator_id, u.first_name AS creator_first_name, u.last_name AS creator_last_name, u.email AS creator_email
        FROM events e
        LEFT JOIN users u ON e.creator_id = u.user_id
        ${conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""}
        LIMIT ? OFFSET ?; `;

    params.push(Number(limit), Number(offset));


    db.all(sql, params, (err, rows) => {
        if (err) {
            return done(err, null);
        }

        const events = rows.map(row => ({
            "event_id": row.event_id,
            "creator": {
                "creator_id": row.creator_id,
                "first_name": row.creator_first_name,
                "last_name": row.creator_last_name,
                "email": row.creator_email
            },
            "name": row.name,
            "description": row.description,
            "location": row.location,
            "start": row.start_date,
            "close_registration": row.close_registration,
            "max_attendees": row.max_attendees
        }));

        return done(null, events);
        
    });

}



module.exports = {
    addEvent : addEvent,
    getOne :  getOne, 
    updateEvent : updateEvent,
    getEventById : getEventById,
    searchEvents : searchEvents,
    registerToAttendEvent : registerToAttendEvent,
    check_if_user_registered : check_if_user_registered, 
    getAttendees : getAttendees,
    getQuestions : getQuestions,
    archiveEvent : archiveEvent,
    getEventCapacity : getEventCapacity,
    checkUserEventPermissions : checkUserEventPermissions,
 
}