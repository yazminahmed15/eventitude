const db = require('../../database');

//Ask a question
const addQuestion = (question, done) => {
    const sql = 'INSERT INTO questions (event_id, asked_by, question, votes) VALUES (?, ?, ?, ?)';
    const values  = [question.event_id, question.user_id, question.question, question.votes || 0];

    db.run(sql, values, function (err) {
        if (err) {
            console.error("Database error in addQuestion:", err.message);
            return done(err);
        }
        return  done (null, {question_id: this.lastID})

    })
}

//delete a question

const deleteQuestion = (question_id, done) => {
    const sql = 'DELETE FROM questions WHERE question_id = ?'

    db.run (sql, [question_id], function (err){

        if(err){
            return done(err);
        }
        return done(null, {changes: this.changes});
    }) 
}

const getQuestionDetails = (question_id, done) => {

    const sql = 'SELECT * FROM questions WHERE question_id = ?';

    db.get(sql, [question_id], (err, row) => {
        if (err) {
            return done(err);
        }
        return done(null, row);
    });
}

const checkDeleteQuestionPermissions = (event_id, user_id, question_author_id, done) => {
    const sql = 'SELECT e.creator_id = ? AS isCreator FROM events e WHERE e.event_id = ?'

    db.get(sql, [user_id, event_id], (err, row) => {
        if (err) {
            return done(err);
        }
        if (!row) {
            return done(null, false, false)
        }

        const isCreator = !!row.isCreator;
        const isAuthor = user_id === question_author_id;
        return done(null, isCreator, isAuthor);
    });
}


//upvote a question
const checkIfUserVoted = (question_id, user_id, done) => { 

    const sql = 'SELECT 1 AS hasVoted FROM votes WHERE question_id = ? AND voter_id = ?'

    db.get(sql, [question_id, user_id], (err, row) => {
        if (err) return done(err);
        return done(null, !!row && row.hasVoted === 1)
    })

}

const addVote = (question_id, user_id, done) => {
    const sql = 'INSERT INTO votes (question_id, voter_id) VALUES (?, ?)'
    let values = [question_id, user_id];

    db.run(sql, values, function (err) {
        if (err) return done(err);
        return  done (null, this.changes > 0)
    })
}

const incrementQuestionVotes = (question_id, done) => {
    const sql = 'UPDATE questions SET votes = votes + 1 WHERE question_id = ?';

    db.run(sql, [question_id], function (err) {
        if (err) return done(err);
        return  done (null, this.changes > 0)
    })
}



// Remove a vote from the votes table
const removeVote = (question_id, user_id, done) => {
    const sql = 'DELETE FROM votes WHERE question_id = ? AND voter_id = ?';
    db.run(sql, [question_id, user_id], function (err) {
        if (err) return done(err);
        return done(null, this.changes > 0); // True if a vote was removed
    });
};

// Decrement the vote count for the question
const decrementQuestionVotes = (question_id, done) => {
    const sql = 'UPDATE questions SET votes = votes - 1 WHERE question_id = ?';
    db.run(sql, [question_id], function (err) {
        if (err) return done(err);
        return done(null, this.changes > 0); // True if the vote count was decremented
    });
};

module.exports = {
    addQuestion : addQuestion,
    deleteQuestion : deleteQuestion,
    getQuestionDetails : getQuestionDetails,
    checkDeleteQuestionPermissions : checkDeleteQuestionPermissions,
    checkIfUserVoted : checkIfUserVoted,
    addVote : addVote,
    incrementQuestionVotes : incrementQuestionVotes,
    removeVote : removeVote,
    decrementQuestionVotes : decrementQuestionVotes,
};