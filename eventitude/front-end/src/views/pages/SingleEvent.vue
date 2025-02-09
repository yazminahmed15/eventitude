<template>
    <div class="container py-4">
        <!-- Loading State -->
        <div v-if="loading" class="text-center">
            <em>Loading Event...</em>
        </div>

        <!-- Event Details -->
        <div v-else-if="event" class="card shadow-sm p-4">
            <h2 class="text-center mb-4">{{ event.name }}</h2>
            <div class="mb-3">
                <p><strong>Description:</strong> {{ event.description }}</p>
                <p><strong>Location:</strong> {{ event.location }}</p>
                <p><strong>Start Date:</strong> {{ new Date(event.start).toLocaleString() }}</p>
                <p><strong>Registration Closes:</strong> {{ new Date(event.close_registration).toLocaleString() }}</p>
                <p><strong>Max Attendees:</strong> {{ event.max_attendees }}</p>
                <p><strong>Number Attending:</strong> {{ event.number_attending }}</p>
            </div>

            <!-- Creator Information -->
            <div class="mb-4">
                <h4>Event Creator</h4>
                <p>{{ event.creator.first_name }} {{ event.creator.last_name }}</p>
                <p>{{ event.creator.email }}</p>
            </div>

            <!-- Attendees Section -->
            <div class="mb-4">
                <h4>Attendees</h4>
                <ul class="list-group">
                    <li v-for="attendee in event.attendees" :key="attendee.user_id" class="list-group-item">
                        {{ attendee.first_name }} {{ attendee.last_name }} - {{ attendee.email }}
                    </li>
                </ul>
            </div>

            <!-- Questions Section -->
            <div>
                <h4>Questions</h4>

                <!-- Add Question Form -->
                <form @submit.prevent="askQuestion" class="mb-3">
                    <textarea
                        v-model="newQuestion"
                        class="form-control mb-2"
                        placeholder="Ask a question"
                    ></textarea>
                    <button class="btn btn-primary">Submit Question</button>
                </form>
                <div v-if="error" class="alert alert-danger">
                    {{ error }}
                </div>

                <!-- Questions List -->
                <ul v-if="event.questions && event.questions.length" class="list-group">
                    <li v-for="question in event.questions" :key="question.question_id" class="list-group-item">
                        <div>
                            <p><strong>{{ question.question }}</strong></p>
                            <p>Asked by: {{ question.asked_by.first_name }}</p>
                            <p>Votes: {{ question.votes }}</p>
                        </div>
                        <div class="d-flex gap-2">
                            <button class="btn btn-success btn-sm" @click="upvoteQuestion(question.question_id)">
                                Upvote
                            </button>
                            <button class="btn btn-warning btn-sm" @click="downvoteQuestion(question.question_id)">
                                Downvote
                            </button>
                            <button
                                v-if="canDeleteQuestion(question)"
                                class="btn btn-danger btn-sm"
                                @click="deleteQuestion(question.question_id)"
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                </ul>
                <p v-else class="text-muted mt-3">No questions have been asked yet.</p>
            </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="alert alert-danger mt-4 text-center">
            {{ error }}
        </div>
    </div>
</template>

<script>
import { eventService } from '../../services/events.service';
import { questionService } from '../../services/questions.service';

export default {
    data() {
        return {
            event: [],
            error: "",
            loading: true,
            newQuestion: "",
        };
    },
    methods: {
        fetchEvent() {
            this.error = "";
            this.loading = true;

            eventService.getSingleEvent(this.$route.params.id)
                .then((event) => {
                    this.event = event;
                    this.loading = false;
                })
                .catch((error) => {
                    this.error = error;
                    this.loading = false;
                });
        },

        askQuestion() {
            if (!this.newQuestion.trim()) {
                this.error = "Question cannot be empty.";
                return;
            }

            questionService.askQuestion(this.$route.params.id, this.newQuestion.trim())
                .then(() => {
                    this.newQuestion = "";
                    this.fetchEvent(); // Refresh event to include the new question
                })
                .catch((error) => {
                    this.error = error;
                });
        },

        deleteQuestion(question_id) {
            questionService.deleteQuestion(question_id)
                .then(() => {
                    this.fetchEvent(); // Refresh event to remove the deleted question
                })
                .catch((error) => {
                    this.error = error;
                });
        },

        upvoteQuestion(question_id) {
            questionService.upvoteQuestion(question_id)
                .then(() => {
                    this.fetchEvent(); // Refresh event to update votes
                })
                .catch((error) => {
                    this.error = error;
                });
        },

        downvoteQuestion(question_id) {
            questionService.downvoteQuestion(question_id)
                .then(() => {
                    this.fetchEvent(); // Refresh event to update votes
                })
                .catch((error) => {
                    this.error = error;
                });
        },

        canDeleteQuestion(question) {
            const userId = Number(localStorage.getItem("user_id"));
            return (
                question.asked_by.user_id === userId || this.event.creator.creator_id === userId
            );
        },
    },
    created() {
        this.fetchEvent();
    },
};
</script>

<style>
.container {
    max-width: 800px;
}

.card {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    border: none;
    padding: 1.5rem;
}

.list-group-item {
    margin-bottom: 0.5rem;
}

textarea {
    resize: none;
}
</style>
