import Vue, { createApp } from '@vue/compat';
import App from './App.vue'
import BootstrapVue from 'bootstrap-vue';
import { createI18n } from 'vue-i18n'

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import vnMessage from './lang/vn.json';

Vue.use(BootstrapVue);

// 1. Ready translated locale messages
// The structure of the locale message is the hierarchical object structure with each locale as the top property
const messages = {
  vn: vnMessage,
}

// 2. Create i18n instance with options
const i18n = createI18n({
  legacy: false,
  locale: 'vn', // set locale
  fallbackLocale: 'vn', // set fallback locale
  messages, // set locale messages
})

const app = createApp(App);
app.use(i18n)
app.mount('#app');