const Joi = require("joi");
const events = require ('../models/event.server.models');
const users = require('../models/user.server.models')


const create_event = (req, res) => {  

    let currentDate = Date.now(); 
    const {start, close_registration} = req.body;


    if(start <= currentDate) {
    return res.status(400).send({"error_message":'Start date should be in the future'});
    }

    if (close_registration >= start || close_registration < 0) {
    return res.status(400).send({"error_message":'Close registration date should be before start date'});
    }

    const schema  = Joi.object({
        name: Joi.string().min(1).required(),
        description: Joi.string().min(1).required(),
        location: Joi.string().min(1).required(),
        start: Joi.number().required(),
        close_registration: Joi.number().required(),
        max_attendees: Joi.number().min(1).required()
    }).options({allowUnknown: false})

    
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).send({ "error_message": error.details[0].message });
    }

    if(!req.user_id) {
    return res.status(401).send({"error_message":'Unauthorized'});
    }

    const event = {
        name: req.body.name.trim(),
        description: req.body.description.trim(),
        location: req.body.location.trim(),
        start_date: start,
        close_registration,
        max_attendees: req.body.max_attendees,
        creator_id: req.user_id,
    };
          
    events.addEvent(event, (err, result) => {
    if(err) return res.sendStatus(500);
    return res.status(201).send({"event_id": result.event_id}); 

  })

}


const event_details = (req, res) => {  //working in postman dont know why its failing some tests in comman prompt
    const event_id = req.params.event_id;
    const session_token = req.get('X-Authorization');

    users.getIdFromToken(session_token, (err, user_id) => {
        if (err) {
            console.error('Error during authentication', err);
            return res.sendStatus(500);
        }

        events.getOne(event_id, (err, event) => {
            if (err) {
                console.error('Error retrieving event:', err);
                return res.sendStatus(500);
            }

            if (!event) {
                console.warn(`Event with ID ${event_id} not found`);
                return res.sendStatus(404);
            }

            events.getAttendees(event_id, (err, attendees) => {
                if (err) {
                    console.error('Error retrieving attendees:', err);
                    return res.sendStatus(500);
                }

                events.getQuestions(event_id, (err, questions) => {
                    if (err) {
                        console.error('Error retrieving questions:', err);
                        return res.sendStatus(500);
                    }

                    const response = {
                        "event_id": event.event_id,
                        "creator": {
                            "creator_id": event.creator_id,
                            "first_name": event.creator_first_name,
                            "last_name": event.creator_last_name,
                            "email": event.creator_email
                        },
                        "name": event.name,
                        "description": event.description,
                        "location": event.location,
                        "start": event.start,
                        "close_registration": event.close_registration,
                        "max_attendees": event.max_attendees,
                        "number_attending": event.number_attending,
                        "attendees": attendees?.map(a => ({
                            "user_id": a.user_id,
                            "first_name": a.first_name,
                            "last_name": a.last_name,
                            "email": a.email
                        })),
                        "questions": questions?.map(q => ({
                            "question_id": q.question_id,
                            "question": q.question,
                            "votes": q.votes,
                            "asked_by": {
                                "user_id": q.asked_by_user_id,
                                "first_name": q.asked_by_first_name
                            }
                        }))
                    };

                    if (!session_token || user_id !== event.creator_id) {
                        delete response.attendees;
                    }

                    console.log('Response sent:', response);
                    return res.status(200).send(response);
                });
            });
        });
    });
};



