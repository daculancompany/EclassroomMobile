// src/services/echo.js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const echo = new Echo({
  broadcaster: 'pusher',
  key: 'ak_5x7d9f2g4h6j8k0l',
  cluster: 'your_app_cluster',
  forceTLS: true
});

export default echo;