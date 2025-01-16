import './assets/main.css';
import 'primeicons/primeicons.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.js';
import VueApexCharts from 'vue3-apexcharts';
import router from './router';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);

app.config.productionTip = false;
app.use(router);
app.use(VueApexCharts);
app.component("apexchart", VueApexCharts);

app.mount('#app');