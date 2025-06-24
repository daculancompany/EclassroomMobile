//@ts-nocheck
import React, {useState} from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    FlatList,
    TextInput as PaperTextInput,
} from 'react-native';
import {
    Card,
    Avatar,
    Button,
    IconButton,
    Portal,
    Modal,
    Text,
    useTheme,
    FAB,
    Divider,
} from 'react-native-paper';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const MAX_INITIAL_COMMENTS = 3;

const BroadcastTab = () => {
    const theme = useTheme();
    const [announcements, setAnnouncements] = useState([
        {
            id: 1,
            title: 'Mobile Application Project Deadline',
            description:
                'The science project submission deadline has been extended to Friday, June 30th.',
            author: 'Niel Daculan',
            avatar: 'https://randomuser.me/api/portraits/men/9.jpg',
            datetime: '2023-06-10T14:30:00',
            likes: 12,
            liked: false,
            comments: [
                {
                    id: 101,
                    author: 'Alex Chen',
                    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
                    content: 'Can we work in groups?',
                    datetime: '2023-06-10T15:12:00',
                    likes: 3,
                    liked: false,
                    replies: [
                        {
                            id: 1001,
                            author: 'Ms. Johnson',
                            avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
                            content: 'Yes, groups of 2-3 students are allowed.',
                            datetime: '2023-06-10T15:30:00',
                            likes: 1,
                            liked: false,
                        },
                        {
                            id: 1002,
                            author: 'Sarah Lee',
                            avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
                            content: 'Looking for a group partner!',
                            datetime: '2023-06-10T16:45:00',
                            likes: 0,
                            liked: false,
                        },
                    ],
                },
                {
                    id: 102,
                    author: 'Michael Brown',
                    avatar: 'https://randomuser.me/api/portraits/men/52.jpg',
                    content: 'What about the word count?',
                    datetime: '2023-06-10T17:20:00',
                    likes: 2,
                    liked: true,
                    replies: [],
                },
                {
                    id: 103,
                    author: 'Emma Wilson',
                    avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
                    content: 'Is there a template we should follow?',
                    datetime: '2023-06-10T18:05:00',
                    likes: 0,
                    liked: false,
                    replies: [],
                },
                {
                    id: 104,
                    author: 'David Kim',
                    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
                    content: 'Can we submit early?',
                    datetime: '2023-06-10T19:30:00',
                    likes: 1,
                    liked: false,
                    replies: [],
                },
            ],
        },
        {
            id: 2,
            title: 'Field Trip Permission Slips',
            description:
                'Our field trip to the Natural History Museum is scheduled for June 25th.',
            author: 'Mr. Thompson',
            avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
            datetime: '2023-06-08T09:15:00',
            likes: 8,
            liked: true,
            comments: [],
        },
    ]);

    const [commentVisible, setCommentVisible] = useState({});
    const [replyingTo, setReplyingTo] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [replyText, setReplyText] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [visible, setVisible] = useState(false);
    const [commentsModalVisible, setCommentsModalVisible] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

    const toggleLike = (announcementId, commentId = null, replyId = null) => {
        setAnnouncements(prev =>
            prev.map(item => {
                if (item.id !== announcementId) return item;

                if (!commentId) {
                    return {
                        ...item,
                        liked: !item.liked,
                        likes: item.liked ? item.likes - 1 : item.likes + 1,
                    };
                }

                const updatedComments = item.comments.map(comment => {
                    if (comment.id !== commentId) return comment;

                    if (!replyId) {
                        return {
                            ...comment,
                            liked: !comment.liked,
                            likes: comment.liked
                                ? comment.likes - 1
                                : comment.likes + 1,
                        };
                    }

                    const updatedReplies = comment.replies.map(reply => {
                        if (reply.id !== replyId) return reply;
                        return {
                            ...reply,
                            liked: !reply.liked,
                            likes: reply.liked
                                ? reply.likes - 1
                                : reply.likes + 1,
                        };
                    });

                    return {
                        ...comment,
                        replies: updatedReplies,
                    };
                });

                return {
                    ...item,
                    comments: updatedComments,
                };
            }),
        );
    };

    const handleCommentSubmit = announcementId => {
        if (!commentText.trim()) return;

        const newComment = {
            id: Date.now(),
            author: 'You',
            avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
            content: commentText,
            datetime: new Date().toISOString(),
            likes: 0,
            liked: false,
            replies: [],
        };

        setAnnouncements(prev =>
            prev.map(item =>
                item.id === announcementId
                    ? {...item, comments: [...item.comments, newComment]}
                    : item,
            ),
        );

        setCommentText('');
        setCommentVisible(prev => ({...prev, [announcementId]: false}));
    };

    const handleReplySubmit = (announcementId, commentId) => {
        if (!replyText.trim()) return;

        const newReply = {
            id: Date.now(),
            author: 'You',
            avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
            content: replyText,
            datetime: new Date().toISOString(),
            likes: 0,
            liked: false,
        };

        setAnnouncements(prev =>
            prev.map(item =>
                item.id === announcementId
                    ? {
                          ...item,
                          comments: item.comments.map(comment =>
                              comment.id === commentId
                                  ? {
                                        ...comment,
                                        replies: [...comment.replies, newReply],
                                    }
                                  : comment,
                          ),
                      }
                    : item,
            ),
        );

        setReplyText('');
        setReplyingTo(null);
    };

    const openCommentsModal = announcement => {
        setSelectedAnnouncement(announcement);
        setCommentsModalVisible(true);
    };

    const renderCommentItem = ({
        item: comment,
        announcementId,
        isModal = false,
    }) => (
        <View style={styles.commentContainer}>
            <View style={styles.commentHeader}>
                <Avatar.Image size={32} source={{uri: comment.avatar}} />
                <View style={styles.commentContentContainer}>
                    <View
                        style={[
                            styles.commentBubble,
                            {backgroundColor: theme.colors.surfaceVariant},
                        ]}>
                        <Text style={styles.commentAuthor}>
                            {comment.author}
                        </Text>
                        <Text style={styles.commentText}>
                            {comment.content}
                        </Text>
                    </View>
                    <View style={styles.commentActions}>
                        <TouchableOpacity
                            onPress={() =>
                                toggleLike(announcementId, comment.id)
                            }>
                            <Text
                                style={[
                                    styles.actionText,
                                    comment.liked && styles.likedText,
                                ]}>
                                Like
                            </Text>
                        </TouchableOpacity>
                        <Text style={styles.actionDot}>·</Text>
                        <TouchableOpacity
                            onPress={() => setReplyingTo(comment.id)}>
                            <Text style={styles.actionText}>Reply</Text>
                        </TouchableOpacity>
                        <Text style={styles.actionDot}>·</Text>
                        <Text style={styles.commentTime}>
                            {dayjs(comment.datetime).fromNow()}
                        </Text>
                        {comment.likes > 0 && (
                            <>
                                <Text style={styles.actionDot}>·</Text>
                                <Text style={styles.likeCount}>
                                    {comment.likes}{' '}
                                    {comment.likes === 1 ? 'like' : 'likes'}
                                </Text>
                            </>
                        )}
                    </View>

                    {replyingTo === comment.id && (
                        <View style={styles.replyInputContainer}>
                            <PaperTextInput
                                mode="flat"
                                value={replyText}
                                onChangeText={setReplyText}
                                placeholder="Write a reply..."
                                style={[
                                    styles.replyInput,
                                    {backgroundColor: theme.colors.background},
                                ]}
                                underlineColor="transparent"
                                dense
                            />
                            <View style={styles.replyButtons}>
                                <Button
                                    mode="text"
                                    onPress={() =>
                                        handleReplySubmit(
                                            announcementId,
                                            comment.id,
                                        )
                                    }
                                    style={styles.submitReplyButton}
                                    labelStyle={styles.submitReplyButtonLabel}>
                                    Reply
                                </Button>
                                <Button
                                    mode="text"
                                    onPress={() => setReplyingTo(null)}
                                    style={styles.cancelReplyButton}
                                    labelStyle={styles.cancelReplyButtonLabel}>
                                    Cancel
                                </Button>
                            </View>
                        </View>
                    )}

                    {comment.replies?.length > 0 && (
                        <View style={styles.repliesContainer}>
                            {comment.replies.map(reply => (
                                <View
                                    key={reply.id}
                                    style={styles.replyContainer}>
                                    <Avatar.Image
                                        size={28}
                                        source={{uri: reply.avatar}}
                                    />
                                    <View style={styles.replyContentContainer}>
                                        <View
                                            style={[
                                                styles.replyBubble,
                                                {
                                                    backgroundColor:
                                                        theme.colors
                                                            .surfaceVariant,
                                                },
                                            ]}>
                                            <Text style={styles.commentAuthor}>
                                                {reply.author}
                                            </Text>
                                            <Text style={styles.commentText}>
                                                {reply.content}
                                            </Text>
                                        </View>
                                        <View style={styles.commentActions}>
                                            <TouchableOpacity
                                                onPress={() =>
                                                    toggleLike(
                                                        announcementId,
                                                        comment.id,
                                                        reply.id,
                                                    )
                                                }>
                                                <Text
                                                    style={[
                                                        styles.actionText,
                                                        reply.liked &&
                                                            styles.likedText,
                                                    ]}>
                                                    Like
                                                </Text>
                                            </TouchableOpacity>
                                            <Text style={styles.actionDot}>
                                                ·
                                            </Text>
                                            <Text style={styles.commentTime}>
                                                {dayjs(
                                                    reply.datetime,
                                                ).fromNow()}
                                            </Text>
                                            {reply.likes > 0 && (
                                                <>
                                                    <Text
                                                        style={
                                                            styles.actionDot
                                                        }>
                                                        ·
                                                    </Text>
                                                    <Text
                                                        style={
                                                            styles.likeCount
                                                        }>
                                                        {reply.likes}{' '}
                                                        {reply.likes === 1
                                                            ? 'like'
                                                            : 'likes'}
                                                    </Text>
                                                </>
                                            )}
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </View>
        </View>
    );

    const renderAnnouncement = ({item}) => {
        const initialComments = item.comments.slice(0, MAX_INITIAL_COMMENTS);
        const hasMoreComments = item.comments.length > MAX_INITIAL_COMMENTS;

        return (
            <Card
                style={[
                    styles.announcementCard,
                    {backgroundColor: theme.colors.surface},
                ]}>
                <Card.Content>
                    <View style={styles.announcementHeader}>
                        <Avatar.Image size={48} source={{uri: item.avatar}} />
                        <View style={styles.announcementInfo}>
                            <Text style={styles.announcementAuthor}>
                                {item.author}
                            </Text>
                            <Text style={styles.announcementTime}>
                                {dayjs(item.datetime).fromNow()}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.announcementTitle}>{item.title}</Text>
                    <Text style={styles.announcementContent}>
                        {item.description}
                    </Text>

                    <View style={styles.announcementStats}>
                        <View style={styles.likeCountContainer}>
                            <IconButton
                                icon="thumb-up"
                                size={16}
                                iconColor={theme.colors.primary}
                                style={styles.likeIcon}
                            />
                            <Text style={styles.likeCountText}>
                                {item.likes}
                            </Text>
                        </View>
                        <Text style={styles.commentCountText}>
                            {item.comments.length}{' '}
                            {item.comments.length === 1
                                ? 'comment'
                                : 'comments'}
                        </Text>
                    </View>

                    <Divider style={styles.divider} />

                    <View style={styles.announcementActions}>
                        <Button
                            mode="text"
                            icon={item.liked ? 'thumb-up' : 'thumb-up-outline'}
                            onPress={() => toggleLike(item.id)}
                            labelStyle={[
                                styles.actionButtonLabel,
                                item.liked && styles.likedButtonLabel,
                            ]}>
                            Like
                        </Button>
                        <Button
                            mode="text"
                            icon="comment-outline"
                            onPress={() =>
                                setCommentVisible(prev => ({
                                    ...prev,
                                    [item.id]: true,
                                }))
                            }
                            labelStyle={styles.actionButtonLabel}>
                            Comment
                        </Button>
                        <Button
                            mode="text"
                            icon="share-outline"
                            labelStyle={styles.actionButtonLabel}>
                            Share
                        </Button>
                    </View>

                    <Divider style={styles.divider} />

                    {item.comments.length > 0 && (
                        <>
                            <FlatList
                                data={initialComments}
                                renderItem={({item}) =>
                                    renderCommentItem({
                                        item,
                                        announcementId: item.id,
                                    })
                                }
                                keyExtractor={comment => comment.id.toString()}
                                scrollEnabled={false}
                            />

                            {hasMoreComments && (
                                <Button
                                    mode="text"
                                    onPress={() => openCommentsModal(item)}
                                    style={styles.viewMoreButton}>
                                    View{' '}
                                    {item.comments.length -
                                        MAX_INITIAL_COMMENTS}{' '}
                                    more comments
                                </Button>
                            )}
                        </>
                    )}

                    {commentVisible[item.id] && (
                        <View style={styles.commentInputContainer}>
                            <Avatar.Image
                                size={32}
                                source={{
                                    uri: 'https://randomuser.me/api/portraits/lego/1.jpg',
                                }}
                            />
                            <View
                                style={[
                                    styles.commentInputWrapper,
                                    {backgroundColor: theme.colors.background},
                                ]}>
                                <PaperTextInput
                                    mode="flat"
                                    value={commentText}
                                    onChangeText={setCommentText}
                                    placeholder="Write a comment..."
                                    style={[styles.commentInput]}
                                    underlineColor="transparent"
                                    dense
                                />
                                {commentText.length > 0 && (
                                    <Button
                                        mode="text"
                                        onPress={() =>
                                            handleCommentSubmit(item.id)
                                        }
                                        style={styles.submitCommentButton}
                                        labelStyle={
                                            styles.submitCommentButtonLabel
                                        }>
                                        Post
                                    </Button>
                                )}
                            </View>
                        </View>
                    )}
                </Card.Content>
            </Card>
        );
    };

    return (
        <>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={[
                    styles.container,
                    {backgroundColor: theme.colors.background},
                ]}>
                <FlatList
                    data={announcements}
                    renderItem={renderAnnouncement}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.announcementsList}
                />
            </KeyboardAvoidingView>

            <Portal>
                <Modal
                    visible={commentsModalVisible}
                    onDismiss={() => setCommentsModalVisible(false)}
                    contentContainerStyle={[
                        styles.commentsModalContainer,
                        {backgroundColor: theme.colors.background},
                    ]}>
                    {selectedAnnouncement && (
                        <Card style={styles.commentsModalCard}>
                            <Card.Title
                                title="Comments"
                                right={() => (
                                    <IconButton
                                        icon="close"
                                        onPress={() =>
                                            setCommentsModalVisible(false)
                                        }
                                    />
                                )}
                            />
                            <Card.Content style={styles.commentsModalContent}>
                                <FlatList
                                    data={selectedAnnouncement.comments}
                                    renderItem={({item}) =>
                                        renderCommentItem({
                                            item,
                                            announcementId:
                                                selectedAnnouncement.id,
                                            isModal: true,
                                        })
                                    }
                                    keyExtractor={comment =>
                                        comment.id.toString()
                                    }
                                    showsVerticalScrollIndicator={false}
                                />

                                <View style={styles.modalCommentInputContainer}>
                                    <Avatar.Image
                                        size={32}
                                        source={{
                                            uri: 'https://randomuser.me/api/portraits/lego/1.jpg',
                                        }}
                                    />
                                    <View
                                        style={styles.modalCommentInputWrapper}>
                                        <PaperTextInput
                                            mode="flat"
                                            value={commentText}
                                            onChangeText={setCommentText}
                                            placeholder="Write a comment..."
                                            style={styles.commentInput}
                                            underlineColor="transparent"
                                            dense
                                        />
                                        {commentText.length > 0 && (
                                            <Button
                                                mode="text"
                                                onPress={() => {
                                                    handleCommentSubmit(
                                                        selectedAnnouncement.id,
                                                    );
                                                    setCommentText('');
                                                }}
                                                style={
                                                    styles.submitCommentButton
                                                }
                                                labelStyle={
                                                    styles.submitCommentButtonLabel
                                                }>
                                                Post
                                            </Button>
                                        )}
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>
                    )}
                </Modal>
            </Portal>

            <Portal>
                <Modal
                    visible={visible}
                    onDismiss={() => setVisible(false)}
                    contentContainerStyle={[
                        styles.modalContainer,
                        {backgroundColor: theme.colors.background},
                    ]}>
                    <Card style={styles.createCard}>
                        <Card.Title title="Create Announcement" />
                        <Card.Content>
                            <PaperTextInput
                                label="Title"
                                value={title}
                                onChangeText={setTitle}
                                mode="outlined"
                                style={styles.inputField}
                            />
                            <PaperTextInput
                                label="Description"
                                value={description}
                                onChangeText={setDescription}
                                mode="outlined"
                                multiline
                                numberOfLines={4}
                                style={[
                                    styles.inputField,
                                    styles.descriptionInput,
                                ]}
                            />
                            <View style={styles.modalButtons}>
                                <Button
                                    mode="contained"
                                    onPress={() => {
                                        if (
                                            !title.trim() ||
                                            !description.trim()
                                        )
                                            return;
                                        const newAnnouncement = {
                                            id: Date.now(),
                                            title: title,
                                            description: description,
                                            author: 'You',
                                            avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
                                            datetime: new Date().toISOString(),
                                            likes: 0,
                                            liked: false,
                                            comments: [],
                                        };
                                        setAnnouncements(prev => [
                                            newAnnouncement,
                                            ...prev,
                                        ]);
                                        setTitle('');
                                        setDescription('');
                                        setVisible(false);
                                    }}
                                    style={styles.submitButton}>
                                    Post
                                </Button>
                                <Button
                                    onPress={() => setVisible(false)}
                                    style={styles.cancelButton}>
                                    Cancel
                                </Button>
                            </View>
                        </Card.Content>
                    </Card>
                </Modal>
            </Portal>

            <FAB
                icon="plus"
                style={[styles.fab, {backgroundColor: theme.colors.primary}]}
                onPress={() => setVisible(true)}
                color={theme.colors.onPrimary}
            />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    announcementsList: {
        paddingVertical: 8,
    },
    announcementCard: {
        marginHorizontal: 8,
        marginBottom: 8,
    },
    announcementHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    announcementInfo: {
        flex: 1,
        marginLeft: 12,
    },
    announcementAuthor: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    announcementTime: {
        color: '#65676B',
        fontSize: 12,
    },
    announcementTitle: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 8,
    },
    announcementContent: {
        fontSize: 15,
        lineHeight: 20,
        marginBottom: 12,
    },
    announcementStats: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    likeCountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    likeIcon: {
        margin: 0,
        marginRight: 4,
    },
    likeCountText: {
        fontSize: 13,
        color: '#65676B',
    },
    commentCountText: {
        fontSize: 13,
        color: '#65676B',
    },
    divider: {
        marginVertical: 8,
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#CED0D4',
    },
    announcementActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionButtonLabel: {
        fontSize: 14,
        color: '#65676B',
    },
    likedButtonLabel: {
        color: '#1877F2',
    },
    commentContainer: {
        marginTop: 8,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    commentContentContainer: {
        flex: 1,
        marginLeft: 8,
    },
    commentBubble: {
        borderRadius: 18,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 4,
    },
    commentAuthor: {
        fontWeight: 'bold',
        fontSize: 13,
        marginBottom: 2,
    },
    commentText: {
        fontSize: 14,
    },
    commentActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
        marginBottom: 8,
    },
    actionText: {
        fontSize: 12,
        color: '#65676B',
        fontWeight: 'bold',
    },
    likedText: {
        color: '#1877F2',
    },
    actionDot: {
        fontSize: 12,
        color: '#65676B',
        marginHorizontal: 4,
    },
    commentTime: {
        fontSize: 12,
        color: '#65676B',
    },
    likeCount: {
        fontSize: 12,
        color: '#65676B',
    },
    repliesContainer: {
        marginLeft: 36,
        marginTop: 4,
    },
    replyContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    replyContentContainer: {
        flex: 1,
        marginLeft: 8,
    },
    replyBubble: {
        borderRadius: 18,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 4,
    },
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    commentInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 18,
        marginLeft: 8,
        paddingRight: 8,
    },
    commentInput: {
        flex: 1,
        backgroundColor: 'transparent',
        fontSize: 14,
        paddingHorizontal: 12,
    },
    submitCommentButton: {
        minWidth: 0,
        paddingHorizontal: 8,
    },
    submitCommentButtonLabel: {
        fontSize: 14,
        color: '#1877F2',
        fontWeight: 'bold',
    },
    replyInputContainer: {
        marginTop: 8,
        marginLeft: 8,
    },
    replyInput: {
        borderRadius: 18,
        paddingHorizontal: 12,
    },
    replyButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 4,
    },
    submitReplyButton: {
        minWidth: 0,
        paddingHorizontal: 8,
    },
    submitReplyButtonLabel: {
        fontSize: 14,
        color: '#1877F2',
        fontWeight: 'bold',
    },
    cancelReplyButton: {
        minWidth: 0,
        paddingHorizontal: 8,
    },
    cancelReplyButtonLabel: {
        fontSize: 14,
        color: '#65676B',
    },
    modalContainer: {
        padding: 20,
    },
    createCard: {
        paddingBottom: 8,
    },
    inputField: {
        marginBottom: 16,
    },
    descriptionInput: {
        height: 120,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    submitButton: {
        marginLeft: 8,
    },
    cancelButton: {
        marginLeft: 8,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: '45%',
    },
    commentsModalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        margin: 0,
    },
    commentsModalCard: {
        maxHeight: '80%',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    commentsModalContent: {
        paddingBottom: 16,
    },
    viewMoreButton: {
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    modalCommentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#e0e0e0',
    },
    modalCommentInputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F2F5',
        borderRadius: 18,
        marginLeft: 8,
        paddingRight: 8,
    },
});

export default BroadcastTab;
