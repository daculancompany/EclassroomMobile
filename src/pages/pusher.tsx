// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Pusher, PusherEvent } from '@pusher/pusher-websocket-react-native';
import { Text } from 'react-native-paper';

const pusher = Pusher.getInstance();

const MessagesScreen = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const setupPusher = async () => {
      try {
        await pusher.init({
          apiKey: '2a008480987a89072eaf',
          cluster: 'ap1',
        });

        await pusher.connect();

        await pusher.subscribe({
          channelName: 'my-channel',
          onEvent: (event) => {
            if (!isMounted) return;

            if (event.eventName === 'my-event') {
              try {
                const parsed = JSON.parse(event.data);
                const data = parsed.message || parsed;

                setMessages((prevMessages) => {
                  const exists = prevMessages.some(
                    (m) =>
                      m.text === data.text &&
                      m.created_at === data.created_at
                  );
                  if (!exists) {
                    return [data, ...prevMessages];
                  }
                  return prevMessages;
                });
              } catch (e) {
                console.log('Invalid JSON:', event.data);
              }
            }
          },
        });
      } catch (error) {
        console.error('Pusher setup failed:', error);
      }
    };

    setupPusher();

    // Proper cleanup to avoid duplicate subscriptions
    return () => {
      isMounted = false;
      pusher.unsubscribe({ channelName: 'my-channel' });
      pusher.disconnect();
    };
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.messageBox}>
      <Text style={styles.username}>{item.user?.name || 'User'}:</Text>
      <Text style={styles.message}>{item.text}</Text>
      <Text style={styles.timestamp}>{item.created_at}</Text>
    </View>
  );

  return (
    <FlatList
      data={messages}
      renderItem={renderItem}
      keyExtractor={(_, index) => index.toString()}
      contentContainerStyle={styles.list}
      inverted
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  messageBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  username: {
    fontWeight: 'bold',
  },
  message: {
    fontSize: 16,
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: 'red',
    marginTop: 4,
  },
});

export default MessagesScreen;
