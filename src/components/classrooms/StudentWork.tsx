//@ts-nocheck
import React, {useState, useEffect} from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Linking,
    Platform,
    KeyboardAvoidingView,
    SafeAreaView,
    Keyboard,
    Alert,
    StatusBar,
} from 'react-native';
import {
    Avatar,
    Button,
    Card,
    Checkbox,
    Divider,
    IconButton,
    List,
    Portal,
    Modal,
    TextInput as PaperTextInput,
    Chip,
    useTheme,
    Menu,
    Text,
    MD3Colors,
    Appbar,
} from 'react-native-paper';
import useClassroomStore from '../../states/classroomState';
import {useRoute} from '@react-navigation/native';
import useClassworkSubmission from '../../hooks/useClassworkSubmission';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import CamerCapture from '../CamerCapture';
import HeaderWithStatus from '../HeaderWithStatus';
import useGlobalStore from '../../states/globalState';
import {DIR_LOCATION} from '../../utils/constant';
import PrivateMessage from './PrivateMessage';
import {
    TabsProvider,
    Tabs,
    TabScreen,
    useTabIndex,
    useTabNavigation,
} from 'react-native-paper-tabs';
import {AssignmentItem, FileViewerModal} from '../../components/';
import BottomSheet from '../BottomSheet';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation} from '@react-navigation/native';
import LinkForm from './LinkForm';
import {useSnackbar} from '../../hooks/SnackbarProvider';
import {IconTextIcon} from '../../components/AdvancedGradientShimmer';

