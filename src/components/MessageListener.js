// components/MessageListener.js
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import echo from '../services/echo';

const MessageListener = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const channel = echo.channel('public-messages');
    
    channel.listen('.PublicMessage', (data) => {
      setMessages(prev => [...prev, data.message]);
    });

    return () => {
      channel.stopListening('.PublicMessage');
      echo.leave('public-messages');
    };
  }, []);

  return (
    <View>
      {messages.map((msg, index) => (
        <Text key={index}>{msg}</Text>
      ))}
    </View>
  );
};

export default MessageListener;