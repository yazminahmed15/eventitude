const questions = require('../controllers/question.server.controllers')
const auth = require('../libs/authentication')

module.exports = function(app){

    app.route("/event/:event_id/question")
       .post(auth.isAuthenticated, questions.ask_question);

    app.route("/question/:question_id")
       .delete(auth.isAuthenticated, questions.delete_question);

    app.route("/question/:question_id/vote")
       .post(auth.isAuthenticated, questions.upvote_question);
    
    app.route("/question/:question_id/vote")
       .delete(auth.isAuthenticated, questions.downvote_question);
    
}