const StudentWork = ({route}) => {
    const {classworkId} = route.params;
    const {showSnackbar} = useSnackbar();
    const navigation = useNavigation();
    const theme = useTheme();
    const {fileViewer, setField: setFieldGlobal} = useGlobalStore();
    const {
        classworkDetails,
        setField,
        storeStudentWorkLink,
        classwork_id,
        storeStudentSubmission,
        classwork,
    } = useClassroomStore();
    const [comments, setComments] = useState([
        {
            id: '1',
            author: 'Teacher Smith',
            avatar: 'https://i.pravatar.cc/150?img=3',
            content: 'Remember to cite your sources in APA format',
            datetime: '2 days ago',
            isPrivate: false,
        },
        {
            id: '2',
            author: 'You',
            avatar: null,
            content: 'I have a question about the grading rubric',
            datetime: '1 day ago',
            isPrivate: true,
        },
    ]);

    const [newComment, setNewComment] = useState('');
    const [privateComment, setPrivateComment] = useState('');
    const [fileList, setFileList] = useState([]);
    const [markedAsDone, setMarkedAsDone] = useState(false);
    const [links, setLinks] = useState([]);
    const [currentLink, setCurrentLink] = useState('');
    const [submitLink, setSubmitLink] = useState(false);
    const [visible, setVisible] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);

    const {
        isLoading,
        data: classworks,
        refetch,
        isFetching,
    } = useClassworkSubmission(classworkId);

    const handleAddLink = async () => {
        setSubmitLink(true);
        const response = await storeStudentWorkLink({
            type: 'link',
            classwork_id: classwork_id,
            link: currentLink.trim(),
        });

        if (response?.status === 200) {
            Keyboard.dismiss();
            setField('studentSubmission', true);
            setVisible(false);
            setCurrentLink('');
            refetch();
            showSnackbar('Link added successfully!', 'success');
        } else {
            showSnackbar('Something went wrong.', 'error');
        }

        setSubmitLink(false);
    };

    const handleRemoveLink = id => {
        setLinks(links.filter(link => link.id !== id));
    };

    const handlePublicComment = () => {
        if (!newComment.trim()) {
            alert('Please enter a comment!');
            return;
        }

        setComments([
            ...comments,
            {
                id: Date.now().toString(),
                author: 'You',
                avatar: null,
                content: newComment,
                datetime: 'Just now',
                isPrivate: false,
            },
        ]);
        setNewComment('');
    };

    const handlePrivateComment = () => {
        if (!privateComment.trim()) {
            alert('Please enter a private comment!');
            return;
        }

        setComments([
            ...comments,
            {
                id: Date.now().toString(),
                author: 'You',
                avatar: null,
                content: privateComment,
                datetime: 'Just now',
                isPrivate: true,
            },
        ]);
        setPrivateComment('');
        alert('Private comment sent to instructor');
    };

    const handleMarkAsDone = () => {
        setMarkedAsDone(!markedAsDone);
        alert(!markedAsDone ? 'Work marked as done' : 'Work unmarked');
    };

    const handleClose = () => {
        setField('studentSubmission', false);
    };

    // Dark theme styles
    const dynamicStyles = StyleSheet.create({
        modalContainer: {
            backgroundColor: theme.colors.surface,
            padding: 0,
            margin: 0,
            height: '100%',
            width: '100%',
            position: 'absolute',
            bottom: 0,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
        },
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.colors.text,
            marginLeft: 10,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 16,
            color: theme.colors.text,
        },
        dividerText: {
            textAlign: 'center',
            marginVertical: 8,
            color: theme.colors.text,
        },
        commentAuthor: {
            fontWeight: 'bold',
            color: theme.colors.text,
        },
        commentTime: {
            fontSize: 12,
            color: theme.colors.text,
            opacity: 0.6,
        },
        commentContent: {
            marginLeft: 48,
            color: theme.colors.text,
        },
        linkItem: {
            paddingVertical: 8,
            backgroundColor: theme.colors.surfaceVariant,
        },
        card: {
            marginBottom: 16,
            backgroundColor: theme.colors.surfaceVariant,
        },
    });

    const handleImageUpload = async () => {
        try {
            // First let user choose between camera or gallery
            Alert.alert(
                'Upload File',
                'Choose source',
                [
                    {
                        text: 'Gallery',
                        onPress: () => pickImageFromGallery(),
                    },
                    {
                        text: 'Camera',
                        onPress: () => captureImageFromCamera(),
                    },
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                ],
                {cancelable: true},
            );
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const pickImageFromGallery = async () => {
        const options = {
            mediaType: 'mixed',
            quality: 0.8,
            maxWidth: 800,
            maxHeight: 800,
            includeBase64: false, // set to true if you want base64 encoded image
            allowMultiple: true,
        };

        const result = await launchImageLibrary(options);

        if (result.didCancel) {
            console.log('User cancelled image picker');
        } else if (result.error) {
            console.log('ImagePicker Error: ', result.error);
        } else if (result.assets && result.assets[0].uri) {
            const imageUri = result.assets[0].uri;
            await uploadImage(imageUri);
        }
    };

    const captureImageFromCamera = async () => {
        console.log('Launching camera...');
        try {
            const options = {
                mediaType: 'photo',
                quality: 0.8,
                includeBase64: false,
                saveToPhotos: true,
            };

            const result = await launchCamera(options);

            // This executes after camera is closed
            console.log('Camera was closed');

            if (result.didCancel) {
                console.log('User cancelled camera');
                Alert.alert(
                    'Cancelled',
                    'You closed the camera without taking a photo',
                );
            } else if (result.error) {
                console.log('Camera Error: ', result.error);
                Alert.alert('Error', 'Failed to capture image');
            } else if (result.assets && result.assets[0].uri) {
                console.log('Image captured:', result.assets[0].uri);
                await uploadImage(result.assets[0].uri);
            }
        } catch (error) {
            console.log('Camera launch error:', error);
        }
    };

    const uploadImage = async uri => {
        try {
            // Extract filename from URI or generate one
            const fileName = uri.split('/').pop() || `image_${Date.now()}.jpg`;

            // Determine file type based on extension
            const extension = uri.split('.').pop()?.toLowerCase();
            const fileType = extension
                ? `image/${
                      extension === 'png'
                          ? 'png'
                          : extension === 'gif'
                          ? 'gif'
                          : 'jpeg'
                  }`
                : 'image/jpeg';

            const response = await storeStudentSubmission({
                classwork_id: classwork_id,
                type: 'image',
                file: {
                    uri: uri,
                    name: fileName,
                    type: fileType,
                },
            });

            if (response?.error) {
                Alert.alert('Upload Failed', response.message);
                return false;
            }

            Alert.alert('Success', 'Image uploaded successfully');
            refetch(); // Refresh your data
            return true;
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Error', 'Failed to upload image');
            return false;
        }
    };

    const getFileIcon = ext => {
        switch (ext) {
            case 'pdf':
                return 'file-pdf-box';
            case 'jpg':
            case 'jpeg':
            case 'png':
                return 'image';
            case 'doc':
            case 'docx':
                return 'file-word';
            default:
                return 'link';
        }
    };

    const getFileColor = ext => {
        // const ext = url.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'pdf':
                return '#F40F02'; // Red for PDF
            case 'jpg':
            case 'jpeg':
            case 'png':
                return '#02A0F7'; // Blue for images
            default:
                return '#939393'; // Gray for others
        }
    };

    return (
        <>
            <FileViewerModal />
            <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}>
                <Appbar.Header
                    style={{backgroundColor: 'transparent', elevation: 0}}>
                    <Appbar.BackAction onPress={() => navigation.goBack()} />
                    <Appbar.Content title={classwork?.title || ''} />
                </Appbar.Header>
            </LinearGradient>
            <TabsProvider defaultIndex={0}>
                <Tabs mode="scrollable">
                    <TabScreen label="Instruction ">
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            style={styles.scrollView}>
                            <AssignmentItem assignment={classwork} />
                        </ScrollView>
                    </TabScreen>
                    <TabScreen label="Submission ">
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            style={styles.scrollView}>
                            <Card style={[dynamicStyles.card, {margin: 15}]}>
                                <Card.Title
                                    title="Assignment Submission"
                                    titleStyle={{
                                        color: theme.colors.text,
                                    }}
                                />
                                <Card.Content style={styles.btnCreate}>
                                    <View style={{width: '98%'}}>
                                        {isLoading && (
                                            <IconTextIcon count={4} />
                                        )}
                                        {!isLoading &&
                                        Array.isArray(classworks) ? (
                                            classworks.length > 0 ? (
                                                <List.Section
                                                    title="Classwork Links"
                                                    titleStyle={{
                                                        fontWeight: 'bold',
                                                    }}>
                                                    {isFetching && (
                                                        <IconTextIcon
                                                            count={1}
                                                        />
                                                    )}
                                                    {classworks.map(link => (
                                                        <List.Item
                                                            key={link.id}
                                                            title={
                                                                link.file_link
                                                            }
                                                            description={(
                                                                link?.type || ''
                                                            ).toUpperCase()}
                                                            titleNumberOfLines={
                                                                1
                                                            }
                                                            descriptionNumberOfLines={
                                                                1
                                                            }
                                                            left={props => (
                                                                <List.Icon
                                                                    {...props}
                                                                    icon={getFileIcon(
                                                                        link.ext,
                                                                    )}
                                                                    color={getFileColor(
                                                                        link.ext,
                                                                    )}
                                                                />
                                                            )}
                                                            right={() => (
                                                                <IconButton
                                                                    icon="close"
                                                                    size={20}
                                                                    iconColor={
                                                                        MD3Colors.error50
                                                                    }
                                                                    onPress={() =>
                                                                        handleRemoveLink(
                                                                            link.id,
                                                                        )
                                                                    }
                                                                    style={{
                                                                        marginRight: 8,
                                                                    }}
                                                                />
                                                            )}
                                                            onPress={() => {
                                                                setField(
                                                                    'studentSubmission',
                                                                    false,
                                                                );
                                                                setFieldGlobal(
                                                                    'fileViewer',
                                                                    {
                                                                        visible:
                                                                            true,
                                                                        url:
                                                                            link.type ===
                                                                            'link'
                                                                                ? link.file_link
                                                                                : `${DIR_LOCATION.submission}${link.file_link}`,
                                                                    },
                                                                );
                                                            }}
                                                            style={{
                                                                paddingVertical: 8,
                                                            }}
                                                        />
                                                    ))}
                                                </List.Section>
                                            ) : (
                                                <Text
                                                    style={{
                                                        textAlign: 'center',
                                                        margin: 16,
                                                        color: theme.colors
                                                            .onSurfaceDisabled,
                                                    }}>
                                                    No submitted work available
                                                </Text>
                                            )
                                        ) : null}
                                    </View>
                                    <Menu
                                        visible={menuVisible}
                                        onDismiss={() => setMenuVisible(false)}
                                        anchor={
                                            <Button
                                                icon="plus"
                                                mode="outlined"
                                                onPress={() =>
                                                    setMenuVisible(true)
                                                }
                                                style={styles.uploadButton}>
                                                Add or Create
                                            </Button>
                                        }>
                                        <Menu.Item
                                            onPress={() => {
                                                setMenuVisible(false);
                                                handleImageUpload();
                                            }}
                                            title="File(jpg,png,pdf)"
                                            leadingIcon="file-upload"
                                        />
                                        <Menu.Item
                                            onPress={() => {
                                                setMenuVisible(false);
                                                setVisible(true);
                                            }}
                                            title="Link"
                                            leadingIcon="link"
                                        />
                                    </Menu>
                                </Card.Content>
                            </Card>
                        </ScrollView>
                    </TabScreen>
                    <TabScreen label="Private Message">
                        <PrivateMessage classworkId={classwork_id} />
                    </TabScreen>
                    <TabScreen label="Class Comments">
                        <View style={styles.rightColumn}>
                            <List.Section>
                                {comments
                                    .filter(c => !c.isPrivate)
                                    .map(item => (
                                        <Card
                                            key={item.id}
                                            style={dynamicStyles.card}>
                                            <Card.Content>
                                                <View
                                                    style={
                                                        styles.commentHeader
                                                    }>
                                                    {item.avatar ? (
                                                        <Avatar.Image
                                                            source={{
                                                                uri: item.avatar,
                                                            }}
                                                            size={40}
                                                        />
                                                    ) : (
                                                        <Avatar.Icon
                                                            icon="account"
                                                            size={40}
                                                            color={
                                                                theme.colors
                                                                    .text
                                                            }
                                                        />
                                                    )}
                                                    <View
                                                        style={
                                                            styles.commentMeta
                                                        }>
                                                        <Text
                                                            style={
                                                                dynamicStyles.commentAuthor
                                                            }>
                                                            {item.author}
                                                        </Text>
                                                        <Text
                                                            style={
                                                                dynamicStyles.commentTime
                                                            }>
                                                            {item.datetime}
                                                        </Text>
                                                    </View>
                                                    {item.isPrivate && (
                                                        <Chip
                                                            icon="lock"
                                                            style={
                                                                styles.privateChip
                                                            }
                                                            textStyle={{
                                                                color: theme
                                                                    .colors
                                                                    .text,
                                                            }}>
                                                            Private
                                                        </Chip>
                                                    )}
                                                </View>
                                                <Text
                                                    style={
                                                        dynamicStyles.commentContent
                                                    }>
                                                    {item.content}
                                                </Text>
                                            </Card.Content>
                                        </Card>
                                    ))}
                            </List.Section>

                            <Divider style={styles.divider} />

                            <PaperTextInput
                                multiline
                                numberOfLines={3}
                                value={newComment}
                                onChangeText={setNewComment}
                                placeholder="Add a class comment..."
                                style={styles.commentInput}
                                theme={{
                                    colors: {
                                        text: theme.colors.text,
                                        placeholder: theme.colors.text,
                                        primary: theme.colors.primary,
                                        background: 'transparent',
                                    },
                                }}
                            />
                            <Button
                                icon="comment"
                                mode="contained"
                                onPress={handlePublicComment}
                                style={styles.commentButton}>
                                Post to Class
                            </Button>
                        </View>
                    </TabScreen>
                </Tabs>
            </TabsProvider>

            <LinkForm
                visible={visible}
                onDismiss={() => setVisible(false)}
                currentLink={currentLink}
                setCurrentLink={setCurrentLink}
                handleAddLink={handleAddLink}
                submitLink={submitLink}
                theme={theme}
            />
        </>
    );
};

