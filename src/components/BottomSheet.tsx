//@ts-nocheck
import React, {useRef, useState, useEffect} from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    TouchableWithoutFeedback,
    Keyboard,
    SafeAreaView,
    Animated,
    Easing,
    ScrollView,
} from 'react-native';
import {Portal, Modal, useTheme} from 'react-native-paper';
import {PanGestureHandler, State} from 'react-native-gesture-handler';
import {BlurView} from '@react-native-community/blur';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const useStyles = () => {
    const theme = useTheme();

    return StyleSheet.create({
        modal: {
            margin: 0,
            justifyContent: 'flex-end',
            backgroundColor: 'transparent',
        },
        backdrop: {
            ...StyleSheet.absoluteFillObject,
        },
        container: {
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: -5,
            },
            shadowOpacity: 0.2,
            shadowRadius: 10,
            elevation: 10,
        },
        safeArea: {
            flex: 1,
        },
        header: {
            paddingVertical: 12,
            alignItems: 'center',
            justifyContent: 'center',
        },
        dragHandleContainer: {
            width: 60,
            height: 15,
            alignItems: 'center',
            justifyContent: 'center',
        },
        dragHandle: {
            width: 50,
            height: 6,
            backgroundColor: theme.colors.onSurfaceVariant,
            borderRadius: 4,
            opacity: 0.8,
        },
        closeButton: {
            position: 'absolute',
            right: 16,
            top: 12,
        },
        contentContainer: {
            flex: 1,
            paddingBottom: 20,
        },
    });
};

const BottomSheet = ({
    visible,
    onDismiss,
    children,
    enablePanGesture = true,
    showDragHandle = true,
    showCloseButton = true,
    heightPercentage = 0.9,
    isScroll = false,
}) => {
    const styles = useStyles();
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isScrollAtTop, setIsScrollAtTop] = useState(true);
    const panGestureRef = useRef();
    const scrollViewRef = useRef();
    const startY = useRef(0);

    const modalHeight = SCREEN_HEIGHT * heightPercentage;

    useEffect(() => {
        if (visible) {
            translateY.setValue(SCREEN_HEIGHT);
            fadeAnim.setValue(0);

            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    speed: 30,
                    bounciness: 8,
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
                Animated.timing(translateY, {
                    toValue: SCREEN_HEIGHT,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    useEffect(() => {
        const showSub = Keyboard.addListener('keyboardDidShow', e => {
            setKeyboardHeight(e.endCoordinates.height);
        });
        const hideSub = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardHeight(0);
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const handleGestureEvent = (event) => {
        const { translationY } = event.nativeEvent;
        translateY.setValue(translationY);
    };

    const handleHandlerStateChange = (event) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            const { translationY } = event.nativeEvent;
            if (translationY > 100 && enablePanGesture && (isScroll ? isScrollAtTop : true)) {
                closeModal();
            } else {
                resetPosition();
            }
        }
    };

    const closeModal = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: SCREEN_HEIGHT,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start(onDismiss);
    };

    const resetPosition = () => {
        Animated.spring(translateY, {
            toValue: 0,
            speed: 30,
            bounciness: 8,
            useNativeDriver: true,
        }).start();
    };

    const handleScroll = (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        setIsScrollAtTop(offsetY <= 0);
    };

    const renderContent = () => {
        if (isScroll) {
            return (
                <ScrollView 
                    ref={scrollViewRef}
                    showsVerticalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    bounces={false}
                >
                    <View style={styles.contentContainer}>
                        {children}
                    </View>
                </ScrollView>
            );
        }
        return (
            <View style={styles.contentContainer}>
                {children}
            </View>
        );
    };

    return (
        <Portal>
            <Modal
                transparent={true}
                visible={visible}
                onDismiss={closeModal}
                style={styles.modal}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <Animated.View
                        style={[styles.backdrop, {opacity: fadeAnim}]}>
                        <BlurView
                            style={StyleSheet.absoluteFill}
                            blurType="dark"
                            blurAmount={2}
                            reducedTransparencyFallbackColor="white"
                        />
                    </Animated.View>
                </TouchableWithoutFeedback>
                {/* //keyboardHeight > 0 ? SCREEN_HEIGHT - keyboardHeight : modalHeight */}
                <Animated.View
                    style={[
                        styles.container,
                        {
                            height: modalHeight,
                            transform: [{translateY}],
                        },
                    ]}>
                    <SafeAreaView style={styles.safeArea}>
                        {showDragHandle && (
                            <PanGestureHandler
                                ref={panGestureRef}
                                onGestureEvent={handleGestureEvent}
                                onHandlerStateChange={handleHandlerStateChange}
                                activeOffsetY={10}
                                enabled={enablePanGesture && (isScroll ? isScrollAtTop : true)}>
                                <View style={styles.header}>
                                    <View style={styles.dragHandleContainer}>
                                        <View style={styles.dragHandle} />
                                    </View>
                                </View>
                            </PanGestureHandler>
                        )}
                        {renderContent()}
                    </SafeAreaView>
                </Animated.View>
            </Modal>
        </Portal>
    );
};

export default BottomSheet;