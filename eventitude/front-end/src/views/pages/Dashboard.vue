<template>
  <div class="container py-4">
    <h1 class="text-center mb-4">Dashboard</h1>
    <p class="text-center">Welcome to your dashboard, <strong>{{ user.name }}</strong>!</p>

    <!-- Create Event Button -->
    <div class="text-center mb-4">
      <button class="btn btn-primary" @click="goToCreateEvent">Create Event</button>
    </div>

    <!-- User's Events Section -->
    <section class="mb-4">
      <h2>Your Events</h2>
      <div v-if="userEvents.length" class="row">
        <div v-for="event in userEvents" :key="event.event_id" class="col-md-4 mb-3">
          <div class="card h-100">
            <div class="card-body">
              <h3 class="card-title">{{ event.name }}</h3>
              <p class="card-text">{{ event.description }}</p>
            </div>
            <div class="card-footer d-flex justify-content-between">
              <button class="btn btn-warning btn-sm" @click="goToEditEvent(event.event_id)">Edit</button>
              <button class="btn btn-danger btn-sm" @click="deleteEvent(event.event_id)">Delete</button>
              <router-link :to="`/events/${event.event_id}`" class="btn btn-info btn-sm">View</router-link>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="text-muted">You haven't created any events yet.</p>
    </section>

    <!-- Registered Events Section -->
    <section class="mb-4">
      <h2>Registered Events</h2>
      <div v-if="registeredEvents.length" class="row">
        <div v-for="event in registeredEvents" :key="event.event_id" class="col-md-4 mb-3">
          <div class="card h-100">
            <div class="card-body">
              <h3 class="card-title">{{ event.name }}</h3>
              <p class="card-text">{{ event.description }}</p>
            </div>
            <div class="card-footer">
              <router-link :to="`/events/${event.event_id}`" class="btn btn-info btn-sm w-100">View</router-link>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="text-muted">You haven't registered for any events yet.</p>
    </section>

    <!-- Archived Events Section -->
    <section class="mb-4">
      <h2>Archived Events</h2>
      <div v-if="archivedEvents.length" class="row">
        <div v-for="event in archivedEvents" :key="event.event_id" class="col-md-4 mb-3">
          <div class="card h-100">
            <div class="card-body">
              <h3 class="card-title">{{ event.name }}</h3>
              <p class="card-text">{{ event.description }}</p>
            </div>
            <div class="card-footer">
              <router-link :to="`/events/${event.event_id}`" class="btn btn-info btn-sm w-100">View</router-link>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="text-muted">No archived events.</p>
    </section>
  </div>
</template>

<script>
import { eventService } from "../../services/events.service";

export default {
  data() {
    return {
      user: {
        name: "User",
      },
      userEvents: [],
      registeredEvents: [],
      archivedEvents: [],
      error: "",
    };
  },
  methods: {
    fetchEvents() {
      this.error = "";
      eventService
        .getEvent()
        .then((events) => {
          const userId = Number(localStorage.getItem("user_id"));
          this.userEvents = events.filter((event) => event.creator.creator_id === userId);
          this.registeredEvents = events.filter(
            (event) => event.attendees && event.attendees.some((attendee) => attendee.user_id === userId)
          );
          this.archivedEvents = events.filter((event) => event.close_registration === -1);
        })
        .catch((error) => {
          this.error = error;
        });
    },
    goToCreateEvent() {
      this.$router.push("/create-event");
    },
    goToEditEvent(event_id) {
      this.$router.push(`/edit-event/${event_id}`);
    },
    deleteEvent(event_id) {
      this.error = "";
      eventService
        .deleteEvent(event_id)
        .then(() => {
          this.fetchEvents();
        })
        .catch((error) => {
          this.error = error;
        });
    },
  },
  mounted() {
    this.fetchEvents();
  },
};
</script>
