const Joi = require("joi");
const questions = require('../models/question.server.models')
const events = require('../models/event.server.models')

const ask_question = (req, res) => { 

    const schema = Joi.object({
        question: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    if(!req.user_id) {
        return res.status(401).send("Unauthorised");
    }

    const event_id = req.params.event_id;
    const user_id = req.user_id;

    events.checkUserEventPermissions(event_id, user_id, (err, isRegistered, isCreator) => {
        if(err) {
            console.error("Error checking user event permissions:", err);
            return res.status(500).send("Server Error");
        }

        if(!isRegistered) {
            console.warn("User not registered for the event");
            return res.status(403).send("You cannot ask questions on events you are not registered for");
        }
        if(isCreator) {
            console.warn("User is the creator of the event");
            return res.status(403).send("You cannot ask questions on your own events.");
        }
    

        const question = {
        event_id,
        user_id,
        question: req.body.question,
        votes: 0,
        }

        questions.addQuestion(question, (err, result) => {
            if(err) {
               console.error("Error adding question:", err);
                return res.status(500).send("Server Error");
            }

            console.log("Question added successfully:", result);
            return res.status(201).send({
            "question_id" : result.question_id

            })    
        })
    })
}

const delete_question = (req, res) => {

    const question_id = req.params.question_id;
    const user_id = req.user_id;

    if(!user_id){
        return res.status(401).send("Unauthorised");
    }

    questions.getQuestionDetails(question_id, (err, question) => {
        if(err){
            console.error("Error getting question details:", err);
            return res.status(500).send("Server Error");
        }

        if(!question){
            console.warn("Question not found");
            return res.status(404).send("Question not found");
        }

        const event_id = question.event_id;
        const question_author_id = question.asked_by;

        questions.checkDeleteQuestionPermissions(event_id, user_id, question_author_id, (err, isCreator, isAuthor) => {
            if(err) {
                console.error("Error checking user event permissions:", err);
                return res.status(500).send("Server Error");
            }

            if(!isCreator && !isAuthor) {
                console.warn("User is not the author of the question");
                return res.status(403).send("You can only delete questions you authored or for events you created.");
            }

            questions.deleteQuestion(question_id, (err, result) => {
                if(err) {
                    console.error("Error deleting question:", err);
                    return res.status(500).send("Server Error");
                }

                if(result.changes === 0) {
                    console.warn("Question not found to delete");
                    return res.status(404).send("Question not found to delete");
                }

                console.log("Question deleted successfully");
                return res.status(200).send("Question deleted successfully");
            })
        })
    })
}

const upvote_question = (req, res) => {

    const question_id = req.params.question_id;
    const user_id = req.user_id;

    if(!user_id){
        return res.status(401).send({ error_message: 'Unauthorised' });
    }

    questions.checkIfUserVoted(question_id, user_id, (err, hasVoted)=> {
        if(err) {
            return res.status(500).send({ error_message: 'Internal Server Error' });
        }

        if(hasVoted){
            return res.status(403).send({ error_message: 'You have already voted for this question' });
        }

        questions.addVote(question_id, user_id, (err, voteAdded) => {
            if(err) {
                return res.status(500).send({ error_message: 'Internal Server Error' });
            }

            if(!voteAdded){
                return res.status(404).send({ error_message: 'Question not found' });
            }

            questions.incrementQuestionVotes(question_id, (err, updated) => {
                if(err) {
                    return res.status(500).send({ error_message: 'Internal Server Error' });
                }

                if(!updated){
                    return res.status(404).send({ error_message: 'Question not found' });
                }
                return res.status(200).send({ message: 'Vote added' });
            })
        })
    })
}

const downvote_question = (req, res) => {

    const question_id = req.params.question_id;
    const user_id = req.user_id;

    if (!user_id) {
        return res.status(401).send({ error_message: 'Unauthorised' });
    }

    questions.checkIfUserVoted(question_id, user_id, (err, hasVoted) => {
        if (err) {
            console.error("Error checking user vote:", err);
            return res.status(500).send({ error_message: 'Internal Server Error' });
        }

        if (!hasVoted) {
            return res.status(403).send({ error_message: 'You have not voted for this question' });
        }

        questions.removeVote(question_id, user_id, (err, voteRemoved) => {
            if (err) {
                console.error("Error removing vote:", err);
                return res.status(500).send({ error_message: 'Internal Server Error' });
            }

            if (!voteRemoved) {
                return res.status(404).send({ error_message: 'Question not found' });
            }

   
            questions.decrementQuestionVotes(question_id, (err, updated) => {
                if (err) {
                    console.error("Error decrementing vote count:", err);
                    return res.status(500).send({ error_message: 'Internal Server Error' });
                }

                if (!updated) {
                    return res.status(404).send({ error_message: 'Question not found' });
                }

                console.log("Vote removed successfully");
                return res.status(200).send({ message: 'Vote removed' });
            });
        });
    });
}

module.exports = {
    ask_question: ask_question,
    delete_question: delete_question,
    upvote_question: upvote_question,
    downvote_question: downvote_question
}