const update_event = (req, res) => {
    let currentDate = Date.now(); 
    const { start, close_registration, name, description, location, max_attendees } = req.body;

 
    if (start && start <= currentDate) {
        return res.status(400).send({ "error_message": "Start date should be in the future" });
    }

    if (close_registration && ((start && close_registration >= start) || close_registration < 0)) {
        return res.status(400).send({ "error_message": "Close registration date should be before start date" });
    }

    const schema = Joi.object({
        name: Joi.string().min(1).optional(),
        description: Joi.string().min(1).optional(),
        location: Joi.string().min(1).optional(),
        start: Joi.number().optional(),
        close_registration: Joi.number().optional(),
        max_attendees: Joi.number().min(1).optional()
    }).options({ allowUnknown: false });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).send({ "error_message": error.details[0].message });
    }

    if (!req.user_id) {
        return res.status(401).send({ "error_message": "Unauthorised" });
    }

    const event_id = req.params.event_id;

    events.getEventById(event_id, (err, event) => {
        if (err) {
            return res.status(500).send({ "error_message": "Internal server error" });
        }

        if (!event) {
            return res.status(404).send({ "error_message": "Event not found" });
        }

        if (req.user_id !== event.creator_id) {
            return res.status(403).send({ "error_message": "You can only update your own events" });
        }

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (location !== undefined) updates.location = location;
        if (start !== undefined) updates.start_date = start;
        if (close_registration !== undefined) updates.close_registration = close_registration;
        if (max_attendees !== undefined) updates.max_attendees = max_attendees;

        events.updateEvent(event_id, updates, req.user_id, (err, success) => {
            if (err) {
                return res.status(500).send({ "error_message": "Internal server error" });
            }

            if (!success) {
                return res.status(404).send({ "error_message": "Event not found or update failed" });
            }

            events.getEventById(event_id, (err, updatedEvent) => {
                if (err) {
                    return res.status(500).send({ "error_message": "Internal server error" });
                }

                return res.status(200).send(updatedEvent);
            });
        });
    });
};



const attend_event = (req, res) => { //working in postman dont know why its failing some tests in comman prompt
    const event_id = req.params.event_id;
    const user_id = req.user_id;

    if (!user_id) {
        return res.status(401).send({ error_message: 'Unauthorised' });
    }

    events.getEventById(event_id, (err, event) => {
        if (err) return res.status(500).send({ error_message: 'Internal Server Error' });
        if (!event) return res.status(404).send({ error_message: 'Event not found' });

        const currentDate = Date.now();

        events.check_if_user_registered(event_id, user_id, (err, isRegistered) => {
            if (err) return res.status(500).send({ error_message: 'Internal Server Error' });
            if (isRegistered) {
                return res.status(403).send({ error_message: 'You are already registered' });
            }

            if (event.creator_id === user_id) {
                return res.status(403).send({ error_message: 'You are already registered' });
            }

            if (event.close_registration === -1 || event.close_registration <= currentDate) {
                return res.status(403).send({ error_message: 'Registration is closed' });
            }

            if (event.start_date <= currentDate) {
                return res.status(403).send({ error_message: 'Event has already started' });
            }

            events.getEventCapacity(event_id, (err, capacity) => {
                if (err) return res.status(500).send({ error_message: 'Internal Server Error' });

                if (capacity.current_attendees >= capacity.max_attendees) {
                    return res.status(403).send({ error_message: 'Event is at capacity' });
                }

                events.registerToAttendEvent(event_id, user_id, (err) => {
                    if (err) return res.status(500).send({ error_message: 'Internal Server Error' });

                    return res.status(200).send({ message: 'Successfully registered for the event' });
                });
            });
        });
    });
};


const delete_event = (req, res) => { 

    const event_id = req.params.event_id;
    const user_id = req.user_id;

    events.getEventById(event_id, (err, event) => {
        if(err) return res.status(500).send({ error_message: 'Database error' });
        if (!event) return res.status(404).send({ error_message: 'Event not found' });
        if (event.creator_id !== user_id) {
            return res.status(403).send({ error_message: 'You can only delete events you created' });
        }

        events.archiveEvent(event_id, (err) => {
            if(err) return res.sendStatus(500);
            return res.status(200).send({ message: 'Event archived successfully' });
        })
    })

}


const search_event = (req, res) => { //working in postman dont know why its failing some tests in comman prompt
    const { q, status , limit = 20, offset = 0} = req.query;
    const user_id = req.user_id

    if (limit < 1 || limit > 100 || offset < 0) {
        return res.status(400).send({ error_message: "Bad Request" });
    }

    const validStatuses = ["MY_EVENTS", "ATTENDING", "OPEN", "ARCHIVE"];
    if (status && !validStatuses.includes(status)) {
        return res.status(400).send({ error_message: "Bad Request" });
    }

    if ((status === "MY_EVENTS" || status === "ATTENDING") && !user_id) {
        return res.status(400).send({ error_message: "Bad Request" });
    }


    events.searchEvents({query: q, status, limit, offset, user_id}, (err, eventList) => {
        if (err) {
            return res.status(500).send({ error_message: "Server Error" });
        }   
        return res.status(200).send(eventList);
    })

} 


module.exports = {
    create_event : create_event,
    event_details: event_details,
    update_event: update_event,
    attend_event: attend_event,
    delete_event: delete_event,
    search_event: search_event,
}