const askQuestion = (event_id, question) => {
    return fetch(`http://localhost:3333/event/${event_id}/question`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Authorization": localStorage.getItem("session_token"),
        },
        body: JSON.stringify({ question }),
    })
        .then((response) => {
            if (response.status === 201) {
                return response.json();
            } else if (response.status === 400) {
                throw "Bad request: Question is invalid or missing.";
            } else if (response.status === 401) {
                throw "Unauthorised. Please log in.";
            } else if (response.status === 403) {
                throw "You cannot ask questions on events you are not registered for or on your own events.";
            } else {
                throw "Something went wrong.";
            }
        })
        .catch((error) => {
            console.log("Error:", error);
            return Promise.reject(error);
        });
};

const deleteQuestion = (question_id) => {
    return fetch(`http://localhost:3333/question/${question_id}`, {
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
                throw "You can only delete questions you authored or for events you created.";
            } else if (response.status === 404) {
                throw "Question not found.";
            } else {
                throw "Something went wrong.";
            }
        })
        .catch((error) => {
            console.log("Error:", error);
            return Promise.reject(error);
        });
};

const upvoteQuestion = (question_id) => {
    return fetch(`http://localhost:3333/question/${question_id}/vote`, {
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
                throw "You have already voted on this question.";
            } else if (response.status === 404) {
                throw "Question not found.";
            } else {
                throw "Something went wrong.";
            }
        })
        .catch((error) => {
            console.log("Error:", error);
            return Promise.reject(error);
        });
};

const downvoteQuestion = (question_id) => {
    return fetch(`http://localhost:3333/question/${question_id}/vote`, {
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
                throw "You have not voted on this question yet.";
            } else if (response.status === 404) {
                throw "Question not found.";
            } else {
                throw "Something went wrong.";
            }
        })
        .catch((error) => {
            console.log("Error:", error);
            return Promise.reject(error);
        });
};

export const questionService = {
    askQuestion,
    deleteQuestion,
    upvoteQuestion,
    downvoteQuestion,
}