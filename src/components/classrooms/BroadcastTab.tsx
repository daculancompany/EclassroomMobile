//@ts-nocheck
import React, {useState, useEffect, useRef, useCallback, useMemo} from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    TextInput as RNTextInput,
    Animated,
    Dimensions,
    TouchableWithoutFeedback,
    Keyboard,
    InteractionManager,
    Linking,
    RefreshControl,
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
    TextInput,
    ActivityIndicator,
    Menu,
    Chip,
    List,
} from 'react-native-paper';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {useRoute} from '@react-navigation/native';
import {useQuery, useMutation, useQueryClient} from 'react-query';
import axiosConfig from '../../utils/axiosConfig';
import {DEFAULT_BANNER, HERO_IMAGE} from '../../utils/constant';
import Icon from 'react-native-vector-icons/MaterialIcons';
import EmojiPicker from 'rn-emoji-keyboard';
import {useGlobalStyles} from '../../styles/globalStyles';
import {useTabNavigation} from 'react-native-paper-tabs';
import {
    SimpleLoading,
    ChatLoading,
} from './../../components/AdvancedGradientShimmer';
dayjs.extend(relativeTime);

const formatFileSize = bytes => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = mimeType => {
    if (!mimeType) {
        return {icon: 'paperclip', color: '#1890ff'};
    }

    if (mimeType.includes('image/'))
        return {icon: 'file-image', color: '#52c41a'};
    if (mimeType.includes('pdf'))
        return {icon: 'file-pdf-box', color: '#ff4d4f'};
    if (
        mimeType.includes('word') ||
        mimeType.includes('msword') ||
        mimeType.includes('document')
    )
        return {icon: 'file-word-box', color: '#2b579a'};
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet'))
        return {icon: 'file-excel-box', color: '#217346'};
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation'))
        return {icon: 'file-powerpoint-box', color: '#d24726'};
    if (mimeType.includes('text/'))
        return {icon: 'file-document-outline', color: '#595959'};
    if (mimeType.includes('zip') || mimeType.includes('compressed'))
        return {icon: 'folder-zip', color: '#faad14'};

    return {icon: 'paperclip', color: '#1890ff'};
};

const {height} = Dimensions.get('window');

const ActionButton = React.memo(
    ({icon, text, count, active, onPress, color, theme}) => {
        return (
            <TouchableOpacity  style={styles.actionButton} onPress={onPress}>
                <Icon
                    name={icon}
                    size={16}
                    color={
                        active
                            ? color || theme.colors.primary
                            : theme.colors.text
                    }
                />
                <Text
                    style={[
                        styles.actionText,
                        active && {color: color || theme.colors.primary},
                    ]}>
                    {text}
                </Text>
                {count > 0 && <Text style={styles.actionCount}>{count}</Text>}
            </TouchableOpacity>
        );
    },
);

