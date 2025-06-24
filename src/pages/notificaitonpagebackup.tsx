import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Avatar, Card, Text, useTheme} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
z
const NotificationPage = () => {
    const theme = useTheme();

    // Sample notification data
    const notifications = [
        {
            id: 1,
            title: 'New Message',
            description: 'You have received a new message from Alex.',
            time: '2 mins ago',
            icon: 'email',
            read: false,
        },
        {
            id: 2,
            title: 'Payment Received',
            description:
                'Your payment of $250 has been processed successfully.',
            time: '1 hour ago',
            icon: 'cash',
            read: true,
        },
        {
            id: 3,
            title: 'Event Reminder',
            description: 'Team meeting tomorrow at 10:00 AM.',
            time: '3 hours ago',
            icon: 'calendar',
            read: false,
        },
        {
            id: 4,
            title: 'System Update',
            description:
                'New app version available. Update now for new features.',
            time: '1 day ago',
            icon: 'update',
            read: true,
        },
        {
            id: 5,
            title: 'New Follower',
            description: 'Sarah has started following you.',
            time: '2 days ago',
            icon: 'account-plus',
            read: true,
        },
    ];

    return (
        <LinearGradient
            colors={[theme.colors.primary, '#6e45e2']}
            style={styles.gradientContainer}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}>
            <View style={styles.header}>
                <Text variant="headlineMedium" style={styles.headerText}>
                    Notifications
                </Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}>
                {notifications.map(notification => (
                    <Card
                        key={notification.id}
                        style={[
                            styles.card,
                            !notification.read && {
                                borderLeftWidth: 4,
                                borderLeftColor: theme.colors.primary,
                            },
                        ]}
                        elevation={2}>
                        <Card.Content style={styles.cardContent}>
                            <Avatar.Icon
                                icon={notification.icon}
                                size={40}
                                style={[
                                    styles.avatar,
                                    {
                                        backgroundColor:
                                            theme.colors.secondaryContainer,
                                    },
                                ]}
                            />
                            <View style={styles.textContainer}>
                                <Text
                                    variant="titleMedium"
                                    style={styles.title}>
                                    {notification.title}
                                </Text>
                                <Text
                                    variant="bodyMedium"
                                    style={styles.description}>
                                    {notification.description}
                                </Text>
                                <Text variant="labelSmall" style={styles.time}>
                                    {notification.time}
                                </Text>
                            </View>
                        </Card.Content>
                    </Card>
                ))}
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradientContainer: {
        flex: 1,
    },
    header: {
        padding: 20,
        paddingTop: 50,
    },
    headerText: {
        color: 'white',
        fontWeight: 'bold',
    },
    container: {
        padding: 16,
        paddingBottom: 32,
    },
    card: {
        marginBottom: 12,
        borderRadius: 12,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    avatar: {
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    description: {
        color: '#555',
        marginBottom: 4,
    },
    time: {
        color: '#888',
    },
});

export default NotificationPage;
