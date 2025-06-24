// src/services/EchoService.js
import Echo from 'laravel-echo';
import pusherClient from './PusherService';

const echo = new Echo({
  broadcaster: 'pusher',
  client: pusherClient, // Explicitly pass the client
  key: 'ak_5x7d9f2g4h6j8k0l',  // Must match PUSHER_APP_KEY
});

export default echo;