<template>
    <div class="container py-4">
        <!-- Page Title -->
        <h1 class="mb-4 text-center">Search Results</h1>

        <!-- Loading Indicator -->
        <div v-if="loading" class="text-center">
            <em>Searching...</em>
        </div>

        <!-- List of Events -->
        <div v-else>
            <ul class="list-group">
                <li 
                    v-for="event in events" 
                    :key="event.event_id" 
                    class="list-group-item mb-3"
                >
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h4>{{ event.name }}</h4>
                            <p>{{ event.description }}</p>
                        </div>
                        <router-link 
                            :to="'/events/' + event.event_id" 
                            class="btn btn-primary"
                        >
                            View Details
                        </router-link>
                    </div>
                </li>
            </ul>
            <p v-if="!events.length" class="text-center text-muted mt-4">No results found.</p>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="alert alert-danger mt-4 text-center">
            {{ error }}
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
            loading: true
        };
    },
    watch: {
        '$route.query': {
            handler() {
                this.fetchSearchResults();
            },
            immediate: true
        }
    },
    methods: {
        fetchSearchResults() {
            const queryParams = {
                q: this.$route.query.q || "",
                status: this.$route.query.status || "",
                limit: this.$route.query.limit || 20,
                offset: this.$route.query.offset || 0
            };

            this.error = "";
            this.loading = true;

            eventService.getEvent(queryParams)
                .then((events) => {
                    this.events = events;
                    this.loading = false;
                })
                .catch((error) => {
                    this.error = error;
                    this.loading = false;
                });
        }
    }
};
</script>

<style>

.container {
    max-width: 800px;
}

.list-group-item {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border: none;
    padding: 1.5rem;
    border-radius: 0.5rem;
}

.list-group-item h4 {
    margin-bottom: 0.5rem;
}

.btn {
    font-size: 0.9rem;
    padding: 0.5rem 1rem;
}
</style>
