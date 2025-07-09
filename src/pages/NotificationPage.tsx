//@ts-nocheck
import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View, RefreshControl} from 'react-native';
import {Avatar, Card, Text, useTheme} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import useNotifications from '../hooks/useNotifications';
import GradientStatusBar from './GradientStatusBar';

const NotificationPage = () => {
    const theme = useTheme();
    const {data = [], isFetching, isLoading, refetch} = useNotifications();

    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!data) return;

        const mappedNotifications = data.map(item => {
            let parsedData = {};
            try {
                parsedData = JSON.parse(item?.data);
            } catch (err) {
                console.error('Failed to parse message:', item.message);
            }
            let icon = 'bell'; // default icon

            switch (item?.notifiable_type) {
                case 'classwork':
                    icon = 'book';
                    break;
                case 'message':
                    icon = 'email';
                    break;
                case 'payment':
                    icon = 'cash';
                    break;
                case 'event':
                    icon = 'calendar';
                    break;
                case 'update':
                    icon = 'update';
                    break;
                case 'follower':
                    icon = 'account-plus';
                    break;
                default:
                    icon = 'bell';
            }
            let data;

            return {
                ...item,
                icon,
                parsed: parsedData,
            };
        });

        setNotifications(mappedNotifications);
    }, [data]);

    console.log('notication', notifications);

    return (
        <>
            <GradientStatusBar />
            <LinearGradient
                colors={[theme.colors.elevation.level1, theme.colors.elevation.level1]}
                style={styles.gradientContainer}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}>
                <View style={styles.header}>
                    <Text variant="headlineMedium" style={styles.headerText}>
                        Notifications
                    </Text>
                </View>

                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={isFetching}
                            onRefresh={() => refetch()}
                        />
                    }
                    contentContainerStyle={styles.container}
                    showsVerticalScrollIndicator={false}>
                    {notifications.map(notification => {
                        const {
                            id,
                            icon,
                            read,
                            time,
                            parsed: {
                                title = '',
                                message = '',
                                class_id,
                                classwork_slug,
                            } = {},
                        } = notification;

                        return (
                            <Card
                                key={id}
                                style={[
                                    styles.card,
                                    !read && {
                                        borderLeftWidth: 4,
                                        borderLeftColor: theme.colors.primary,
                                    },
                                    {backgroundColor: theme.colors.surface},
                                ]}
                                elevation={2}>
                                <Card.Content style={styles.cardContent}>
                                    <Avatar.Icon
                                        icon={icon}
                                        size={40}
                                        style={[
                                            styles.avatar,
                                            {
                                                backgroundColor:
                                                    theme.colors
                                                        .secondaryContainer,
                                            },
                                        ]}
                                    />
                                    <View style={styles.textContainer}>
                                        <Text
                                            variant="titleMedium"
                                            style={styles.title}>
                                            {title}
                                        </Text>
                                        <Text
                                            variant="bodyMedium"
                                            style={styles.description}>
                                            {message}
                                        </Text>
                                        <Text
                                            variant="labelSmall"
                                            style={styles.time}>
                                            {time}
                                        </Text>
                                    </View>
                                </Card.Content>
                            </Card>
                        );
                    })}
                </ScrollView>
            </LinearGradient>
        </>
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
