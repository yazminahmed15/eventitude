<template>
    <div>
        <!-- Navigation Bar -->
        <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
            <div class="container">
                <!-- Brand -->
                <router-link class="navbar-brand" to="/">Eventitude</router-link>

                <!-- Toggle Button for Mobile View -->
                <button 
                    class="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarNav" 
                    aria-controls="navbarNav" 
                    aria-expanded="false" 
                    aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <!-- Navbar Links -->
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item">
                            <router-link class="nav-link" to="/">Home</router-link>
                        </li>
                        <li class="nav-item" v-if="isLoggedIn">
                            <router-link class="nav-link" to="/dashboard">Dashboard</router-link>
                        </li>
                    </ul>

                    <!-- Right Section for Login, Sign-In, and Logout -->
                    <ul class="navbar-nav">
                        <li class="nav-item" v-if="!isLoggedIn">
                            <router-link class="nav-link" to="/login">Login</router-link>
                        </li>
                        <li class="nav-item" v-if="!isLoggedIn">
                            <router-link class="nav-link" to="/sign-in">Sign-In</router-link>
                        </li>
                        <li class="nav-item" v-else>
                            <button class="btn btn-danger btn-sm nav-link" @click="logout">Logout</button>
                        </li>
                    </ul>

                    <!-- Search Bar -->
                    <form class="d-flex ms-3" @submit.prevent="pressSearch">
                        <input 
                            class="form-control me-2" 
                            type="search" 
                            v-model="searchQuery" 
                            placeholder="Search events..." 
                            aria-label="Search" 
                        />
                        <button class="btn btn-light" type="submit">Search</button>
                    </form>
                </div>
            </div>
        </nav>

        <!-- Main Content -->
        <router-view />
    </div>
</template>

<script>
import { userService } from '../services/users.service';

export default {
    data() {
        return {
            isLoggedIn: !!localStorage.getItem('session_token'),
            error: "",
            searchQuery: ""
        };
    },

    methods: {
        logout() {
            userService.logOut()
                .then(() => {
                    this.isLoggedIn = false;
                    this.$router.push('/');
                })
                .catch((error) => {
                    console.log(error);
                    this.error = error;
                });
        },

        pressSearch() {
            if (this.searchQuery.trim()) {
                this.$router.push({ path: '/search', query: { q: this.searchQuery.trim() } });
            }
        },
    },

    watch: {
        '$route': function () {
            this.isLoggedIn = !!localStorage.getItem('session_token');
        },
    }
};
</script>

<style>

.navbar-brand {
    font-weight: bold;
    font-size: 1.5rem;
}
.nav-link {
    font-size: 1rem;
}
</style>
