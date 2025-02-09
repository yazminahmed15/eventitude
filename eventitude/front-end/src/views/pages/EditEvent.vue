<template>
  <div class="container mt-5">
    <h1 class="text-center mb-4">Edit Event</h1>
    <form @submit.prevent="submitForm" class="needs-validation">
      <div class="mb-3">
        <label for="name" class="form-label">Name:</label>
        <input v-model="form.name" id="name" type="text" class="form-control" />
        <div v-show="submitted && !form.name" class="invalid-feedback d-block">
          Name is required
        </div>
      </div>
      <div class="mb-3">
        <label for="description" class="form-label">Description:</label>
        <textarea v-model="form.description" id="description" class="form-control"></textarea>
        <div v-show="submitted && !form.description" class="invalid-feedback d-block">
          Description is required
        </div>
      </div>
      <div class="mb-3">
        <label for="location" class="form-label">Location:</label>
        <input v-model="form.location" id="location" type="text" class="form-control" />
        <div v-show="submitted && !form.location" class="invalid-feedback d-block">
          Location is required
        </div>
      </div>
      <div class="mb-3">
        <label for="start" class="form-label">Start Date:</label>
        <input v-model="form.start" id="start" type="datetime-local" class="form-control" />
        <div v-show="submitted && !form.start" class="invalid-feedback d-block">
          Start date is required
        </div>
      </div>
      <div class="mb-3">
        <label for="close_registration" class="form-label">Close Registration:</label>
        <input
          v-model="form.close_registration"
          id="close_registration"
          type="datetime-local"
          class="form-control"
        />
        <div v-show="submitted && !form.close_registration" class="invalid-feedback d-block">
          Close registration date is required
        </div>
      </div>
      <div class="mb-3">
        <label for="max_attendees" class="form-label">Max Attendees:</label>
        <input
          v-model="form.max_attendees"
          id="max_attendees"
          type="number"
          min="1"
          class="form-control"
        />
        <div v-show="submitted && !form.max_attendees" class="invalid-feedback d-block">
          Max attendees is required
        </div>
      </div>
      <button type="submit" class="btn btn-primary w-100">Update Event</button>
      <div v-if="error" class="alert alert-danger mt-3">
        {{ error }}
      </div>
    </form>
  </div>
</template>

<script>
import { eventService } from "../../services/events.service";

export default {
  data() {
    return {
      form: {
        name: "",
        description: "",
        location: "",
        start: "",
        close_registration: "",
        max_attendees: "",
      },
      eventId: this.$route.params.id,
      submitted: false,
      error: "",
    };
  },

  created() {
    eventService
      .getSingleEvent(this.eventId)
      .then((event) => {
        this.form.name = event.name;
        this.form.description = event.description;
        this.form.location = event.location;

        this.form.start = new Date(event.start).toISOString().slice(0, 16);
        this.form.close_registration = new Date(event.close_registration).toISOString().slice(0, 16);
        this.form.max_attendees = event.max_attendees;
      })
      .catch((error) => {
        this.error = error;
      });
  },
  methods: {
    submitForm() {
      this.submitted = true;
      this.error = "";

      const { name, description, location, start, close_registration, max_attendees } = this.form;

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
        this.error = "Close registration date should be before the event start date.";
        return;
      }

      const updatedData = {
        name,
        description,
        location,
        start: eventStart,
        close_registration: eventCloseRegistration,
        max_attendees,
      };

      eventService
        .updateEvent(this.eventId, updatedData)
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