const CommentSection = ({
    visible,
    onClose,
    announcementId,
    onCommentSubmit,
    onReplySubmit,
    onLike,
    userID,
    onDelete,
    theme,
}) => {
    const [commentText, setCommentText] = useState('');
    const [replyText, setReplyText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const slideAnim = useRef(new Animated.Value(height)).current;
    const inputRef = useRef();
    const [localComments, setLocalComments] = useState([]); // Local state for comments
    //https://chat.deepseek.com/a/chat/s/f3bea650-d21d-4e7a-9af7-2954f464b7da
    // Fetch fresh comments data when modal opens
    // const {
    //     data: announcement,
    //     isLoading,
    //     isError,
    //     refetch,
    //     isFetching,
    // } = useQuery(
    //     ['announcement-comments', announcementId],
    //     () =>
    //         axiosConfig.get(`comments/${announcementId}`).then(res => res.data),
    //     {
    //         enabled: visible, // Only fetch when modal is visible
    //         //staleTime: 1000 * 60, // 1 minute before data becomes stale
    //         refetchInterval: 10000, // Poll every 3 seconds
    //         refetchIntervalInBackground: true, // Continue polling when app is in background
    //         refetchOnWindowFocus: true, // Refetch when window regains focus
    //     },
    // );

    const {isLoading, isError, refetch} = useQuery(
        ['announcement-comments', announcementId],
        () =>
            axiosConfig.get(`comments/${announcementId}`).then(res => res.data),
        {
            enabled: visible,
            onSuccess: data => {
                // Update local state when initial fetch succeeds
                setLocalComments(data.comments || []);
            },
        },
    );

    // Add pull-to-refresh functionality
    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        refetch().finally(() => setRefreshing(false));
    }, [refetch]);

    useEffect(() => {
        if (visible) {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
            // Refresh data when modal opens
            refetch();
        } else {
            Animated.timing(slideAnim, {
                toValue: height,
                duration: 300,
                useNativeDriver: true,
            }).start();
            // Reset states when closing
            setCommentText('');
            setReplyText('');
            setReplyingTo(null);
        }
    }, [visible, refetch]);

    // const handleSubmit = () => {
    //     if (replyingTo) {
    //         onReplySubmit(replyingTo.id, replyText);
    //         setReplyingTo(null);
    //         setReplyText('');
    //     } else {
    //         onCommentSubmit(announcementId, commentText);
    //         setCommentText('');
    //     }
    // };

    const handleSubmit = () => {
        if (replyingTo) {
            // Optimistic reply update
            const newReply = {
                id: Date.now(), // Temporary ID
                content: replyText,
                user: {id: userID, name: 'You'}, // Mock user data
                created_at: new Date().toISOString(),
                is_liked: false,
                likes_count: 0,
                replies: [],
            };

            setLocalComments(prevComments =>
                prevComments.map(comment => {
                    if (comment.id === replyingTo.id) {
                        return {
                            ...comment,
                            replies: [...(comment.replies || []), newReply],
                        };
                    }
                    return comment;
                }),
            );

            setReplyingTo(null);
            setReplyText('');

            // Call the API
            onReplySubmit(replyingTo.id, replyText);
        } else {
            // Optimistic comment update
            const newComment = {
                id: Date.now(), // Temporary ID
                content: commentText,
                user: {id: userID, name: 'You'}, // Mock user data
                created_at: new Date().toISOString(),
                is_liked: false,
                likes_count: 0,
                replies: [],
            };

            setLocalComments(prev => [newComment, ...prev]);
            setCommentText('');

            // Call the API
            onCommentSubmit(announcementId, commentText);
        }
    };

    // Optimistic like function

    const handleLike = React.useCallback(
        commentId => {
            setLocalComments(prevComments =>
                prevComments.map(comment => {
                    if (comment.id === commentId) {
                        return {
                            ...comment,
                            likes_count: comment.is_liked
                                ? comment.likes_count - 1
                                : comment.likes_count + 1,
                            is_liked: !comment.is_liked,
                        };
                    }
                    return comment;
                }),
            );
            onLike('comment', commentId);
        },
        [onLike],
    );

    if (isLoading) {
        return (
            <Portal>
                <Modal visible={visible} onDismiss={onClose}>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" />
                    </View>
                </Modal>
            </Portal>
        );
    }

    if (isError) {
        return (
            <Portal>
                <Modal visible={visible} onDismiss={onClose}>
                    <View style={styles.errorContainer}>
                        <Text>Failed to load comments</Text>
                        <Button onPress={onRefresh}>Retry</Button>
                    </View>
                </Modal>
            </Portal>
        );
    }

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onClose}
                contentContainerStyle={styles.modalOverlay}>
                <Animated.View
                    style={[
                        styles.commentSheet,
                        {backgroundColor: theme.colors.background},
                        {transform: [{translateY: slideAnim}]},
                    ]}>
                    <View style={styles.commentHeader}>
                        <Text variant="titleMedium" style={styles.commentTitle}>
                            Comments ({localComments.length || 0})
                        </Text>
                        <IconButton icon="close" onPress={onClose} />
                    </View>

                    <FlatList
                        showsVerticalScrollIndicator={false}
                        data={localComments || []}
                        keyExtractor={item => item.id.toString()}
                        contentContainerStyle={styles.commentList}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        renderItem={({item}) => (
                            <CommentItem
                                item={item}
                                onLike={(type, commentId) =>
                                    handleLike(commentId)
                                }
                                onReply={setReplyingTo}
                                onDelete={onDelete}
                                userID={userID}
                                theme={theme}
                                inputRef={inputRef}
                            />
                        )}
                        ListEmptyComponent={
                            <View
                                style={[
                                    styles.emptyCommentsContainer,
                                    {padding: 24},
                                ]}>
                                <Icon
                                    name="insert-comment"
                                    size={64}
                                    style={{color: theme.colors.outline}}
                                />
                                <Text
                                    variant="titleMedium"
                                    style={[
                                        styles.emptyCommentsTitle,
                                        {marginTop: 16},
                                    ]}>
                                    No comments yet
                                </Text>
                                <Text
                                    variant="bodyMedium"
                                    style={[
                                        styles.emptyCommentsSubtitle,
                                        {color: theme.colors.outline},
                                    ]}>
                                    Be the first to share your thoughts
                                </Text>
                            </View>
                        }
                    />

                    {replyingTo && (
                        <View style={styles.replyingTo}>
                            <Text style={styles.replyingToText}>
                                Replying to {replyingTo.user?.name}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setReplyingTo(null)}>
                                <Icon name="close" size={16} />
                            </TouchableOpacity>
                        </View>
                    )}

                    <View
                        style={[
                            styles.commentInputContainer,
                            {
                                backgroundColor: theme.colors.surfaceVariant,
                                borderTopWidth: 1,
                                borderTopColor: theme.colors.outline,
                            },
                        ]}>
                        <TextInput
                            ref={inputRef}
                            mode="flat"
                            value={replyingTo ? replyText : commentText}
                            onChangeText={text =>
                                replyingTo
                                    ? setReplyText(text)
                                    : setCommentText(text)
                            }
                            placeholder={
                                replyingTo
                                    ? 'Write a reply...'
                                    : 'Write a comment...'
                            }
                            style={[styles.commentInput]}
                            underlineColor="transparent"
                            activeUnderlineColor="transparent"
                            multiline
                            cursorColor={theme.colors.primary}
                        />
                        <TouchableOpacity
                            style={styles.sendButton}
                            onPress={handleSubmit}
                            disabled={
                                replyingTo
                                    ? !replyText.trim()
                                    : !commentText.trim()
                            }>
                            <Icon
                                name="send"
                                size={24}
                                color={theme.colors.primary}
                            />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </Modal>
        </Portal>
    );
};

