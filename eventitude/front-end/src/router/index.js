import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/pages/Home.vue'
import Login from '../views/pages/Login.vue'
import SignIn from '../views/pages/SignIn.vue'
import Search from '../views/pages/Search.vue'
import SingleEvent from '../views/pages/SingleEvent.vue'
import Dashboard from '../views/pages/Dashboard.vue'
import CreateEvent from '../views/pages/CreateEvent.vue'
import EditEvent from '../views/pages/EditEvent.vue'


const ifAuthenticated = (to,from, next) => {
    const loggedIn = localStorage.getItem('session_token');
    if(loggedIn) {
        next();
        return
    } else {
        next('/login');
    }
}


const routes = [

{ path: "/", component: Home },
{ path: "/login", component: Login },
{ path: "/sign-in", component: SignIn},
{ path: "/search", component: Search},
{ path: "/events/:id", component: SingleEvent},
{ path: "/dashboard", component: Dashboard, beforeEnter: ifAuthenticated},
{ path: "/create-event", component: CreateEvent, beforeEnter: ifAuthenticated},
{ path: "/edit-event/:id", component: EditEvent, beforeEnter: ifAuthenticated}

]

const router = createRouter({
    history: createWebHistory(), 
    routes,
})


export default router;
