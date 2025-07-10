//@ts-nocheck
import React, {useEffect, useState, useRef, useCallback, useMemo} from 'react';
import {
    ScrollView,
    StyleSheet,
    View,
    RefreshControl,
    Animated,
    Easing,
    TouchableWithoutFeedback,
} from 'react-native';
import {
    Avatar,
    Card,
    Text,
    useTheme,
    TouchableRipple,
    IconButton,
    Portal,
    Button,
    List,
} from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import useNotifications from '../hooks/useNotifications';
import GradientStatusBar from './GradientStatusBar';
import {useGlobalStyles} from '../styles/globalStyles';

const NotificationPage = () => {
    const theme = useTheme();
    const globalStyle = useGlobalStyles();
    const {
        data = [],
        isFetching,
        isLoading,
        refetch,
        markAsRead,
        deleteNotification,
    } = useNotifications();

    const [notifications, setNotifications] = useState([]);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [actionSheetVisible, setActionSheetVisible] = useState(false);
    const slideAnim = useState(new Animated.Value(300))[0];
    const fadeAnim = useState(new Animated.Value(0))[0];
    const actionSheetRef = useRef(null);

    const mappedNotifications = useMemo(() => {
        if (!data) return [];

        return data.map(item => {
            let parsedData = {};
            try {
                parsedData = JSON.parse(item?.data);
            } catch (err) {
                console.error('Failed to parse message:', item.message);
            }
            let icon = 'bell';

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

            return {
                ...item,
                icon,
                parsed: parsedData,
            };
        });
    }, [data]);

    useEffect(() => {
        if (actionSheetVisible) {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 250,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 300,
                    duration: 200,
                    easing: Easing.in(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [actionSheetVisible]);

 
    useEffect(() => {
        setNotifications(mappedNotifications);
    }, [mappedNotifications]); // Only update when mappedNotifications changes

    // Memoize the action handlers
    const handleAction = useCallback(
        async action => {
            if (!selectedNotification) return;

            try {
                if (action === 'markAsRead') {
                    await markAsRead(selectedNotification.id);
                    setNotifications(prev =>
                        prev.map(n =>
                            n.id === selectedNotification.id
                                ? {...n, read: true}
                                : n,
                        ),
                    );
                } else if (action === 'delete') {
                    await deleteNotification(selectedNotification.id);
                    setNotifications(prev =>
                        prev.filter(n => n.id !== selectedNotification.id),
                    );
                }
            } catch (error) {
                console.error('Error handling notification action:', error);
            }

            setActionSheetVisible(false);
        },
        [selectedNotification, markAsRead, deleteNotification],
    );

    const handleLongPress = useCallback(notification => {
        setSelectedNotification(notification);
        setActionSheetVisible(true);
    }, []);

     const handleOverlayPress = () => {
        setActionSheetVisible(false);
    };

  

    return (
        <>
            <GradientStatusBar />
            <LinearGradient
                colors={[
                    theme.colors.elevation.level1,
                    theme.colors.elevation.level1,
                ]}
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
                            refreshing={isFetching || isLoading}
                            onRefresh={refetch}
                            colors={[theme.colors.primary]}
                        />
                    }
                    contentContainerStyle={styles.container}
                    showsVerticalScrollIndicator={false}>
                    {notifications.map(notification => {
                        const {
                            id,
                            icon,
                            read,
                            parsed: {title = '', message = ''} = {},
                        } = notification;

                        return (
                            <TouchableRipple
                                key={id}
                                borderless={true}
                                onPress={() => {
                                    if (!read) {
                                        markAsRead(id);
                                        setNotifications(
                                            notifications.map(n =>
                                                n.id === id
                                                    ? {...n, read: true}
                                                    : n,
                                            ),
                                        );
                                    }
                                }}
                                onLongPress={() =>
                                    handleLongPress(notification)
                                }
                                style={[
                                    styles.card,
                                    !read && {
                                        borderLeftWidth: 4,
                                        borderLeftColor: theme.colors.primary,
                                    },
                                    {backgroundColor: theme.colors.surface},
                                ]}>
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
                                            numberOfLines={1}
                                            variant="titleMedium"
                                            style={styles.title}>
                                            {title}
                                        </Text>
                                        <Text
                                            numberOfLines={2}
                                            variant="bodyMedium"
                                            style={styles.description}>
                                            {message}
                                        </Text>
                                        <Text
                                            numberOfLines={1}
                                            variant="labelSmall"
                                            style={styles.time}>
                                            {new Date(
                                                notification.created_at,
                                            ).toLocaleString()}
                                        </Text>
                                    </View>
                                    <IconButton
                                        icon="dots-vertical"
                                        size={20}
                                        onPress={() =>
                                            handleLongPress(notification)
                                        }
                                        style={styles.moreButton}
                                    />
                                </Card.Content>
                            </TouchableRipple>
                        );
                    })}
                </ScrollView>

                {/* Overlay and Bottom Action Sheet */}
                <Portal>
                    {actionSheetVisible && (
                        <>
                            <TouchableWithoutFeedback
                                onPress={handleOverlayPress}>
                                <Animated.View
                                    style={[
                                        styles.overlay,
                                        {
                                            opacity: fadeAnim,
                                            backgroundColor:
                                                'rgba(0, 0, 0, 0.5)',
                                        },
                                    ]}
                                />
                            </TouchableWithoutFeedback>

                            <Animated.View
                                ref={actionSheetRef}
                                style={[
                                    styles.bottomModalContainer,
                                    {
                                        transform: [{translateY: slideAnim}],
                                        backgroundColor: theme.colors.surface,
                                    },
                                ]}>
                                <List.Section style={styles.actionSheetContent}>
                                    <List.Item
                                        title="Mark as read"
                                        left={() => (
                                            <List.Icon icon="email-open" />
                                        )}
                                        onPress={() =>
                                            handleAction('markAsRead')
                                        }
                                        disabled={selectedNotification?.read}
                                    />
                                    <List.Item
                                        title="Delete"
                                        left={() => <List.Icon icon="delete" />}
                                        onPress={() => handleAction('delete')}
                                        titleStyle={{color: theme.colors.error}}
                                    />
                                </List.Section>
                                <Button
                                    mode="text"
                                    onPress={() => setActionSheetVisible(false)}
                                    style={styles.cancelButton}>
                                    Cancel
                                </Button>
                            </Animated.View>
                        </>
                    )}
                </Portal>
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
        paddingBottom: 60,
    },
    card: {
        marginBottom: 12,
        borderRadius: 12,
        paddingVertical: 15,
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
        marginRight: 8,
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
    moreButton: {
        marginLeft: 'auto',
        marginRight: -8,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    bottomModalContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: 24,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -4},
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    actionSheetContent: {
        paddingHorizontal: 16,
    },
    cancelButton: {
        marginTop: 8,
        marginHorizontal: 16,
    },
});

export default NotificationPage;
