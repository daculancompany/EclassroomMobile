//@ts-nocheck
import React, {useState, useEffect} from 'react';
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

// Sound.setCategory('Playback'); ios only

const ClassroomListScreen = () => {
    useEffect(() => {
        const backAction = () => {
            Alert.alert('Hold on!', 'Are you sure you want to exit the app?', [
                {
                    text: 'Cancel',
                    onPress: () => null,
                    style: 'cancel',
                },
                {
                    text: 'Yes',
                    onPress: () => BackHandler.exitApp(),
                },
            ]);
            return true; // prevent default behavior
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );

        return () => backHandler.remove();
    }, []);

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
                                        // ✅ Parse data (handle both string & object)
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
            // Search by name
            const matchesSearch = classroom.class_name
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            // Filter by capacity
            let matchesCapacity = true;
            if (capacityFilter === 'small') {
                matchesCapacity = classroom.capacity < 20;
            } else if (capacityFilter === 'medium') {
                matchesCapacity =
                    classroom.capacity >= 20 && classroom.capacity < 40;
            } else if (capacityFilter === 'large') {
                matchesCapacity = classroom.capacity >= 40;
            }

            // Filter by building
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
        <Card style={[styles.card, {backgroundColor: theme.colors.surface}]}>
            <TouchableRipple
                onPress={() => {
                    setField('faculty', item?.faculty) || null;
                    navigation.navigate('ClassroomDetails', {
                        class_id: item?.slug,
                    });
                }}>
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
                                // borderRadius: 12,
                                padding: 0,
                                paddingTop: 0,
                                // paddingBottom: 7,
                                margin: 0,
                                // opacity: 0.9,
                            }}>
                            <View style={styles.titleHeader}>
                                <Title
                                    style={styles.cardTitle}
                                    numberOfLines={1}>
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
                            <Text style={styles.boldText}>Room:</Text>{' '}
                            {item.room}
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
                        {/* <IconButton
                            icon="eye"
                            onPress={() => handleNavigate(item?.slug)}
                        /> */}
                    </Card.Actions>
                </>
            </TouchableRipple>
        </Card>
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

    return (
        <>
            <GradientStatusBar />
            <LinearGradient
                colors={[
                    theme.colors.elevation.level1,
                    theme.colors.elevation.level1,
                ]}
                style={styles.container}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}>
                <Appbar.Header style={{ backgroundColor : 'transparent' }} >
                    <Appbar.Content
                        title={<Text variant="headlineSmall">Classrooms</Text>}
                    />
                    {/* <Menu
                        visible={filterVisible}
                        onDismiss={() => setFilterVisible(false)}
                        anchor={
                            <GradientIconButton
                                icon={() => (
                                    <Ionicons
                                        name="filter-outline"
                                        size={24}
                                        color={theme.colors.onPrimary}
                                    />
                                )}
                                onPress={() => setFilterVisible(true)}
                                colors={[
                                    'rgba(255, 0, 255, 0.7)',
                                    'rgba(59, 245, 245, 0.7)',
                                ]}
                            />
                        }>
                        <Menu.Item
                            leadingIcon="magnify"
                            title="Search"
                            onPress={() => {
                                setFilterVisible(false);
                                // You might want to focus on the search input here
                            }}
                        />
                        <Menu.Item
                            leadingIcon="account-group"
                            title="Capacity"
                            onPress={() => {
                                setFilterVisible(false);
                                // Show capacity filter options
                            }}
                        />
                        <Menu.Item
                            leadingIcon="office-building"
                            title="Building"
                            onPress={() => {
                                setFilterVisible(false);
                                // Show building filter options
                            }}
                        />
                        <Divider />
                        <Menu.Item
                            leadingIcon="filter-remove"
                            title="Clear Filters"
                            onPress={() => {
                                clearFilters();
                                setFilterVisible(false);
                            }}
                        />
                    </Menu> */}
                </Appbar.Header>

                {/* <View style={styles.searchContainer}>
                    <TextInput
                        placeholder="Search classrooms..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={styles.searchInput}
                        left={<TextInput.Icon icon="magnify" />}
                        mode="outlined"
                    />
                </View> */}

                <View style={styles.filterChips}>
                    {capacityFilter && (
                        <View
                            style={[
                                styles.chip,
                                {
                                    backgroundColor:
                                        theme.colors.primaryContainer,
                                },
                            ]}>
                            <Text style={styles.chipText}>
                                {capacityFilter === 'small'
                                    ? 'Small (<20)'
                                    : capacityFilter === 'medium'
                                    ? 'Medium (20-40)'
                                    : 'Large (40+)'}
                            </Text>
                            <IconButton
                                icon="close"
                                size={16}
                                onPress={() => setCapacityFilter(null)}
                            />
                        </View>
                    )}
                    {buildingFilter && (
                        <View
                            style={[
                                styles.chip,
                                {
                                    backgroundColor:
                                        theme.colors.primaryContainer,
                                },
                            ]}>
                            <Text style={styles.chipText}>
                                {buildingFilter}
                            </Text>
                            <IconButton
                                icon="close"
                                size={16}
                                onPress={() => setBuildingFilter(null)}
                            />
                        </View>
                    )}
                </View>
                <View style={{flex: 1, marginHorizontal: 10}}>
                    <FlatList
                        data={filteredClassrooms}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={isFetching}
                                onRefresh={() => refetch()}
                            />
                        }
                        ListEmptyComponent={
                            !isLoading ? (
                                <View style={globalStyle.emptyContainer}>
                                    <Avatar.Icon
                                        size={64}
                                        icon="school-outline"
                                        style={globalStyle.emptyIcon}
                                    />
                                    <Text style={globalStyle.emptyTitle}>
                                        No Classrooms Found
                                    </Text>
                                    <Text style={globalStyle.emptySubtitle}>
                                        Your classrooms will appear here once
                                        they're added.
                                    </Text>
                                </View>
                            ) : null
                        }
                        // ListFooterComponent={
                        //     isLoading ? (
                        //         <ActivityIndicator animating={true} />
                        //     ) : null
                        // }
                    />
           
                </View>

                <Menu
                    visible={false} // You'll need to manage this state
                    onDismiss={() => {}}
                    anchor={<View />}>
                    {buildings.map(building => (
                        <Menu.Item
                            key={building}
                            title={building}
                            onPress={() => setBuildingFilter(building)}
                        />
                    ))}
                </Menu>
            </LinearGradient>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
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
    cardContent: {
        // padding: 15,
    },
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
