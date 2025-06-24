import React, {useState, useRef, useEffect} from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    TextInput,
    FlatList,
    TouchableWithoutFeedback,
    Keyboard,
    SafeAreaView,
    Animated,
    Text,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import {Portal, Modal, IconButton, useTheme} from 'react-native-paper';
import {PanGestureHandler, State} from 'react-native-gesture-handler';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MODAL_HEIGHT = 400;

const useStyles = () => {
    const theme = useTheme();

    return StyleSheet.create({
        modal: {
            margin: 0,
            justifyContent: 'flex-end',
        },
        backdrop: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.5)',
        },
        container: {
            backgroundColor: theme.colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            overflow: 'hidden',
        },
        safeArea: {
            flex: 1,
        },
        header: {
            paddingVertical: 10,
            alignItems: 'center',
            backgroundColor: theme.colors.surfaceVariant,
        },
        dragHandle: {
            width: 40,
            height: 5,
            backgroundColor: theme.colors.onSurfaceVariant,
            borderRadius: 5,
            opacity: 0.6,
        },
        chatContainer: {
            flex: 1,
            backgroundColor: theme.colors.surfaceVariant,
        },
        listContent: {
            paddingBottom: 80,
            paddingHorizontal: 16,
            paddingTop: 10,
        },
        messageBubble: {
            padding: 12,
            marginVertical: 4,
            borderRadius: 18,
            maxWidth: '80%',
        },
        userBubble: {
            alignSelf: 'flex-end',
            backgroundColor: theme.colors.primary,
            borderTopRightRadius: 4,
        },
        otherBubble: {
            alignSelf: 'flex-start',
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: 4,
            borderWidth: 1,
            borderColor: theme.colors.outline,
        },
        userText: {
            color: theme.colors.onPrimary,
        },
        otherText: {
            color: theme.colors.onSurface,
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            paddingVertical: 8,
            backgroundColor: theme.colors.surface,
            borderTopWidth: 1,
            borderColor: theme.colors.outlineVariant,
        },
        textInput: {
            flex: 1,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 8,
            marginRight: 8,
            maxHeight: 100,
            color: theme.colors.onSurface,
        },
        appContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.background,
        },
        openButton: {
            backgroundColor: theme.colors.primary,
        },
        timestamp: {
            fontSize: 10,
            color: theme.colors.onSurfaceVariant,
            marginTop: 4,
            alignSelf: 'flex-end',
        },
        sendButton: {
            marginLeft: 8,
            backgroundColor: theme.colors.primaryContainer,
        },
        sendIcon: {
            color: theme.colors.onPrimaryContainer,
        },
    });
};

const FacebookChatModal = ({visible, onDismiss, children}) => {
    const styles = useStyles();

    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const [enablePanGesture, setEnablePanGesture] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const panRef = useRef();

    // Animation effects
    useEffect(() => {
        Animated[visible ? 'spring' : 'timing'](translateY, {
            toValue: visible ? 0 : SCREEN_HEIGHT,
            duration: 250,
            useNativeDriver: true,
            damping: 20,
        }).start();
    }, [visible]);

    // Keyboard handling
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

    const onGestureEvent = Animated.event(
        [{nativeEvent: {translationY: translateY}}],
        {useNativeDriver: true},
    );

    const onHandlerStateChange = event => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            const {translationY} = event.nativeEvent;
            if (translationY > 100 && enablePanGesture) {
                Animated.timing(translateY, {
                    toValue: SCREEN_HEIGHT,
                    duration: 250,
                    useNativeDriver: true,
                }).start(onDismiss);
            } else {
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    damping: 20,
                }).start();
            }
        }
    };

    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss} style={styles.modal}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>

                <PanGestureHandler
                    ref={panRef}
                    onGestureEvent={onGestureEvent}
                    onHandlerStateChange={onHandlerStateChange}
                    activeOffsetY={10}
                    enabled={enablePanGesture}>
                    <Animated.View
                        style={[
                            styles.container,
                            {
                                height:
                                    keyboardHeight > 0
                                        ? SCREEN_HEIGHT - keyboardHeight
                                        : MODAL_HEIGHT,
                                transform: [{translateY}],
                            },
                        ]}>
                        <SafeAreaView style={styles.safeArea}>
                            <View style={styles.header}>
                                <View style={styles.dragHandle} />
                            </View>
                            {React.cloneElement(children, {
                                panHandlers: panRef.current?.panHandlers,
                                setEnablePanGesture,
                            })}
                        </SafeAreaView>
                    </Animated.View>
                </PanGestureHandler>
            </Modal>
        </Portal>
    );
};

const ChatContent = ({
    messages,
    panHandlers,
    setEnablePanGesture,
    setMessages,
}) => {
    const styles = useStyles();
    const flatListRef = useRef(null);
    const [input, setInput] = useState('');

    const handleScroll = event => {
        setEnablePanGesture(event.nativeEvent.contentOffset.y <= 0);
    };

    const sendMessage = () => {
        if (!input.trim()) return;

        const newMsg = {
            id: Date.now().toString(),
            text: input.trim(),
            isUser: true,
            timestamp: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            }),
        };

        setMessages(prev => [...prev, newMsg]);
        setInput('');

        // Auto-scroll and auto-reply
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({animated: true});

            // Simulate reply after 1 second
            setTimeout(() => {
                setMessages(prev => [
                    ...prev,
                    {
                        id: Date.now().toString(),
                        text: 'Thanks for your message!',
                        isUser: false,
                        timestamp: new Date().toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        }),
                    },
                ]);
                flatListRef.current?.scrollToEnd({animated: true});
            }, 1000);
        }, 100);
    };

    const renderMessage = ({item}) => (
        <View
            style={[
                styles.messageBubble,
                item.isUser ? styles.userBubble : styles.otherBubble,
            ]}>
            <Text style={item.isUser ? styles.userText : styles.otherText}>
                {item.text}
            </Text>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.chatContainer}
            {...panHandlers}>
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={item => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                onContentSizeChange={() =>
                    flatListRef.current?.scrollToEnd({animated: true})
                }
                keyboardDismissMode="interactive"
            />

            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="Type a message..."
                    style={styles.textInput}
                    value={input}
                    onChangeText={setInput}
                    onSubmitEditing={sendMessage}
                    returnKeyType="send"
                    multiline
                    blurOnSubmit={false}
                />
                <IconButton
                    icon="send"
                    size={24}
                    onPress={sendMessage}
                    disabled={!input.trim()}
                    style={styles.sendButton}
                />
            </View>
        </KeyboardAvoidingView>
    );
};

const App = () => {
    const styles = useStyles();
    const [visible, setVisible] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: '1',
            text: 'Hey there!',
            isUser: false,
            timestamp: '10:30 AM',
        },
        // ... rest of your initial messages with timestamps
    ]);

    return (
        <View style={styles.appContainer}>
            <IconButton
                icon="message"
                size={40}
                onPress={() => setVisible(true)}
                style={styles.openButton}
            />

            <FacebookChatModal
                visible={visible}
                onDismiss={() => setVisible(false)}>
                <ChatContent messages={messages} setMessages={setMessages} />
            </FacebookChatModal>
        </View>
    );
};

export default App;
