import { createApp } from 'vue'
import App from './views/App.vue'

import router from "./router/index.js"

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

createApp(App).use(router).mount('#app')
