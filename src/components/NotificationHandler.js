// src/components/NotificationHandler.js
import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import echo from '../services/echo';
import PushNotification from 'react-native-pusher-push-notifications';

const NotificationHandler = ({ userId }) => {
  useEffect(() => {
    // Initialize push notifications
    PushNotification.init({
      appKey: 'your_app_key',
      onNotification: notification => {
        Alert.alert('New Message', notification.message);
      },
    });

    // Subscribe to channel
    const channel = echo.private(`messages.${userId}`);

    // Listen for events
    channel.listen('.message.pushed', (data) => {
      Alert.alert('New Message', data.message);
      
      // Show push notification
      PushNotification.showNotification({
        title: 'New Message',
        message: data.message,
      });
    });

    return () => {
      channel.stopListening('.message.pushed');
      echo.leave(`messages.${userId}`);
    };
  }, [userId]);

  return null;
};

export default NotificationHandler;