// src/services/PusherService.js
import Pusher from 'pusher-js/react-native';
import { Platform } from 'react-native';

// Android emulator needs special host
const host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

const pusherClient = new Pusher('ak_5x7d9f2g4h6j8k0l', {  // Match PUSHER_APP_KEY in .env
  wsHost: host,
  wsPort: 6001,
  forceTLS: false,
  enabledTransports: ['ws', 'wss'],
  disableStats: true,
  cluster: 'mt1' // Required field even if unused
});

export default pusherClient;