// Extracted CommentItem component for better readability and performance
const CommentItem = React.memo(
    ({item, onLike, onReply, onDelete, userID, theme, inputRef}) => {
        return (
            <View style={styles.commentItem}>
                <Avatar.Image size={36} source={{uri: item.user?.avatar}} />
                <View style={styles.commentContent}>
                    <View
                        style={[
                            styles.commentBubble,
                            {backgroundColor: theme.colors.surfaceVariant},
                        ]}>
                        <Text variant="bodyLarge" style={styles.commentAuthor}>
                            {item.user?.name}
                        </Text>
                        <Text style={styles.commentText}>{item.content}</Text>
                    </View>
                    <View style={styles.commentActions}>
                        <TouchableOpacity
                            onPress={() => onLike('comment', item.id)}>
                            <Text
                                style={[
                                    styles.actionText,
                                    item.is_liked && {
                                        color: theme.colors.primary,
                                    },
                                ]}>
                                Like
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                onReply(item);
                                inputRef.current?.focus();
                            }}>
                            <Text style={styles.actionText}>Reply</Text>
                        </TouchableOpacity>
                        <Text style={styles.commentTime}>
                            {dayjs(item.created_at).fromNow()}
                        </Text>
                        {item.user?.id === userID && (
                            <TouchableOpacity
                                onPress={() => onDelete('comment', item.id)}>
                                <Icon
                                    name="delete"
                                    size={16}
                                    color={theme.colors.error}
                                />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Replies */}
                    {item.replies?.map(reply => (
                        <ReplyItem
                            key={reply.id}
                            reply={reply}
                            onLike={onLike}
                            onDelete={onDelete}
                            userID={userID}
                            theme={theme}
                        />
                    ))}
                </View>
            </View>
        );
    },
);

