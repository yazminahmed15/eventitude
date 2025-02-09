const events = require("../controllers/event.server.controllers")
const auth = require ('../libs/authentication')

module.exports = function(app){  
    app.route("/events")
      .post(auth.isAuthenticated, events.create_event);

    app.route("/event/:event_id")
      .get(events.event_details);
    
    app.route("/event/:event_id")
      .patch(auth.isAuthenticated, events.update_event);
       
    app.route("/event/:event_id")
    .post(auth.isAuthenticated, events.attend_event); //register to attend an event

    app.route("/event/:event_id")
    .delete(auth.isAuthenticated, events.delete_event);

    app.route("/search")
    .get(events.search_event);
    
}

