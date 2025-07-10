//@ts-nocheck
import React, {useState, useEffect, useRef} from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    StatusBar,
    Text as Text2,
    ImageBackground,
    RefreshControl,
    BackHandler,
    Alert,
    Animated,
} from 'react-native';
import {
    Text,
    TouchableRipple,
    Card,
    IconButton,
    useTheme,
    Divider,
    Appbar,
    Menu,
    TextInput,
    Paragraph,
    Title,
    ActivityIndicator,
    Avatar,
} from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import LinearGradient from 'react-native-linear-gradient';
import {MaskedView} from '@react-native-masked-view/masked-view';
import {useNavigation} from '@react-navigation/native';
import GradientStatusBar from './GradientStatusBar';
import {TextComponent} from '../components';
import useClassroom from '../hooks/useClassroom';
import {Item} from 'react-native-paper/lib/typescript/components/Drawer/Drawer';
import dayjs from 'dayjs';
import {DEFAULT_BANNER, HERO_IMAGE} from '../utils/constant';
import useClassroomStore from '../states/classroomState';
import {useGlobalStyles} from '../styles/globalStyles';
import {Pusher, PusherEvent} from '@pusher/pusher-websocket-react-native';
import useGlobalStore from '../states/globalState';
import SoundPlayer from 'react-native-sound-player';

const pusher = Pusher.getInstance();