// Extracted ReplyItem component
const ReplyItem = React.memo(({reply, onLike, onDelete, userID, theme}) => {
    return (
        <View style={styles.replyItem}>
            <Avatar.Image size={32} source={{uri: reply.user?.avatar}} />
            <View style={styles.replyContent}>
                <View
                    style={[
                        styles.replyBubble,
                        {backgroundColor: theme.colors.surfaceVariant},
                    ]}>
                    <Text style={styles.replyAuthor}>{reply.user?.name}</Text>
                    <Text style={styles.replyText}>{reply.content}</Text>
                </View>
                <View style={styles.replyActions}>
                    <TouchableOpacity onPress={() => onLike('reply', reply.id)}>
                        <Text
                            style={[
                                styles.actionText,
                                reply.is_liked && {color: theme.colors.primary},
                            ]}>
                            Like
                        </Text>
                    </TouchableOpacity>
                    <Text style={styles.replyTime}>
                        {dayjs(reply.created_at).fromNow()}
                    </Text>
                    {reply.user?.id === userID && (
                        <TouchableOpacity
                            onPress={() => onDelete('reply', reply.id)}>
                            <Icon
                                name="delete"
                                size={16}
                                color={theme.colors.error}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
});

const BroadcastPage = () => {
    const goTo = useTabNavigation();
    const globalStyle = useGlobalStyles();
    const theme = useTheme();
    const route = useRoute();
    const {class_id: id, id: classworkId, ntype} = route.params || {};
    const queryClient = useQueryClient();
    const [description, setDescription] = useState('');
    const [title, setTitle] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [visibleModal, setVisibleModal] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [showFab, setShowFab] = useState(true);
    const scrollY = useRef(new Animated.Value(0)).current;
    const prevScrollY = useRef(0);
    const scrollOffset = useRef(0);
    const flatListRef = useRef(null);
    const userID = 3;

    // Fetch classroom data
    const {data: classroom, isLoading: isClassroomLoading} = useQuery(
        ['classroom', id],
        () =>
            axiosConfig
                .get(`faculties/classroom-settings/${id}`)
                .then(res => res.data),
    );

    useEffect(() => {
        const task = InteractionManager.runAfterInteractions(() => {
            if (ntype === 'classwork') {
                goTo(1);
            }
        });

        return () => task.cancel();
    }, [id, classworkId, ntype]);

    // Fetch announcements with polling
    const {
        data: announcements = [],
        isLoading: isAnnouncementsLoading,
        isFetching: fechingAnnoucment,
        refetch: refetchAnnouncement,
    } = useQuery(
        ['announcements', id],
        () =>
            axiosConfig.get(`classrooms/${id}/announcements`).then(res => {
                return res.data;
            }),
        {
            refetchInterval: 30000, // Poll every 10 seconds
            refetchOnWindowFocus: true,
        },
    );

    const onRefreshAnnoucement = React.useCallback(() => {
        setRefreshing(true);
        refetchAnnouncement().finally(() => setRefreshing(false));
    }, [refetchAnnouncement]);

    // Create announcement mutation
    const createAnnouncement = useMutation(
        newAnnouncement => {
            const formData = new FormData();
            formData.append('title', newAnnouncement.title);
            formData.append('description', newAnnouncement.description);

            if (newAnnouncement.attachments) {
                newAnnouncement.attachments.forEach(file => {
                    formData.append('attachments[]', file);
                });
            }

            return axiosConfig.post(
                `classrooms/${id}/announcements`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
            );
        },
        {
            onSuccess: () => {
                setTitle('');
                setDescription('');
                setAttachments([]);
                setVisibleModal(false);
                queryClient.invalidateQueries(['announcements', id]);
            },
        },
    );

    // Like mutation
    const toggleLike = useMutation(
        ({likeableType, likeableId}) => {
            return axiosConfig.post('likes/toggle', {
                likeable_type: likeableType,
                likeable_id: likeableId,
            });
        },
        {
            onMutate: async ({likeableType, likeableId}) => {
                // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
                await queryClient.cancelQueries(['announcements', id]);
                await queryClient.cancelQueries([
                    'announcement',
                    selectedAnnouncement,
                ]);

                //updateAnnouncementsQuery();
                if (selectedAnnouncement) {
                    //queryClient.invalidateQueries(['announcement-comments']);
                    // updateSingleAnnouncementQuery();
                    // await queryClient.invalidateQueries(['announcement-comments']);
                }

                // Snapshot the previous value
                const previousAnnouncements = queryClient.getQueryData([
                    'announcements',
                    id,
                ]);

                // Optimistically update to the new value
                queryClient.setQueryData(['announcements', id], old => {
                    return old.map(announcement => {
                        // Update announcement likes
                        if (
                            announcement.id === likeableId &&
                            likeableType === 'announcement'
                        ) {
                            return {
                                ...announcement,
                                is_liked: !announcement.is_liked,
                                likes_count: announcement.is_liked
                                    ? announcement.likes_count - 1
                                    : announcement.likes_count + 1,
                            };
                        }

                        // Update comment likes
                        if (announcement.comments) {
                            const updatedComments = announcement.comments.map(
                                comment => {
                                    if (
                                        comment.id === likeableId &&
                                        likeableType === 'comment'
                                    ) {
                                        return {
                                            ...comment,
                                            is_liked: !comment.is_liked,
                                            likes_count: comment.is_liked
                                                ? comment.likes_count - 1
                                                : comment.likes_count + 1,
                                        };
                                    }

                                    // Update reply likes
                                    if (comment.replies) {
                                        const updatedReplies =
                                            comment.replies.map(reply => {
                                                if (
                                                    reply.id === likeableId &&
                                                    likeableType === 'reply'
                                                ) {
                                                    return {
                                                        ...reply,
                                                        is_liked:
                                                            !reply.is_liked,
                                                        likes_count:
                                                            reply.is_liked
                                                                ? reply.likes_count -
                                                                  1
                                                                : reply.likes_count +
                                                                  1,
                                                    };
                                                }
                                                return reply;
                                            });
                                        return {
                                            ...comment,
                                            replies: updatedReplies,
                                        };
                                    }

                                    return comment;
                                },
                            );
                            return {...announcement, comments: updatedComments};
                        }

                        return announcement;
                    });
                });

                // Return a context object with the snapshotted value
                return {previousAnnouncements};
            },
            // If the mutation fails, use the context returned from onMutate to roll back
            onError: (err, variables, context) => {
                queryClient.setQueryData(
                    ['announcements', id],
                    context.previousAnnouncements,
                );
            },
            // Always refetch after error or success:
            onSettled: () => {
                queryClient.invalidateQueries(['announcements', id]);
            },
        },
    );

    // Comment mutation
    const addComment = useMutation(
        ({announcementId, content}) => {
            return axiosConfig.post(
                `announcements/${announcementId}/comments`,
                {content},
            );
        },
        {
            onMutate: async ({announcementId, content}) => {
                await queryClient.cancelQueries(['announcements', id]);

                const previousAnnouncements = queryClient.getQueryData([
                    'announcements',
                    id,
                ]);

                queryClient.setQueryData(['announcements', id], old => {
                    return old.map(announcement => {
                        if (announcement.id === announcementId) {
                            const newComment = {
                                id: Date.now(), // Temporary ID
                                content,
                                user: {
                                    id: userID,
                                    name: 'You', // You can get this from your user context
                                    avatar: '', // Add user avatar if available
                                },
                                created_at: new Date().toISOString(),
                                is_liked: false,
                                likes_count: 0,
                                replies: [],
                            };

                            return {
                                ...announcement,
                                comments: [
                                    newComment,
                                    ...(announcement.comments || []),
                                ],
                                comments_count:
                                    (announcement.comments_count || 0) + 1,
                            };
                        }
                        return announcement;
                    });
                });

                return {previousAnnouncements};
            },
            onError: (err, variables, context) => {
                queryClient.setQueryData(
                    ['announcements', id],
                    context.previousAnnouncements,
                );
            },
            onSuccess: (_, {announcementId}) => {
                // Invalidate both queries
                queryClient.invalidateQueries(['announcements', id]);
                queryClient.invalidateQueries(['announcement', announcementId]);
            },
            onSettled: () => {
                Keyboard.dismiss();
                queryClient.invalidateQueries(['announcements', id]);
            },
        },
    );

    // Reply mutation
    const addReply = useMutation(
        ({commentId, content}) => {
            return axiosConfig.post(`comments/${commentId}/replies`, {content});
        },
        {
            onMutate: async ({commentId, content}) => {
                await queryClient.cancelQueries(['announcements', id]);

                const previousAnnouncements = queryClient.getQueryData([
                    'announcements',
                    id,
                ]);

                queryClient.setQueryData(['announcements', id], old => {
                    return old.map(announcement => {
                        if (announcement.comments) {
                            const updatedComments = announcement.comments.map(
                                comment => {
                                    if (comment.id === commentId) {
                                        const newReply = {
                                            id: Date.now(), // Temporary ID
                                            content,
                                            user: {
                                                id: userID,
                                                name: 'You',
                                                avatar: '',
                                            },
                                            created_at:
                                                new Date().toISOString(),
                                            is_liked: false,
                                            likes_count: 0,
                                        };

                                        return {
                                            ...comment,
                                            replies: [
                                                newReply,
                                                ...(comment.replies || []),
                                            ],
                                        };
                                    }
                                    return comment;
                                },
                            );
                            return {...announcement, comments: updatedComments};
                        }
                        return announcement;
                    });
                });

                return {previousAnnouncements};
            },
            onError: (err, variables, context) => {
                queryClient.setQueryData(
                    ['announcements', id],
                    context.previousAnnouncements,
                );
            },
            onSettled: () => {
                Keyboard.dismiss();
                queryClient.invalidateQueries(['announcements', id]);
            },
        },
    );

    // Delete mutations
    const deleteAnnouncement = useMutation(
        announcementId => axiosConfig.delete(`announcements/${announcementId}`),
        {
            onMutate: async announcementId => {
                await queryClient.cancelQueries(['announcements', id]);

                const previousAnnouncements = queryClient.getQueryData([
                    'announcements',
                    id,
                ]);

                queryClient.setQueryData(['announcements', id], old =>
                    old.filter(
                        announcement => announcement.id !== announcementId,
                    ),
                );

                return {previousAnnouncements};
            },
            onError: (err, variables, context) => {
                queryClient.setQueryData(
                    ['announcements', id],
                    context.previousAnnouncements,
                );
            },
            onSettled: () => {
                queryClient.invalidateQueries(['announcements', id]);
            },
        },
    );

    const deleteComment = useMutation(
        commentId => axiosConfig.delete(`comments/${commentId}`),
        {onSuccess: () => queryClient.invalidateQueries(['announcements', id])},
    );

    const deleteReply = useMutation(
        replyId => axiosConfig.delete(`replies/${replyId}`),
        {onSuccess: () => queryClient.invalidateQueries(['announcements', id])},
    );

    // Helper functions
    const handleLike = (type, id) => {
        toggleLike.mutate({likeableType: type, likeableId: id});
    };

    const handleCommentSubmit = (announcementId, content) => {
        addComment.mutate({announcementId, content});
    };

    const handleReplySubmit = (commentId, content) => {
        addReply.mutate({commentId, content});
    };

    const handleDelete = (type, id) => {
        if (type === 'announcement') deleteAnnouncement.mutate(id);
        else if (type === 'comment') deleteComment.mutate(id);
        else if (type === 'reply') deleteReply.mutate(id);
    };

    // Memoize the open/close comment handlers
    const openComments = React.useCallback(announcement => {
        setSelectedAnnouncement(announcement.id);
    }, []);

    const closeComments = React.useCallback(() => {
        setSelectedAnnouncement(null);
    }, []);

    const renderLikeButton = (item, type = 'announcement') => {
        const isLiked = item.is_liked;
        const likeCount = item.likes_count || 0;

        return (
            <ActionButton
                icon={'thumb-up'}
                text={isLiked ? 'Liked' : 'Like'}
                count={likeCount}
                active={isLiked}
                onPress={() => handleLike(type, item.id)}
                color={isLiked ? theme.colors.primary : undefined}
                theme={theme}
                
            />
        );
    };

    const renderMoreMenu = (item, type) => (
        <Menu
            visible={visible}
            onDismiss={() => setVisible(false)}
            anchor={
                <IconButton
                    icon="dots-vertical"
                    onPress={() => setVisible(true)}
                />
            }>
            <Menu.Item
                leadingIcon="delete"
                onPress={() => {
                    setVisible(false);
                    showDeleteConfirm(
                        type,
                        item.id,
                        type === 'announcement' ? item.title : item.content,
                    );
                }}
                title="Delete"
            />
        </Menu>
    );

    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [activeInput, setActiveInput] = useState(null);
    const descriptionRef = useRef(null);

    // Toggle emoji picker visibility
    const toggleEmojiPicker = useCallback(inputField => {
        setShowEmojiPicker(prev => {
            // If inputField is provided, set active input and open picker
            if (inputField) {
                setActiveInput(inputField);
                return true;
            }
            // Otherwise just toggle
            return !prev;
        });
    }, []);

    // Handle emoji selection
    const handleEmojiPick = useCallback(
        emojiData => {
            if (activeInput === 'title') {
                setTitle(prev => prev + emojiData.emoji);
            } else if (activeInput === 'description') {
                setDescription(prev => prev + emojiData.emoji);
            }
        },
        [activeInput],
    );

    // Close picker when keyboard appears
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => setShowEmojiPicker(false),
        );

        return () => keyboardDidShowListener.remove();
    }, []);

    const closeEmoji = () => {
        setShowEmojiPicker(false);
    };

    // Memoize the comment section props
    const commentSectionProps = React.useMemo(
        () => ({
            visible: !!selectedAnnouncement,
            onClose: closeComments,
            announcementId: selectedAnnouncement,
            onCommentSubmit: handleCommentSubmit,
            onReplySubmit: handleReplySubmit,
            onLike: handleLike,
            userID,
            onDelete: handleDelete,
            theme,
        }),
        [selectedAnnouncement, theme, userID],
    );

    // Corrected scroll handler
    const handleScroll = ({nativeEvent}) => {
        const currentScrollY = nativeEvent.contentOffset.y;
        // Detect scroll direction
        const scrollingDown = currentScrollY > prevScrollY.current;
        const atTop = currentScrollY <= 0;

        // Update visibility
        setShowFab(!scrollingDown || atTop);
        prevScrollY.current = currentScrollY;
        scrollOffset.current = currentScrollY;

        // Update animated value
        scrollY.setValue(currentScrollY);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[
                styles.container,
                {backgroundColor: theme.colors.background},
            ]}>
            {isAnnouncementsLoading && <ChatLoading />}
            <Animated.View
                style={[
                    styles.fabContainer,
                    {
                        opacity: showFab ? 1 : 0,
                        transform: [
                            {
                                translateY: scrollY.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 100],
                                    extrapolate: 'clamp',
                                }),
                            },
                        ],
                    },
                ]}>
                {!visibleModal && (
                    <FAB
                        icon="plus"
                        label="Create Announcement"
                        onPress={() => setVisibleModal(true)}
                        style={styles.fab}
                        visible={showFab}
                    />
                )}
            </Animated.View>

            <FlatList
                showsVerticalScrollIndicator={false}
                loading={true}
                ref={flatListRef}
                // refreshing={refreshing}
                // onRefresh={onRefreshAnnoucement}
                data={announcements}
                keyExtractor={item => item.id.toString()}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={10}
                removeClippedSubviews={true}
                renderItem={({item}) => (
                    <Card style={styles.announcementCard}>
                        <Card.Content>
                            <View style={styles.announcementHeader}>
                                <Avatar.Image
                                    size={48}
                                    source={{uri: item.user?.avatar}}
                                />
                                <View style={styles.announcementMeta}>
                                    <Text variant="bodyLarge">
                                        {item.user?.name}
                                    </Text>
                                    <Text
                                        variant="bodySmall"
                                        style={styles.timeText}>
                                        {dayjs(item.created_at).fromNow()}
                                    </Text>
                                </View>
                                {item.user?.id === userID && (
                                    <IconButton
                                        icon="dots-vertical"
                                        onPress={() =>
                                            showDeleteConfirm(
                                                'announcement',
                                                item.id,
                                                item.title,
                                            )
                                        }
                                    />
                                )}
                            </View>

                            <Text
                                variant="titleMedium"
                                style={styles.announcementTitle}>
                                {item.title}
                            </Text>

                            <Text variant="bodyMedium">{item.description}</Text>
                            {Array.isArray(item?.attachments) &&
                                item?.attachments.map(attach => {
                                    const {icon, color} = getFileIcon(
                                        attach.mime_type,
                                    );

                                    return (
                                        <List.Item
                                            key={attach.id}
                                            title={attach.name}
                                            description={formatFileSize(
                                                attach.size,
                                            )}
                                            onPress={() =>
                                                Linking.openURL(attach.url)
                                            }
                                            left={() => (
                                                <Avatar.Icon
                                                    icon={icon}
                                                    size={40}
                                                    style={{
                                                        backgroundColor:
                                                            'transparent',
                                                    }}
                                                    color={color}
                                                />
                                            )}
                                        />
                                    );
                                })}
                            <View
                                style={[
                                    styles.announcementStats,
                                    {borderColor: theme.colors.outline},
                                ]}>
                                {renderLikeButton(item)}
                                <ActionButton
                                    icon="comment"
                                    text="Comment"
                                    count={
                                        item.comments_count ||
                                        item.comments?.length ||
                                        0
                                    }
                                    active={false}
                                    onPress={() => openComments(item)}
                                    theme={theme}
                                />
                            </View>
                        </Card.Content>
                    </Card>
                )}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                ListEmptyComponent={() =>
                    !isAnnouncementsLoading ? (
                        <View style={globalStyle.emptyContainer}>
                            <Avatar.Icon
                                size={64}
                                icon="bell-outline"
                                style={globalStyle.emptyIcon}
                            />
                            <Text style={globalStyle.emptyTitle}>
                                No Announcements Yet
                            </Text>
                            <Text style={globalStyle.emptySubtitle}>
                                Stay tuned! New announcements will appear here.
                            </Text>
                        </View>
                    ) : null
                }
                refreshControl={
                    <RefreshControl
                        refreshing={fechingAnnoucment}
                        onRefresh={() => refetchAnnouncement()}
                    />
                }
            />

            {/* Comment Section Modal */}
            {selectedAnnouncement && (
                <CommentSection {...commentSectionProps} />
            )}

            {/* Create Announcement Modal */}
            <Portal>
                <Modal
                    visible={visibleModal}
                    onDismiss={() => setVisibleModal(false)}
                    contentContainerStyle={[
                        styles.modalContainer,
                        {backgroundColor: theme.colors.background},
                    ]}>
                    <Card>
                        <Card.Title title="Create Announcement" />
                        <Card.Content>
                            <TextInput
                                label="Title"
                                value={title}
                                onChangeText={setTitle}
                                mode="outlined"
                                style={styles.inputField}
                                onFocus={() => {
                                    setActiveInput('title');
                                    setShowEmojiPicker(false);
                                }}
                            />
                            <TextInput
                                ref={descriptionRef}
                                label="Description"
                                value={description}
                                onChangeText={setDescription}
                                mode="outlined"
                                multiline
                                numberOfLines={4}
                                style={[styles.input, styles.descriptionInput]}
                                onFocus={() => {
                                    setActiveInput('description');
                                    setShowEmojiPicker(false);
                                }}
                                right={
                                    <TextInput.Icon
                                        icon="emoticon-happy-outline"
                                        onPress={() =>
                                            toggleEmojiPicker('description')
                                        }
                                    />
                                }
                                onFocus={() => {
                                    setActiveInput('description');
                                    setShowEmojiPicker(false);
                                }}
                            />

                            <EmojiPicker
                                open={showEmojiPicker}
                                onClose={() => setShowEmojiPicker(false)}
                                onEmojiSelected={handleEmojiPick}
                                theme={{
                                    backdrop: '#16161888',
                                    knob: '#766dfc',
                                    container: '#282829',
                                    header: '#fff',
                                    skinTonesContainer: '#252427',
                                    category: {
                                        icon: '#766dfc',
                                        iconActive: '#fff',
                                        container: '#252427',
                                        containerActive: '#766dfc',
                                    },
                                }}
                                categoryOrder={[
                                    'recent',
                                    'smileys',
                                    'people',
                                    'animals',
                                    'foods',
                                ]}
                            />

                            <Button
                                mode="contained"
                                onPress={() => {
                                    if (!title.trim() || !description.trim())
                                        return;
                                    createAnnouncement.mutate({
                                        title,
                                        description,
                                        attachments,
                                    });
                                }}
                                loading={createAnnouncement.isLoading}
                                style={styles.submitButton}>
                                Post Announcement
                            </Button>
                        </Card.Content>
                    </Card>
                </Modal>
            </Portal>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        borderRadius: 10,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
    },
    emptyComments: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    createButton: {
        marginBottom: 16,
    },
    announcementCard: {
        marginBottom: 16,
    },
    announcementHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    announcementMeta: {
        flex: 1,
    },
    timeText: {
        color: '#666',
    },
    announcementTitle: {
        marginBottom: 8,
    },
    announcementStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 12,
        paddingTop: 8,
        borderTopWidth: 1,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    actionText: {
        marginLeft: 4,
        marginRight: 8,
        fontSize: 14,
    },
    actionCount: {
        color: '#666',
        fontSize: 12,
    },
    modalContainer: {
        padding: 20,
    },
    inputField: {
        marginBottom: 16,
    },
    descriptionInput: {
        minHeight: 120,
        marginBottom: 16,
    },
    submitButton: {
        marginTop: 8,
    },
    // Comment Section Styles
    modalOverlay: {
        flex: 1,
        // backgroundColor: 'rgba(0,0,0,0.5)',
    },
    commentSheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: '10%',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
        paddingBottom: 0,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    commentTitle: {
        fontWeight: 'bold',
    },
    commentList: {
        paddingBottom: 80,
    },
    commentItem: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    commentContent: {
        flex: 1,
        marginLeft: 8,
    },
    commentBubble: {
        borderRadius: 18,
        padding: 12,
        marginBottom: 4,
    },
    commentAuthor: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    commentText: {
        fontSize: 15,
    },
    commentActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
        gap: 16,
    },
    commentTime: {
        fontSize: 12,
        color: '#666',
    },
    replyItem: {
        flexDirection: 'row',
        marginTop: 8,
        marginLeft: 28,
    },
    replyContent: {
        flex: 1,
        marginLeft: 8,
    },
    replyBubble: {
        borderRadius: 18,
        padding: 10,
        marginBottom: 4,
    },
    replyAuthor: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 2,
    },
    replyText: {
        fontSize: 14,
    },
    replyActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
        gap: 12,
    },
    replyTime: {
        fontSize: 11,
        color: '#666',
    },
    replyingTo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f0f0f0',
        padding: 8,
        borderRadius: 8,
        marginBottom: 8,
    },
    replyingToText: {
        fontSize: 13,
        color: '#666',
    },
    commentInputContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        // borderRadius: 20,
        // marginHorizontal: 20,
    },
    commentInput: {
        flex: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        maxHeight: 80,
    },
    sendButton: {
        marginLeft: 8,
    },

    emptyCommentsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyCommentsTitle: {
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyCommentsSubtitle: {
        textAlign: 'center',
        maxWidth: 300,
    },
    fabContainer: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        zIndex: 999,
    },
    fab: {
        borderRadius: 8,
    },
});

export default BroadcastPage;
