// @ts-nocheck
import React, {useState, useEffect, useRef} from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Keyboard,
    TextInput as TextInputreact,
    ImageBackground,
    RefreshControl,
} from 'react-native';
import {
    TextInput,
    Avatar,
    IconButton,
    useTheme,
    Badge,
    Text,
} from 'react-native-paper';
import dayjs from 'dayjs';
import {
    useQuery,
    useMutation,
    useQueryClient,
    useIsFetching,
} from 'react-query';
import axiosConfig from '../../utils/axiosConfig';
import LinearGradient from 'react-native-linear-gradient';
import useClassroomStore from '../../states/classroomState';
import {BASE_URL} from '../../utils/constant';

const PrivateMessage = ({classworkId}) => {
    const theme = useTheme();
    const [newMessage, setNewMessage] = useState('');
    const flatListRef = useRef(null);
    const queryClient = useQueryClient();
    const [shouldScroll, setShouldScroll] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const [unreadMessages, setUnreadMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const {currentUser, otherUser, classwork} = useClassroomStore();

    // WhatsApp color scheme
    const whatsAppColors = {
        headerBg: '#f0f2f5',
        sentBg: '#d9fdd3',
        receivedBg: '#ffffff',
        textDark: '#111b21',
        textLight: '#667781',
        border: '#e9edef',
        chatBg: '#e5ddd5',
    };

    // Mutation for marking messages as read
    const {mutate: markAsRead} = useMutation(
        async messageIds => {
            await axiosConfig.post(
                `classwork/${classworkId}/messages/mark-read`,
                {
                    message_ids: messageIds,
                },
            );
        },
        {
            onSuccess: () => {
                queryClient.invalidateQueries([
                    'classworkMessages',
                    classworkId,
                ]);
            },
        },
    );

    // Fetch messages with React Query
    const {
        data: messages = [],
        isFetching,
        refetch,
        isLoading,
    } = useQuery(
        ['classworkMessages', classworkId],
        async () => {
            const response = await axiosConfig.get(
                `classwork/${classworkId}/messages/${currentUser?.id}`,
            );
            return response.data.map(msg => ({
                ...msg,
                sender:
                    msg.sender_id === currentUser.id ? currentUser : otherUser,
                isNew: !msg.read_at && msg.sender_id !== currentUser.id,
            }));
        },
        {
            enabled: classwork ? true : false,
            refetchInterval: 10000,
            onSuccess: data => {
                const previousData = queryClient.getQueryData([
                    'classworkMessages',
                    classworkId,
                ]);

                // Update unread messages
                const newUnread = data.filter(
                    msg => !msg.read_at && msg.sender_id !== currentUser.id,
                );
                setUnreadMessages(newUnread);

                // On initial load or new messages, scroll to bottom
                if (
                    initialLoad ||
                    !previousData ||
                    data.length > previousData.length
                ) {
                    setShouldScroll(true);
                }

                if (initialLoad) {
                    setInitialLoad(false);
                }
            },
        },
    );



    // Send message mutation
    const {mutate: sendMessage} = useMutation(
        async messageData => {
            const response = await axiosConfig.post(
                `classwork/${classworkId}/messages`,
                messageData,
            );
            return response.data;
        },
        {
            onMutate: async newMessageData => {
                await queryClient.cancelQueries([
                    'classworkMessages',
                    classworkId,
                ]);

                const previousMessages =
                    queryClient.getQueryData([
                        'classworkMessages',
                        classworkId,
                    ]) || [];

                const optimisticMessage = {
                    ...newMessageData,
                    id: Date.now(),
                    created_at: new Date().toISOString(),
                    sender_id: currentUser.id,
                    sender: currentUser,
                    read_at: null,
                    is_read: false,
                };

                queryClient.setQueryData(
                    ['classworkMessages', classworkId],
                    [...previousMessages, optimisticMessage],
                );

                setShouldScroll(true);
                setLoading(false);
                Keyboard.dismiss();
                return {previousMessages};
            },
            onError: (err, newMessageData, context) => {
                setLoading(false);
                Keyboard.dismiss();
                queryClient.setQueryData(
                    ['classworkMessages', classworkId],
                    context.previousMessages,
                );
                antMessage.error('Failed to send message');
            },
            onSettled: () => {
                setLoading(false);
                queryClient.invalidateQueries([
                    'classworkMessages',
                    classworkId,
                ]);
                Keyboard.dismiss();
            },
        },
    );

    // Handle viewable items change to mark messages as read
    const onViewableItemsChanged = useRef(({viewableItems}) => {
        const unreadInView = viewableItems
            .filter(item => item.item.isNew)
            .map(item => item.item.id);

        if (unreadInView.length > 0) {
            markAsRead(unreadInView);
            setUnreadMessages(prev =>
                prev.filter(msg => !unreadInView.includes(msg.id)),
            );
        }
    });

    // Scroll to bottom when needed
    useEffect(() => {
        if (shouldScroll && flatListRef.current && messages.length > 0) {
            flatListRef.current.scrollToEnd({animated: true});
            setShouldScroll(false);
        }
    }, [messages, shouldScroll]);

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;
        const messageData = {
            classwork_id: classworkId,
            message: newMessage,
            sender_id: currentUser.id,
            [currentUser.role + '_id']: currentUser.id,
            [otherUser.role + '_id']: otherUser.id,
        };
        sendMessage(messageData);
        setNewMessage('');
    };

    // Message status indicator
    const MessageStatus = ({message}) => {
        if (message.sender_id !== currentUser.id) return null;

        return (
            <View style={{marginLeft: 4}}>
                {message.read_at ? (
                    <View style={{flexDirection: 'row'}}>
                        <IconButton
                            icon="check"
                            size={12}
                            color="#53bdeb"
                            style={{margin: 0, marginRight: -10}}
                        />
                        <IconButton
                            icon="check"
                            size={12}
                            color="#53bdeb"
                            style={{margin: 0}}
                        />
                    </View>
                ) : (
                    <IconButton
                        icon="check"
                        size={12}
                        color="#667781"
                        style={{margin: 0}}
                    />
                )}
            </View>
        );
    };

    // Render each message item
    const renderMessage = ({item}) => (
        <View
            style={[
                styles.messageContainer,
                item.sender_id === currentUser.id
                    ? styles.sentMessageContainer
                    : styles.receivedMessageContainer,
            ]}>
            <View
                style={[
                    styles.messageBubble,
                    item.sender_id === currentUser.id
                        ? {backgroundColor: whatsAppColors.sentBg}
                        : {backgroundColor: whatsAppColors.receivedBg},
                ]}>
                {item.isNew && <Badge style={styles.newBadge}>NEW</Badge>}
                {/* <Text
                    style={{whiteSpace: 'pre-line'}}
                    style={[
                        styles.messageText,
                        {color: whatsAppColors.textDark},
                    ]}>
                    {item.message}
                </Text> */}
                <Text
                    style={[
                        styles.messageText,
                        {
                            color: whatsAppColors.textDark,
                            flexDirection: 'row',
                            flexWrap: 'wrap',
                        },
                    ]}>
                    {item.message?.replace(/\n/g, '\u000A')}
                </Text>
                <View style={styles.messageTime}>
                    <Text
                        style={[
                            styles.timeText,
                            {color: whatsAppColors.textLight},
                        ]}>
                        {dayjs(item.created_at).format('h:mm A')}
                    </Text>
                    <MessageStatus message={item} />
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['rgba(246, 77, 246, 0.7)', 'rgba(61, 255, 255, 0.7)']}
                start={{x: 0, y: 0}} // Equivalent to 45deg in CSS
                end={{x: 1, y: 1}}
                style={[
                    styles.header,
                    {
                        backgroundColor: theme.colors.surfaceVariant,
                        borderBottomColor: theme.colors.outline,
                    },
                ]}>
                <View style={styles.headerContent}>
                    <Avatar.Icon
                        size={40}
                        icon="account"
                        style={{backgroundColor: '#dfe5e7', marginRight: 12}}
                    />
                    <View>
                        <Text variant="titleLarge">{otherUser.name}</Text>
                        <Text style={{color: theme.colors.secondary}}>
                            {otherUser.role === 'faculty'
                                ? 'Instructor'
                                : 'Student'}
                        </Text>
                    </View>
                </View>
                {/* <IconButton
                    icon="dots-vertical"
                    color={whatsAppColors.textLight}
                    onPress={() => {}}
                /> */}
            </LinearGradient>

            {/* Chat Area - FlatList */}
            <ImageBackground
                // source={{
                //     uri: `${BASE_URL}bg-message.png`,
                // }}
                style={[styles.background, {backgroundColor: '#fef1e8'}]}
                resizeMode="cover">
                <FlatList
                    showsVerticalScrollIndicator={false}
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id.toString()}
                    style={[
                        styles.chatArea,
                        // {backgroundColor: whatsAppColors.chatBg},
                    ]}
                    contentContainerStyle={styles.chatContent}
                    onViewableItemsChanged={onViewableItemsChanged.current}
                    viewabilityConfig={{
                        itemVisiblePercentThreshold: 50,
                    }}
                    inverted={false}
                    onContentSizeChange={() => {
                        if (shouldScroll) {
                            flatListRef.current?.scrollToEnd({animated: true});
                        }
                    }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isFetching}
                            onRefresh={() => refetch()}
                        />
                    }
                />
            </ImageBackground>
            {/* Input Area */}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <LinearGradient
                    colors={[
                        'rgba(246, 77, 246, 0.7)',
                        'rgba(61, 255, 255, 0.7)',
                    ]}
                    start={{x: 0, y: 0}} // Equivalent to 45deg in CSS
                    end={{x: 1, y: 1}}
                    style={[
                        styles.inputContainer,
                        {
                            backgroundColor: theme.colors.surfaceVariant,
                            borderTopColor: theme.colors.outline,
                        },
                    ]}>
                    <TextInputreact
                        style={[styles.input, {backgroundColor: '#ffffff'}]}
                        placeholder="Type a message"
                        value={newMessage}
                        onChangeText={setNewMessage}
                        multiline
                        underlineColorAndroid="transparent" // Removes underline on Android
                    />

                    <IconButton
                        icon="send"
                        color={
                            newMessage.trim()
                                ? theme.colors.surfaceVariant
                                : whatsAppColors.textLight
                        }
                        size={24}
                        disabled={!newMessage.trim() || loading}
                        loading={loading}
                        onPress={handleSendMessage}
                    />
                </LinearGradient>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // borderRadius: 8,
        overflow: 'hidden',
        elevation: 3,
        marginTop: 20,
    },
    header: {
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerName: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    headerRole: {
        fontSize: 12,
    },
    chatArea: {
        flex: 1,
    },
    chatContent: {
        padding: 10,
    },
    messageContainer: {
        marginBottom: 12,
        position: 'relative',
    },
    sentMessageContainer: {
        alignItems: 'flex-end',
    },
    receivedMessageContainer: {
        alignItems: 'flex-start',
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 8,
        borderRadius: 8,
        elevation: 1,
    },
    messageText: {
        fontSize: 16,
    },
    messageTime: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 4,
    },
    timeText: {
        fontSize: 11,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        marginHorizontal: 8,
        maxHeight: 100,
        borderColor: 'transparent',
        borderRadius: 8,
        paddingLeft: 15,
        paddingRightdsads: 15,
    },
    newBadge: {
        position: 'absolute',
        top: -10,
        backgroundColor: '#25D366',
        color: 'white',
        fontSize: 10,
    },
    background: {
        flex: 1,
    },
});

export default PrivateMessage;