// Static styles that don't need theme colors
const styles = StyleSheet.create({
    closeButton: {
        margin: 0,
    },
    keyboardAvoidingView: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        flex: 1,
    },
    leftColumn: {
        flex: 1,
        padding: 16,
        borderRightWidth: 1,
    },
    rightColumn: {
        flex: 1,
        padding: 16,
    },
    uploadButton: {
        marginBottom: 8,
        alignSelf: 'flex-start',
    },
    divider: {
        marginVertical: 16,
    },
    linkInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    linkInput: {
        flex: 1,
        marginRight: 8,
    },
    addLinkButton: {
        height: 56,
        justifyContent: 'center',
    },
    linkIcon: {
        marginRight: 8,
    },
    commentInput: {
        marginBottom: 8,
        backgroundColor: 'transparent',
    },
    commentButton: {
        marginBottom: 16,
    },
    commentItem: {
        paddingVertical: 8,
    },
    footerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 16,
        borderTopWidth: 1,
    },
    turnInButton: {
        marginRight: 8,
    },
    draftButton: {
        marginRight: 8,
    },
    cancelButton: {
        marginRight: 8,
    },
    commentCard: {
        marginBottom: 8,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    commentMeta: {
        marginLeft: 8,
        flex: 1,
    },
    privateChip: {
        alignSelf: 'flex-start',
        marginLeft: 8,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    footerButton: {
        marginLeft: 8,
        borderRadius: 4,
    },
    footerButtonText: {
        textTransform: 'uppercase',
        fontWeight: '500',
        letterSpacing: 0.25,
    },
    closeHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnCreate: {
        textAlign: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 8,
    },
    linkInputContainer: {
        flexDirection: 'column',
        gap: 12,
    },
    linkInput: {
        marginBottom: 10,
    },
    addLinkButton: {
        alignSelf: 'flex-end',
    },
    statusContainer: {
        marginTop: 8,
        alignItems: 'flex-start',
    },
    statusChip: {
        backgroundColor: '#E0F7FA',
    },
    statusText: {
        color: '#00796B',
        fontWeight: '600',
    },
});

export default StudentWork;
