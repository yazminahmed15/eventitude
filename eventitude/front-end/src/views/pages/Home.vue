<template>
    <div class="container my-5">
        <h1 class="text-center text-primary">Eventitude</h1>

        <!-- Navigation Buttons -->
        <div class="d-flex justify-content-center my-4">
            <button class="btn btn-outline-primary mx-2" @click="goToMyEvents">My Events</button>
            <button class="btn btn-outline-success mx-2" @click="goToCreateEvent">Create Event</button>
        </div>

        <div v-if="loading" class="text-center">
            <em>Loading Events...</em>
        </div>

        <!-- List of Events -->
        <div v-if="events.length" class="row g-3">
            <div class="col-md-6 col-lg-4" v-for="event in events" :key="event.event_id">
                <div class="card shadow-sm h-100">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title text-primary">{{ event.name }}</h5>
                        <p class="card-text">{{ event.description }}</p>
                        <div class="mt-auto">
                            <router-link :to="'/events/' + event.event_id">
                                <button class="btn btn-info btn-sm w-100 mb-2">Get Details</button>
                            </router-link>
                            <button class="btn btn-warning btn-sm w-100" @click="registerToAttend(event.event_id)">Register to Attend</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="error" class="alert alert-danger text-center mt-4">
            {{ error }}
        </div>

        <div v-if="!loading && !events.length" class="text-center mt-4">
            <p class="text-muted">No events available.</p>
        </div>
    </div>
</template>

<script>
import { eventService } from '../../services/events.service';

export default {
    data() {
        return {
            events: [],
            error: "",
            loading: true,
        };
    },
    methods: {
        goToMyEvents() {
            this.$router.push('/dashboard');
        },
        goToCreateEvent() {
            this.$router.push('/create-event');
        },
        registerToAttend(event_id) {
            this.error = "";

            eventService.attendEvent(event_id)
                .then(() => {
                    alert("You have successfully registered to attend the event.");
                })
                .catch((error) => {
                    if (error.includes("Forbidden")) {
                        this.error = "You cannot register for this event. It may already be at capacity, registration may be closed, or you may already be registered.";
                    } else if (error.includes("Unauthorised")) {
                        this.error = "You must be logged in to register for an event.";
                    } else if (error.includes("Event not found")) {
                        this.error = "The event you are trying to register for does not exist.";
                    } else {
                        this.error = error;
                    }
                });
        },
        fetchEvents() {
            this.error = "";
            this.loading = true;
            eventService.getEvent()
                .then((events) => {
                    this.events = events;
                    this.loading = false;
                })
                .catch((error) => {
                    this.error = error;
                    this.loading = false;
                });
        },
    },
    mounted() {
        this.fetchEvents();
    },
};
</script>

<style>

.card-title {
    font-weight: bold;
}
.card-text {
    font-size: 0.9rem;
}
</style>
