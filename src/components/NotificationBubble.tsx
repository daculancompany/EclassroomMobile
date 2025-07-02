// @ts-nocheck
import React, {useEffect, useState, useRef} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import {
    Card,
    Title,
    Paragraph,
    IconButton,
    Button,
    useTheme,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const {width} = Dimensions.get('window');

const ICON_MAP = {
    info: 'information-outline',
    success: 'check-circle-outline',
    error: 'alert-circle-outline',
};

const NotificationBubble = ({
    id,
    title,
    message,
    className,
    time,
    type = 'info',
    onDismiss,
    onActionPress,
    index = 0,
}) => {
    const {colors} = useTheme();
    const FINAL_X = 10;
    const BASE_Y = 80;
    const translateX = useSharedValue(width);
    const translateY = useSharedValue(BASE_Y + index * 120);
    const opacity = useSharedValue(0);
    const [isVisible, setIsVisible] = useState(true);
    const [timestamp, setTimestamp] = useState(Date.now()); // to trigger re-render every minute
    const dismissed = useRef(false);

    // Slide in and fade in on mount
    useEffect(() => {
        translateX.value = withSpring(FINAL_X, {damping: 15});
        opacity.value = withTiming(1, {duration: 300});
    }, []);

    // Adjust vertical position when index changes
    useEffect(() => {
        if (!dismissed.current) {
            translateY.value = withSpring(BASE_Y + index * 155);
        }
    }, [index]);

    // Update time every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setTimestamp(Date.now());
        }, 60000); // 60 seconds
        return () => clearInterval(interval);
    }, []);

    const hideNotification = () => {
        if (dismissed.current) return;
        dismissed.current = true;
        translateX.value = withTiming(-width - 100, {duration: 200}); // Changed to negative width
        opacity.value = withTiming(0, {duration: 200}, () => {
            runOnJS(setIsVisible)(false);
            runOnJS(onDismiss)(id);
        });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            {translateX: translateX.value},
            {translateY: translateY.value},
        ],
        opacity: opacity.value,
    }));

    if (!isVisible) return null;

    return (
        <Animated.View style={[styles.notificationContainer, animatedStyle]}>
            <Card
                onPress={() => onActionPress?.(id)}
                style={[styles.card, {backgroundColor: colors.surface}]}>
                <Card.Content>
                    <View style={styles.header}>
                        <MaterialCommunityIcons
                            name={ICON_MAP[type] || 'bell-outline'}
                            size={20}
                            color={colors.primary}
                            style={styles.icon}
                        />
                        <Title
                            style={[styles.title, {color: colors.onSurface}]}>
                            {title}
                        </Title>
                        <IconButton
                            icon="close"
                            size={20}
                            onPress={hideNotification}
                        />
                    </View>
                    <Paragraph style={{color: colors.onSurface}}>
                        {message}
                    </Paragraph>
                    <Paragraph style={{color: colors.onSurface}}>
                        {className}
                    </Paragraph>
                    <View style={styles.buttonWrapper}>
                        <Paragraph
                            style={[
                                styles.time,
                                {color: colors.onSurfaceVariant ?? '#888'},
                            ]}>
                            {dayjs(time).fromNow()}
                        </Paragraph>
                        {onActionPress && (
                            <Button
                                icon="chevron-right"
                                contentStyle={{flexDirection: 'row-reverse'}}
                                mode="elevated"
                                compact
                                onPress={() => onActionPress(id)}
                                style={styles.actionButton}>
                                View
                            </Button>
                        )}
                    </View>
                </Card.Content>
            </Card>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    notificationContainer: {
        position: 'absolute',
        right: 10,
        zIndex: 999999,
    },
    card: {
        width: 300,
        elevation: 5,
        borderRadius: 12,
        // opacity: 0.98,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 8,
    },
    title: {
        fontSize: 16,
        flex: 1,
    },
    time: {
        marginTop: 6,
        fontSize: 12,
    },
    actionButton: {
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    buttonWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});

export default NotificationBubble;
