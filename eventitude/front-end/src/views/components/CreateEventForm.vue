<template>
    <div class="container py-4">
        <h1 class="text-center mb-4">Create Event</h1>
        <form @submit.prevent="submitForm" class="card p-4 shadow-sm">
            <!-- Event Name -->
            <div class="mb-3">
                <label for="name" class="form-label">Event Name:</label>
                <input
                    type="text"
                    v-model="name"
                    name="name"
                    class="form-control"
                    :class="{ 'is-invalid': submitted && !name }"
                />
                <div v-show="submitted && !name" class="invalid-feedback">
                    Event name is required
                </div>
            </div>

            <!-- Description -->
            <div class="mb-3">
                <label for="description" class="form-label">Description:</label>
                <textarea
                    v-model="description"
                    name="description"
                    class="form-control"
                    :class="{ 'is-invalid': submitted && !description }"
                ></textarea>
                <div v-show="submitted && !description" class="invalid-feedback">
                    Description is required
                </div>
            </div>

            <!-- Location -->
            <div class="mb-3">
                <label for="location" class="form-label">Location:</label>
                <input
                    type="text"
                    v-model="location"
                    name="location"
                    class="form-control"
                    :class="{ 'is-invalid': submitted && !location }"
                />
                <div v-show="submitted && !location" class="invalid-feedback">
                    Location is required
                </div>
            </div>

            <!-- Start Date & Time -->
            <div class="mb-3">
                <label for="start" class="form-label">Start Date & Time:</label>
                <input
                    type="date"
                    v-model="start"
                    name="start"
                    class="form-control"
                    :class="{ 'is-invalid': submitted && !start }"
                />
                <div v-show="submitted && !start" class="invalid-feedback">
                    Start date is required
                </div>
            </div>

            <!-- Close Registration -->
            <div class="mb-3">
                <label for="close_registration" class="form-label">Close Registration Date & Time:</label>
                <input
                    type="date"
                    v-model="close_registration"
                    name="close_registration"
                    class="form-control"
                    :class="{ 'is-invalid': submitted && !close_registration }"
                />
                <div v-show="submitted && !close_registration" class="invalid-feedback">
                    Close registration date is required
                </div>
            </div>

            <!-- Max Attendees -->
            <div class="mb-3">
                <label for="max_attendees" class="form-label">Max Attendees:</label>
                <input
                    type="number"
                    v-model="max_attendees"
                    name="max_attendees"
                    class="form-control"
                    :class="{ 'is-invalid': submitted && !max_attendees }"
                    min="1"
                />
                <div v-show="submitted && !max_attendees" class="invalid-feedback">
                    Max attendees is required
                </div>
            </div>

            <!-- Error Display -->
            <div v-if="error" class="alert alert-danger mb-3">
                {{ error }}
            </div>

            <!-- Submit Button -->
            <button class="btn btn-primary w-100">Create Event</button>
        </form>
    </div>
</template>


<script>
import { eventService } from "../../services/events.service";

export default {
    data() {
        return {
            name: "",
            description: "",
            location: "",
            start: "",
            close_registration: "",
            max_attendees: "",
            submitted: false,
            error: "",
        };
    },
    methods: {
        submitForm() {
            this.submitted = true;
            this.error = "";

            const { name, description, location, start, close_registration, max_attendees } = this;

            if (!(name && description && location && start && close_registration && max_attendees)) {
                this.error = "All fields are required";
                return;
            }

            const currentDate = Date.now();
            const eventStart = new Date(start).getTime();
            const eventCloseRegistration = new Date(close_registration).getTime();

            if (eventStart <= currentDate) {
                this.error = "Event start date should be in the future.";
                return;
            }

            if (eventCloseRegistration >= eventStart) {
                this.error = "Close registration date should be before event start date.";
                return;
            }

            const eventData = {
                name,
                description,
                location,
                start: eventStart,
                close_registration: eventCloseRegistration,
                max_attendees,
            };

            eventService
                .createEvent(eventData)
                .then(() => {
                    this.$router.push("/dashboard");
                })
                .catch((error) => {
                    this.error = error;
                });
        },
    },
};
</script>

<style>
.container {
    max-width: 600px;
}
.card {
    border-radius: 8px;
    border: none;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
