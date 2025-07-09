import * as React from 'react';
import {
    View,
    StyleSheet,
    Alert,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    Dimensions,
    Image,
} from 'react-native';
import {
    Avatar,
    Title,
    Paragraph,
    Button,
    Card,
    useTheme,
    ActivityIndicator,
    Text,
    Divider,
    IconButton,
    Badge,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import useProfile from '../hooks/useProfile';
import {SettingsForm} from '../components';
import {PROFILE} from '../utils/constant';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import logo from '../assets/images/site-logo.png';

const {width} = Dimensions.get('window');

const ProfileScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = React.useState(false);
    const [visible, setVisible] = React.useState(false);
    const [imageRefreshKey, setImageRefreshKey] = React.useState(0);
    const [editableProfile, setEditableProfile] = React.useState({
        fname: '',
        lname: '',
        email: '',
        phone: '',
        degree: '',
        year: '',
        imageUri: '',
    });

    const {data: profile, isFetching, isLoading, refetch} = useProfile();

    React.useEffect(() => {
        if (profile) {
            const newImageUri = profile?.user.image || '';
            if (newImageUri !== editableProfile.imageUri) {
                setImageRefreshKey(prev => prev + 1);
            }
            setEditableProfile({
                fname: profile?.profile?.fname || '',
                lname: profile?.profile?.lname || '',
                email: profile?.profile?.email || '',
                phone: profile?.profile?.phone || '',
                degree: profile.degree || '',
                year: profile.year || '3rd',
                imageUri: newImageUri,
            });
        }
    }, [profile]);

    const handleRefresh = React.useCallback(async () => {
        setRefreshing(true);
        try {
            await refetch();
        } finally {
            setRefreshing(false);
        }
    }, [refetch]);

    const confirmLogout = () => {
        Alert.alert(
            'Confirm Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.removeItem('userToken');
                        navigation.navigate('Login');
                    },
                },
            ],
            {cancelable: true},
        );
    };

    const handleEditProfile = () => {
        setVisible(true);
    };

    const getInitials = () => {
        return (
            (editableProfile?.fname?.charAt(0) || '') +
            (editableProfile?.lname?.charAt(0) || '')
        );
    };

    if (isLoading && !refreshing) {
        return (
            <View
                style={[
                    styles.loadingContainer,
                    {backgroundColor: theme.colors.background},
                ]}>
                <ActivityIndicator
                    animating={true}
                    size="large"
                    color={theme.colors.primary}
                />
            </View>
        );
    }

    return (
        <View
            style={[
                styles.container,
                {backgroundColor: theme.colors.elevation.level1},
            ]}>
            <SettingsForm
                visible={visible}
                onDismiss={() => setVisible(false)}
                profile={profile}
            />

            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing || isFetching}
                        onRefresh={handleRefresh}
                        colors={[theme.colors.primary]}
                        tintColor={theme.colors.primary}
                        progressBackgroundColor={theme.colors.surface}
                    />
                }>
                {/* Profile Header with Gradient Background */}
                <View style={styles.profileHeaderContainer}>
                    {/* Background Image Overlay - Only shown if image exists */}
                    {editableProfile.imageUri ? (
                        <Image
                            resizeMode="contain" // or "contain" based on your needs
                            source={logo}
                            // source={{
                            //     uri: `${PROFILE}${editableProfile.imageUri}?v=${imageRefreshKey}`,
                            // }}
                            style={styles.profileBackgroundImage}
                            blurRadius={5}
                            onError={e =>
                                console.log(
                                    'Failed to load background image:',
                                    e.nativeEvent.error,
                                )
                            }
                        />
                    ) : (
                        <View
                            style={[
                                styles.profileBackgroundImage,
                                {backgroundColor: theme.colors.primary},
                            ]}
                        />
                    )}

                    {/* Gradient Overlay */}
                    <LinearGradient
                        colors={[
                            'rgba(255, 0, 255, 0.36)',
                            'rgba(59, 245, 245, 0.31)',
                            'rgba(0, 0, 0, 0.19)', // Adding a darker tint at the bottom
                        ]}
                        style={styles.profileHeader}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 1}}
                        locations={[0, 0.6, 1]}>
                        <View style={styles.profileHeaderContent}>
                            <View style={styles.avatarContainer}>
                                {editableProfile.imageUri ? (
                                    <View style={styles.avatarWrapper}>
                                        <Avatar.Image
                                            size={120}
                                            source={{
                                                uri: editableProfile.imageUri
                                                    ? `${PROFILE}${editableProfile.imageUri}?v=${imageRefreshKey}`
                                                    : null,
                                            }}
                                            key={`profile-img-${imageRefreshKey}`}
                                            style={[
                                                styles.avatar,
                                                {
                                                    borderColor:
                                                        theme.colors.surface,
                                                    shadowColor: '#000',
                                                    shadowOffset: {
                                                        width: 0,
                                                        height: 4,
                                                    },
                                                    shadowOpacity: 0.3,
                                                    shadowRadius: 6,
                                                    elevation: 8,
                                                },
                                            ]}
                                        />
                                        <View style={styles.avatarOverlay} />
                                    </View>
                                ) : (
                                    <Avatar.Text
                                        size={120}
                                        label={getInitials() || 'JD'}
                                        style={{
                                            backgroundColor:
                                                theme.colors.primary,
                                            shadowColor: '#000',
                                            shadowOffset: {width: 0, height: 4},
                                            shadowOpacity: 0.3,
                                            shadowRadius: 6,
                                            elevation: 8,
                                        }}
                                        labelStyle={[
                                            styles.avatarText,
                                            {color: theme.colors.onPrimary},
                                        ]}
                                    />
                                )}
                                <TouchableOpacity
                                    style={[
                                        styles.editPhotoButton,
                                        {
                                            backgroundColor:
                                                theme.colors.surface,
                                            shadowColor: '#000',
                                            shadowOffset: {width: 0, height: 2},
                                            shadowOpacity: 0.25,
                                            shadowRadius: 4,
                                            elevation: 4,
                                        },
                                    ]}
                                    onPress={handleEditProfile}>
                                    <MaterialCommunityIcons
                                        name="camera"
                                        size={20}
                                        color={theme.colors.primary}
                                    />
                                </TouchableOpacity>
                            </View>

                            <Title
                                style={[
                                    styles.nameText,
                                    {
                                        textShadowColor: 'rgba(0, 0, 0, 0.3)',
                                        textShadowOffset: {width: 1, height: 1},
                                        textShadowRadius: 3,
                                    },
                                ]}>
                                {editableProfile.fname} {editableProfile.lname}
                            </Title>
                            <Paragraph
                                style={[
                                    styles.titleText,
                                    {
                                        textShadowColor: 'rgba(0, 0, 0, 0.3)',
                                        textShadowOffset: {width: 1, height: 1},
                                        textShadowRadius: 2,
                                    },
                                ]}>
                                {editableProfile.degree} Student
                            </Paragraph>
                        </View>
                    </LinearGradient>
                </View>

                {/* Profile Details Section */}
                <View style={styles.detailsContainer}>
                    <Card
                        style={[
                            styles.card,
                            {backgroundColor: theme.colors.surface},
                        ]}>
                        <Card.Content>
                            <View style={styles.cardHeader}>
                                <MaterialCommunityIcons
                                    name="account-details"
                                    size={24}
                                    color={theme.colors.primary}
                                />
                                <Text
                                    variant="titleMedium"
                                    style={styles.sectionTitle}>
                                    Personal Information
                                </Text>
                            </View>
                            <Divider style={styles.divider} />

                            <View style={styles.infoRow}>
                                <MaterialCommunityIcons
                                    name="email-outline"
                                    size={20}
                                    color={theme.colors.onSurfaceVariant}
                                />
                                <View style={styles.infoTextContainer}>
                                    <Text
                                        variant="labelSmall"
                                        style={styles.infoLabel}>
                                        Email
                                    </Text>
                                    <Text
                                        variant="bodyMedium"
                                        style={styles.infoValue}>
                                        {editableProfile.email ||
                                            'Not provided'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <MaterialCommunityIcons
                                    name="phone-outline"
                                    size={20}
                                    color={theme.colors.onSurfaceVariant}
                                />
                                <View style={styles.infoTextContainer}>
                                    <Text
                                        variant="labelSmall"
                                        style={styles.infoLabel}>
                                        Phone
                                    </Text>
                                    <Text
                                        variant="bodyMedium"
                                        style={styles.infoValue}>
                                        {editableProfile.phone ||
                                            'Not provided'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <MaterialCommunityIcons
                                    name="school-outline"
                                    size={20}
                                    color={theme.colors.onSurfaceVariant}
                                />
                                <View style={styles.infoTextContainer}>
                                    <Text
                                        variant="labelSmall"
                                        style={styles.infoLabel}>
                                        Degree Program
                                    </Text>
                                    <Text
                                        variant="bodyMedium"
                                        style={styles.infoValue}>
                                        {editableProfile.degree ||
                                            'Not specified'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <MaterialCommunityIcons
                                    name="calendar-outline"
                                    size={20}
                                    color={theme.colors.onSurfaceVariant}
                                />
                                <View style={styles.infoTextContainer}>
                                    <Text
                                        variant="labelSmall"
                                        style={styles.infoLabel}>
                                        Year of Study
                                    </Text>
                                    <Text
                                        variant="bodyMedium"
                                        style={styles.infoValue}>
                                        {editableProfile.year ||
                                            'Not specified'}
                                    </Text>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Academic Progress Section */}
                    <Card
                        style={[
                            styles.card,
                            {backgroundColor: theme.colors.surface},
                        ]}>
                        <Card.Content>
                            <View style={styles.cardHeader}>
                                <MaterialCommunityIcons
                                    name="chart-line"
                                    size={24}
                                    color={theme.colors.primary}
                                />
                                <Text
                                    variant="titleMedium"
                                    style={styles.sectionTitle}>
                                    Academic Progress
                                </Text>
                            </View>
                            <Divider style={styles.divider} />

                            <View style={styles.progressContainer}>
                                <View style={styles.progressItem}>
                                    <Text
                                        variant="labelSmall"
                                        style={styles.progressLabel}>
                                        Courses Completed
                                    </Text>
                                    <Badge
                                        size={32}
                                        style={styles.progressBadge}>
                                        24
                                    </Badge>
                                </View>

                                <View style={styles.progressItem}>
                                    <Text
                                        variant="labelSmall"
                                        style={styles.progressLabel}>
                                        Current GPA
                                    </Text>
                                    <Badge
                                        size={32}
                                        style={styles.progressBadge}>
                                        3.8
                                    </Badge>
                                </View>

                                <View style={styles.progressItem}>
                                    <Text
                                        variant="labelSmall"
                                        style={styles.progressLabel}>
                                        Credits Earned
                                    </Text>
                                    <Badge
                                        size={32}
                                        style={styles.progressBadge}>
                                        72
                                    </Badge>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Quick Actions Section */}
                    <Card
                        style={[
                            styles.card,
                            {backgroundColor: theme.colors.surface},
                        ]}>
                        <Card.Content>
                            <View style={styles.cardHeader}>
                                <MaterialCommunityIcons
                                    name="lightning-bolt-outline"
                                    size={24}
                                    color={theme.colors.primary}
                                />
                                <Text
                                    variant="titleMedium"
                                    style={styles.sectionTitle}>
                                    Quick Actions
                                </Text>
                            </View>
                            <Divider style={styles.divider} />

                            <View style={styles.actionsContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.actionButton,
                                        {
                                            backgroundColor:
                                                theme.colors.primaryContainer,
                                        },
                                    ]}>
                                    <MaterialCommunityIcons
                                        name="book-edit-outline"
                                        size={24}
                                        color={theme.colors.primary}
                                    />
                                    <Text
                                        variant="labelSmall"
                                        style={styles.actionText}>
                                        Edit Courses
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.actionButton,
                                        {
                                            backgroundColor:
                                                theme.colors.primaryContainer,
                                        },
                                    ]}>
                                    <MaterialCommunityIcons
                                        name="file-document-outline"
                                        size={24}
                                        color={theme.colors.primary}
                                    />
                                    <Text
                                        variant="labelSmall"
                                        style={styles.actionText}>
                                        View Transcript
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.actionButton,
                                        {
                                            backgroundColor:
                                                theme.colors.primaryContainer,
                                        },
                                    ]}>
                                    <MaterialCommunityIcons
                                        name="calendar-check-outline"
                                        size={24}
                                        color={theme.colors.primary}
                                    />
                                    <Text
                                        variant="labelSmall"
                                        style={styles.actionText}>
                                        Schedule
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </Card.Content>
                    </Card>
                    <View style={styles.footer}>
                        <Button
                            mode="contained"
                            onPress={handleEditProfile}
                            style={styles.editButton}
                            icon="account-edit"
                            contentStyle={styles.buttonContent}>
                            Edit Profile
                        </Button>
                        <Button
                            mode="outlined"
                            onPress={confirmLogout}
                            style={styles.logoutButton}
                            icon="logout"
                            textColor={theme.colors.error}
                            contentStyle={styles.buttonContent}>
                            Logout
                        </Button>
                    </View>
                </View>
            </ScrollView>

            {/* Fixed Action Buttons */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        paddingBottom: 100,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileHeader: {
        paddingTop: 50,
        paddingBottom: 30,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    profileHeaderContent: {
        alignItems: 'center',
        width: '100%',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 15,
        borderWidth: 2,
        borderRadius: 70,
        padding: 2,
        borderColor: '#fff',
    },
    avatar: {},
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
    },
    editPhotoButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    nameText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 10,
    },
    titleText: {
        color: 'white',
        opacity: 0.9,
        fontSize: 16,
    },
    detailsContainer: {
        paddingHorizontal: 20,
        marginTop: 20,
    },
    card: {
        borderRadius: 12,
        marginBottom: 20,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    sectionTitle: {
        marginLeft: 10,
        fontWeight: 'bold',
    },
    divider: {
        marginBottom: 15,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    infoTextContainer: {
        marginLeft: 15,
        flex: 1,
    },
    infoLabel: {
        opacity: 0.7,
    },
    infoValue: {
        marginTop: 2,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    progressItem: {
        alignItems: 'center',
        flex: 1,
    },
    progressLabel: {
        marginBottom: 5,
        textAlign: 'center',
    },
    progressBadge: {
        backgroundColor: 'transparent',
        borderWidth: 1,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    actionButton: {
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        width: width / 3 - 25,
    },
    actionText: {
        marginTop: 5,
        textAlign: 'center',
    },
    footer: {
        // position: 'absolute',
        // bottom: 70,
        // left: 0,
        // right: 0,
        // padding: 20,
        // backgroundColor: 'rgba(255, 255, 255, 0.9)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    editButton: {
        flex: 1,
        marginRight: 10,
        borderRadius: 8,
    },
    logoutButton: {
        flex: 1,
        borderRadius: 8,
    },
    buttonContent: {
        height: 48,
    },
    profileHeaderContainer: {
        position: 'relative',
        overflow: 'hidden',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    profileBackgroundImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.9,
    },
    avatarWrapper: {
        position: 'relative',
    },
    avatarOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 60,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
});

export default ProfileScreen;
