const createEvent= (eventData) => {

    return fetch("http://localhost:3333/events",
    {
        method: "POST",
        headers: {           
            "Content-Type": "application/json",
            "X-Authorization": localStorage.getItem("session_token")
        },
        body: JSON.stringify(eventData)
    })  
   .then((response) => {

    if (response.status === 201) {
        return response.json();
    } else if (response.status === 400) {
        throw "Bad request"
    } else if (response.status === 401) {
        throw "Unauthorised. Please Log-In"
    } else {
        throw "Something went wrong"
    }
   })
   .then((rJson) => {
    if(!rJson.event_id) {
        throw "Event not created due to unexpected response format. Please try again."
    }
    localStorage.setItem("event_id", rJson.event_id);
   })

   .catch(error => {
        console.log("Error:", error)
        return Promise.reject(error)
    });

}


const getEvent = (params = {}) => {

    const queryString = new URLSearchParams(params).toString(); 
    const url = queryString ? `http://localhost:3333/search?${queryString}` : "http://localhost:3333/search";

    return fetch(url, {
        headers: {
            "Content-Type": "application/json",
            "X-Authorization": localStorage.getItem("session_token")
        }
    })

    .then((response) => {
        if (response.status === 200) {
            return response.json();

        } else if (response.status === 400) {
            throw "Bad request"

        } else {
            throw "Something went wrong"
        }
    })
    .then((resJson) => {
        return resJson
    })
    .catch((error) => {
        console.log("Err", error)
        return Promise.reject(error)
    });
}



const getSingleEvent = (event_id) => {
    return fetch(`http://localhost:3333/event/${event_id}`)
    .then((response) => {
        if (response.status === 200) {
            return response.json();
        }else {
            throw "Something went wrong"
        }
    })
    .then((resJson) => {
        return resJson
    })
    .catch((error) => {
        return Promise.reject(error)
    });
}


const updateEvent = (event_id, updatedData) => {
    return fetch(`http://localhost:3333/event/${event_id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "X-Authorization": localStorage.getItem("session_token"),
        },
        body: JSON.stringify(updatedData),
    })
        .then((response) => {
            if (response.status === 200) {
                return response.json();
            } else if (response.status === 400) {
                throw "Bad request";
            } else if (response.status === 401) {
                throw "Unauthorised. Please log in.";
            } else if (response.status === 403) {
                throw "You are not allowed to update this event.";
            } else if (response.status === 404) {
                throw "Event not found.";
            } else {
                throw "Something went wrong.";
            }
        })
        .catch((error) => {
            console.log("Error:", error);
            return Promise.reject(error);
        });
};


const deleteEvent = (event_id) => {
    return fetch(`http://localhost:3333/event/${event_id}`, {
        method: "DELETE",
        headers: {
            "X-Authorization": localStorage.getItem("session_token"),
        },
    })
        .then((response) => {
            if (response.status === 200) {
                return response.json();
            } else if (response.status === 401) {
                throw "Unauthorised. Please log in.";
            } else if (response.status === 403) {
                throw "You are not allowed to delete this event, you can only delete your own events.";
            } else if (response.status === 404) {
                throw "Event not found.";
            } else {
                throw "Something went wrong.";
            }
        })
        .catch((error) => {
            console.log("Error:", error);
            return Promise.reject(error);
        });
};


const attendEvent = (event_id) => {
    return fetch(`http://localhost:3333/event/${event_id}`, {
        method: "POST",
        headers: {
            "X-Authorization": localStorage.getItem("session_token"),
        },
    })
        .then((response) => {
            if (response.status === 200) {
                return response.json();
            } else if (response.status === 401) {
                throw "Unauthorised. Please log in.";
            } else if (response.status === 403) {
                return response.json().then((body) => {
                    throw body.error_message || "Forbidden: You are already registered, registration is closed, or the event is at capacity.";
                });
            } else if (response.status === 404) {
                throw "Event not found.";
            } else {
                throw "Something went wrong.";
            }
        })
        .catch((error) => {
            console.log("Error:", error);
            return Promise.reject(error);
        });
};



export const eventService = {
    getEvent,
    getSingleEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    attendEvent,
    
}