const ClassroomListScreen = () => {
    const scrollY = useRef(new Animated.Value(0)).current;
    const headerHeight = 90; // Typical Appbar height

    // Header animation values
    const headerTranslateY = scrollY.interpolate({
        inputRange: [0, headerHeight],
        outputRange: [0, -headerHeight],
        extrapolate: 'clamp',
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, headerHeight * 0.8], // Start fading out earlier
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const globalStyle = useGlobalStyles();
    const theme = useTheme();
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterVisible, setFilterVisible] = useState(false);
    const [capacityFilter, setCapacityFilter] = useState(null);
    const [buildingFilter, setBuildingFilter] = useState(null);
    const {notifications, addNotification} = useGlobalStore();
    const {data: classrooms, isFetching, isLoading, refetch} = useClassroom();
    const {setField} = useClassroomStore();

    useEffect(() => {
        const backAction = () => {
            // Check if the current route is the initial/main screen
            if (navigation.isFocused()) {
                Alert.alert(
                    'Hold on!',
                    'Are you sure you want to exit the app?',
                    [
                        {
                            text: 'Cancel',
                            onPress: () => null,
                            style: 'cancel',
                        },
                        {
                            text: 'Yes',
                            onPress: () => BackHandler.exitApp(),
                        },
                    ],
                );
                return true;
            }
            // If not on the main screen, let the default back behavior occur
            return false;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );

        return () => backHandler.remove();
    }, [navigation]);

    const playNotificationSound = () => {
        try {
            SoundPlayer.playSoundFile('notification', 'mp3');
        } catch (e) {
            console.log('Cannot play the sound file', e);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const channels = [];
        const setupPusher = async () => {
            try {
                await pusher.init({
                    apiKey: '2a008480987a89072eaf',
                    cluster: 'ap1',
                });

                await pusher.connect();

                Array.isArray(classrooms) &&
                    classrooms.forEach(async classroom => {
                        const channelName = `classwork.${classroom.id}`;

                        const channel = await pusher.subscribe({
                            channelName: channelName,
                            onEvent: event => {
                                if (!isMounted) return;

                                if (event.eventName === 'classwork') {
                                    try {
                                        const data =
                                            typeof event.data === 'string'
                                                ? JSON.parse(event.data)
                                                : event.data;

                                        addNotification({
                                            id: data.id,
                                            class_id: data.class_id,
                                            class_slug: data.class_slug,
                                            ntype: 'classwork',
                                            title: data.title,
                                            message: data.message,
                                            className: data.className,
                                            time: data.time,
                                        });
                                        playNotificationSound();
                                    } catch (e) {
                                        console.error(
                                            'Error processing notification:',
                                            e,
                                        );
                                    }
                                }
                            },
                        });
                        channels.push(channel);
                        console.log('Subscribed to channel:', channelName);
                    });
            } catch (error) {
                console.error('Pusher setup failed:', error);
            }
        };

        setupPusher();

        return () => {
            isMounted = false;
            channels.forEach(channel => {
                pusher.unsubscribe({channelName: channel.channelName});
            });
            pusher.disconnect();
        };
    }, [classrooms]);

    const buildings = [];

    const filteredClassrooms =
        Array.isArray(classrooms) &&
        classrooms.filter(classroom => {
            const matchesSearch = classroom.class_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            let matchesCapacity = true;
            if (capacityFilter === 'small') {
                matchesCapacity = classroom.capacity < 20;
            } else if (capacityFilter === 'medium') {
                matchesCapacity =
                    classroom.capacity >= 20 && classroom.capacity < 40;
            } else if (capacityFilter === 'large') {
                matchesCapacity = classroom.capacity >= 40;
            }

            const matchesBuilding = buildingFilter
                ? classroom.building === buildingFilter
                : true;

            return matchesSearch && matchesCapacity && matchesBuilding;
        });

    const clearFilters = () => {
        setCapacityFilter(null);
        setBuildingFilter(null);
        setSearchQuery('');
    };

    const renderItem = ({item}) => (
        <TouchableRipple
            borderless={true}
            onPress={() => {
                setField('faculty', item?.faculty) || null;
                navigation.navigate('ClassroomDetails', {
                    class_id: item?.slug,
                });
            }}
            style={[globalStyle.assignmentCard, {elevation: 5}]}>
            <>
                <ImageBackground
                    source={{
                        uri: item?.hero_image
                            ? HERO_IMAGE + item?.hero_image
                            : DEFAULT_BANNER,
                    }}
                    style={styles.cardImage}
                    resizeMode="cover">
                    <LinearGradient
                        colors={[
                            'rgba(255, 0, 255, 0.7)',
                            'rgba(59, 245, 245, 0.7)',
                        ]}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 1}}
                        style={{
                            padding: 0,
                            paddingTop: 0,
                            margin: 0,
                        }}>
                        <View style={styles.titleHeader}>
                            <Title style={styles.cardTitle} numberOfLines={1}>
                                {item?.subject?.subject_name}
                            </Title>
                            <Text style={styles.cardSubtitle}>
                                {item?.subject?.subject_code}
                            </Text>
                        </View>
                    </LinearGradient>
                </ImageBackground>
                <Card.Content style={styles.cardContent}>
                    <Paragraph style={styles.cardText} numberOfLines={1}>
                        <MaterialIcons name="class" size={16} />{' '}
                        <Text style={styles.boldText}>Class:</Text>{' '}
                        <Text
                            style={[
                                styles.className,
                                {color: theme.colors.primary},
                            ]}>
                            {item.class_name}
                        </Text>{' '}
                    </Paragraph>
                    <Paragraph style={styles.cardText}>
                        <MaterialCommunityIcons
                            name="google-classroom"
                            size={16}
                        />{' '}
                        <Text style={styles.boldText}>Section:</Text>{' '}
                        {item.section}
                    </Paragraph>
                    <Paragraph style={styles.cardText}>
                        <MaterialCommunityIcons
                            name="google-classroom"
                            size={16}
                        />{' '}
                        <Text style={styles.boldText}>Room:</Text> {item.room}
                    </Paragraph>
                    <Paragraph style={styles.cardText}>
                        <FontAwesome name="calendar" size={16} />{' '}
                        <Text style={styles.boldText}>Day:</Text> {item.day}
                    </Paragraph>
                    <Paragraph style={styles.cardText}>
                        <AntDesign name="clockcircle" size={16} />{' '}
                        <Text style={styles.boldText}>Time:</Text>{' '}
                        {dayjs(
                            `1970-01-01 ${item.time_in}`,
                            'YYYY-MM-DD HH:mm:ss',
                        ).format('h A')}{' '}
                        -{' '}
                        {dayjs(
                            `1970-01-01 ${item.time_out}`,
                            'YYYY-MM-DD HH:mm:ss',
                        ).format('h A')}
                    </Paragraph>
                </Card.Content>

                <Card.Actions style={styles.cardActions}>
                    <Text style={styles.studentCount}>
                        {item?.students_count || 0} students enrolled
                    </Text>
                    <Text style={styles.studentCount}>
                        {item?.status === 'lock' && (
                            <MaterialIcons name="lock-outline" size={20} color={theme.colors.error} />
                        )}
                    </Text>
                </Card.Actions>
            </>
        </TouchableRipple>
    );

    const GradientIconButton = ({icon, onPress, colors}) => (
        <LinearGradient
            colors={colors}
            style={styles.gradientButton}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}>
            <IconButton
                icon={icon}
                onPress={onPress}
                style={{backgroundColor: 'transparent'}}
                rippleColor="rgba(255, 255, 255, 0.2)"
            />
        </LinearGradient>
    );

    const handleScroll = Animated.event(
        [{nativeEvent: {contentOffset: {y: scrollY}}}],
        {useNativeDriver: true},
    );

    return (
        <>
            <GradientStatusBar />
            <View style={styles.container}>
                <LinearGradient
                    colors={[theme.colors.background, theme.colors.background]}
                    style={styles.background}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}>
                    {/* Animated Header */}
                    <Animated.View
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: headerHeight,
                            zIndex: 10,
                            transform: [{translateY: headerTranslateY}],
                            opacity: headerOpacity,
                        }}>
                        <Appbar.Header
                            style={{
                                backgroundColor: 'transparent',
                                elevation: 0,
                            }}>
                            <Appbar.Content
                                title={
                                    <Text variant="headlineSmall">
                                        Classrooms
                                    </Text>
                                }
                            />
                        </Appbar.Header>
                    </Animated.View>

                    {/* Main Content */}
                    <Animated.FlatList
                        data={filteredClassrooms}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={[
                            styles.listContent,
                            {
                                paddingTop: headerHeight,
                                paddingHorizontal: 10, // Add horizontal padding here
                                paddingBottom: 70,
                            },
                        ]}
                        showsVerticalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        refreshControl={
                            <RefreshControl
                                refreshing={isFetching}
                                onRefresh={() => refetch()}
                            />
                        }
                        ListEmptyComponent={
                            !isLoading ? (
                                <View
                                    style={[
                                        globalStyle.emptyContainer,
                                        {paddingTop: headerHeight},
                                    ]}>
                                    {/* Empty state content */}
                                </View>
                            ) : null
                        }
                    />
                </LinearGradient>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 90,
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.97)',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 4,
        elevation: 4,
    },
    appBarHeader: {
        backgroundColor: 'transparent',
        elevation: 0,
    },
    listContent: {
        paddingTop: 90,
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    card: {
        marginBottom: 16,
        elevation: 2,
        borderRadius: 8,
        overflow: 'hidden',
    },
    cardImage: {
        height: 180,
        justifyContent: 'flex-end',
    },
    headerTitle: {
        marginLeft: 8,
        fontWeight: 'bold',
    },
    listContent: {
        paddingBottom: 20,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 0,
    },
    classroomName: {
        marginLeft: 10,
    },
    cardDetails: {
        marginLeft: 34,
    },
    cardContent: {},
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    detailText: {
        marginLeft: 8,
    },
    gradientButton: {
        borderRadius: 50,
        padding: 0,
        margin: 0,
        height: 45,
        width: 45,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    searchInput: {
        backgroundColor: 'white',
    },
    filterChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        margin: 4,
        paddingLeft: 12,
    },
    chipText: {
        marginRight: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 18,
    },
    emptySubtext: {
        marginTop: 8,
        fontSize: 14,
        opacity: 0.6,
    },
    card: {
        marginBottom: 16,
        elevation: 4,
    },
    cardImage: {
        height: 180,
        justifyContent: 'flex-end',
    },
    titleHeader: {
        padding: 16,
    },
    cardTitle: {
        color: 'white',
        fontSize: 18,
        marginBottom: 4,
    },
    cardSubtitle: {
        color: 'white',
    },
    menuButton: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    cardContent: {
        padding: 16,
    },
    cardText: {
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    boldText: {
        fontWeight: 'bold',
    },
    className: {
        fontWeight: 'bold',
    },
    cardActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    studentCount: {
        fontSize: 12,
        color: 'gray',
    },
    emptyCard: {
        margin: 16,
    },
    emptyContent: {
        alignItems: 'center',
        padding: 32,
    },
    addButton: {
        marginTop: 16,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});

export default ClassroomListScreen;
