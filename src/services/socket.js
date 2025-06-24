// src/services/socket.js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js/react-native';

const echo = new Echo({
  broadcaster: 'pusher',
  key: 'ak_test123',
  wsHost: '192.168.0.103', // e.g., '192.168.1.100'
  wsPort: 6001,
  forceTLS: false,
});

export default echo;