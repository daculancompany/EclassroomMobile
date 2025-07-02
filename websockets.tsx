//@ts-nocheck
import React, { useEffect, useState } from 'react';
import { View, Text, Alert, TextInput, Button, StyleSheet } from 'react-native';
import Pusher from 'pusher-js/react-native';

const App = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);

  useEffect(() => {
    const pusher = new Pusher('local', {
      wsHost: '192.168.0.102',
      wsPort: 6001,
      forceTLS: false,
      disableStats: true,
      cluster: 'mt1',
      enabledTransports: ['ws'],
    });

    const channel = pusher.subscribe('public-channel');

    channel.bind('realtime-message', data => {
      setChat(prev => [{ text: data.message, id: Date.now().toString() }, ...prev]);
      Alert.alert('New Message', data.message);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, []);

  const sendMessage = async () => {
  if (!message.trim()) {
    Alert.alert('Error', 'Message cannot be empty');
    return;
  }

  try {
    const response = await fetch('http://192.168.0.102:8000/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    if (response.ok) {
      Alert.alert('Success', 'Message sent!');
      setMessage('');
    } else {
      console.error('API Error:', data);
      Alert.alert('Error', data.message || 'Something went wrong!');
    }
  } catch (error) {
    console.error('Network Error:', error);
    Alert.alert('Network Error', 'Unable to reach server. Check your connection.');
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.header}>React Native + Laravel WebSockets</Text>
      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Type message..."
        style={styles.input}
      />
      <Button title="Send" onPress={sendMessage} />
      <View style={{ marginTop: 20 }}>
        {chat.map(item => (
          <Text key={item.id} style={styles.message}>
            {item.text}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'flex-start' },
  header: { fontSize: 20, marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 10, padding: 10, borderRadius: 8 },
  message: { marginTop: 10, padding: 10, backgroundColor: '#eee', borderRadius: 6 },
});

export default App;

