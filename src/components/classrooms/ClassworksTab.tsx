//@ts-nocheck
import React, {useEffect, useState, useRef} from 'react';
import {
    View,
    StyleSheet,
    Linking,
    ScrollView,
    FlatList,
    useWindowDimensions,
    RefreshControl,
    Animated,
    InteractionManager,
} from 'react-native';
import {
    Card,
    Text,
    IconButton,
    Button,
    Chip,
    Divider,
    List,
    useTheme,
    TouchableRipple,
    ActivityIndicator,
    Menu,
    Avatar,
} from 'react-native-paper';
import useClassroomStore from '../../states/classroomState';
import {StudentWork, AssignmentItem} from '../../components/';
import {useRoute} from '@react-navigation/native';
import useClassworks from '../../hooks/useClassworks';
import {formatDueDate, formatDate} from '../../utils/helper';
import Icon from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {useGlobalStyles} from '../../styles/globalStyles';
import useClassworkSubmission from '../../hooks/useClassworkSubmission';
import useGlobalStore from '../../states/globalState';
// import BottomSheet from '../BottomSheet';
// import BottomSheet from './BottomSheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import {useBottomSheet} from '../BottomSheetContext';
import {useNavigation} from '@react-navigation/native';
import {IconTextIcon} from '../../components/AdvancedGradientShimmer';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const ClassworksTab = () => {
    const navigation = useNavigation();
    const globalStyle = useGlobalStyles();
    const theme = useTheme();
    const {width} = useWindowDimensions();
    const {setField, studentSubmission, faculty, classworkDetails} =
        useClassroomStore();
    const route = useRoute();
    const {class_id, id: classworkId, ntype} = route.params || {};
    const {
        isLoading,
        data: classworks,
        refetch,
        isFetching,
    } = useClassworks(class_id);
    useEffect(() => {
        const task = InteractionManager.runAfterInteractions(async () => {
            if (ntype === 'classwork') {
                const classwork = classworks.find(
                    item => item.slug === classworkId,
                );
                if(!classwork?.id){
                    return;
                }
                setField('classwork_id', classwork?.slug);
                setField('classwork', classwork);
                const student = JSON.parse(await AsyncStorage.getItem('user'));
                const student_id = student?.student_id;
                setField('otherUser', {
                    id: faculty?.id,
                    name: `${faculty?.fname} ${faculty?.lname}`,
                    role: 'faculty',
                    email: '',
                });

                setField('currentUser', {
                    id: student_id,
                    name: `Student Name`,
                    role: 'student',
                    email: '',
                });

                navigation.navigate('StudentWork', {
                    classworkId: classworkId,
                });
            }
        });

        // Optional cleanup if needed
        return () => {
            task?.cancel?.();
        };
    }, [classworks]);

    const [activePanels, setActivePanels] = useState([]);
    const [filterTerm, setFilterTerm] = useState(null);
    const [filterType, setFilterType] = useState(null);
    const [filterDueStatus, setFilterDueStatus] = useState(null);
    const [termMenuVisible, setTermMenuVisible] = useState(false);
    const [typeMenuVisible, setTypeMenuVisible] = useState(false);
    const [dueMenuVisible, setDueMenuVisible] = useState(false);
    const [visible, setIsVisible] = useState(false);
    // const {showBottomSheet, hideBottomSheet} = useBottomSheet();

    const scrollY = useRef(new Animated.Value(0)).current;

    const data = Array.from({length: 20}, (_, i) => ({
        id: i.toString(),
        text: `Item ${i + 1}`,
    }));

    const onScroll = Animated.event(
        [{nativeEvent: {contentOffset: {y: scrollY}}}],
        {useNativeDriver: true},
    );

    const buttonCollapse = scrollY.interpolate({
        inputRange: [0, 50],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const translateY = buttonCollapse.interpolate({
        inputRange: [0, 1],
        outputRange: [-60, 0],
    });

    // Filter options
    const termOptions = [
        {label: 'All Terms', value: null},
        {label: 'Midterm', value: 'midterm'},
        {label: 'Final', value: 'final'},
    ];

    const typeOptions = [
        {label: 'All Types', value: null},
        {label: 'Hands-on Quiz', value: 'hands-on-quiz'},
        {label: 'Lab Exercises', value: 'lab-exercises'},
        {label: 'Lab Assignment', value: 'lab-assignment'},
        {label: 'Midterm Exam', value: 'midterm-exam'},
        {label: 'Final Exam', value: 'final-exam'},
    ];

    const dueStatusOptions = [
        {label: 'All Due Dates', value: null},
        {label: 'Due Today', value: 'due-today'},
        {label: 'Overdue', value: 'overdue'},
        {label: 'Due Soon', value: 'due-soon'},
        {label: 'Not Due Yet', value: 'not-due'},
        {label: 'No Due Date', value: 'no-due'},
    ];

    // Filter the classworks based on selected filters
    const filteredClassworks = classworks?.filter(assignment => {
        const termMatch =
            !filterTerm || assignment.term?.toLowerCase() === filterTerm;
        const typeMatch =
            !filterType || assignment.type?.toLowerCase() === filterType;

        // Due status filtering
        let dueStatusMatch = true;
        if (filterDueStatus) {
            const now = new Date();
            const todayStart = new Date(now);
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date(now);
            todayEnd.setHours(23, 59, 59, 999);

            const dueDate = assignment.due_date
                ? new Date(assignment.due_date)
                : null;

            switch (filterDueStatus) {
                case 'due-today':
                    dueStatusMatch =
                        dueDate && dueDate >= todayStart && dueDate <= todayEnd;
                    break;
                case 'overdue':
                    dueStatusMatch = dueDate && dueDate < todayStart;
                    break;
                case 'due-soon':
                    dueStatusMatch =
                        dueDate &&
                        dueDate > todayEnd &&
                        dueDate <
                            new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'not-due':
                    dueStatusMatch =
                        dueDate &&
                        dueDate >
                            new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'no-due':
                    dueStatusMatch = !dueDate;
                    break;
                default:
                    dueStatusMatch = true;
            }
        }

        return termMatch && typeMatch && dueStatusMatch;
    });

    const handleAssignmentPress = assignmentId => {
        setField('studentSubmission', true);
    };

    const getFileIcon = type => {
        const iconMap = {
            pdf: 'file-pdf-box',
            doc: 'file-word-box',
            docx: 'file-word-box',
            xls: 'file-excel-box',
            xlsx: 'file-excel-box',
            ppt: 'file-powerpoint-box',
            pptx: 'file-powerpoint-box',
            jpg: 'file-image',
            jpeg: 'file-image',
            png: 'file-image',
            gif: 'file-image',
            txt: 'file-document',
            default: 'file',
        };

        return iconMap[type] || iconMap.default;
    };

    const getDueStatus = dueDate => {
        if (!dueDate) return 'no-due';

        const now = new Date();
        const due = new Date(dueDate);

        // Set up date ranges for comparison
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0); // Start of today
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999); // End of today
        const oneWeekFromNow = new Date(
            now.getTime() + 7 * 24 * 60 * 60 * 1000,
        );

        if (due < todayStart) return 'overdue';
        if (due >= todayStart && due <= todayEnd) return 'due-today'; // Due today
        if (due < oneWeekFromNow) return 'due-soon';
        return 'not-due';
    };

    const baseStyle = {
        color: theme.colors.text,
        paddingHorizontal: 12,
        fontSize: 16,
        lineHeight: 24,
    };

    const AssignmentItem = ({
        assignment,
        activePanels,
        handlePanelChange,
        handleSubmission,
    }) => {
        const dueStatus = 'due-soon';

        return (
            <>
                <Card mode="contained" style={styles.instructionsCard}>
                    <Card.Content>
                        <View style={styles.titleWrapper}>
                            <List.Icon
                                icon="clipboard-text"
                                color={theme.colors.primary}
                            />
                            <Text
                                variant="titleMedium"
                                style={styles.title}
                                numberOfLines={1}>
                                {assignment.title}
                            </Text>
                        </View>
                        <View style={styles.metaRow}></View>
                        {Array.isArray(assignment.attachment) &&
                            assignment.attachment.length > 0 && (
                                <>
                                    <Text
                                        variant="titleSmall"
                                        style={styles.sectionTitle}>
                                        Files
                                    </Text>
                                    <Card
                                        mode="contained"
                                        style={styles.attachmentsCard}>
                                        {assignment.attachment.map(
                                            (item, index) => (
                                                <List.Item
                                                    key={index}
                                                    title={
                                                        item?.file_name ||
                                                        'File'
                                                    }
                                                    description="PDF file"
                                                    left={props => (
                                                        <List.Icon
                                                            {...props}
                                                            icon={getFileIcon(
                                                                'pdf',
                                                            )}
                                                        />
                                                    )}
                                                    right={props => (
                                                        <List.Icon
                                                            {...props}
                                                            icon="download"
                                                        />
                                                    )}
                                                    onPress={() =>
                                                        handleLinkPress(
                                                            item?.file_link,
                                                        )
                                                    }
                                                    style={styles.listItem}
                                                />
                                            ),
                                        )}
                                    </Card>
                                </>
                            )}

                        {Array.isArray(assignment?.links) &&
                            assignment?.links.length > 0 && (
                                <>
                                    <Text
                                        variant="titleSmall"
                                        style={styles.sectionTitle}>
                                        Links
                                    </Text>
                                    <Card
                                        mode="contained"
                                        style={styles.linksCard}>
                                        {assignment.links.map((item, index) => (
                                            <List.Item
                                                key={index}
                                                title={item?.link}
                                                left={props => (
                                                    <List.Icon
                                                        {...props}
                                                        icon="link"
                                                    />
                                                )}
                                                right={props => (
                                                    <List.Icon
                                                        {...props}
                                                        icon="open-in-new"
                                                    />
                                                )}
                                                onPress={() =>
                                                    handleLinkPress(item?.link)
                                                }
                                                style={styles.listItem}
                                                titleNumberOfLines={2}
                                            />
                                        ))}
                                    </Card>
                                </>
                            )}

                        <View style={styles.buttonRow}>
                            <Button
                                mode="contained"
                                icon="file-eye"
                                onPress={() =>
                                    handleSubmission(
                                        assignment.slug,
                                        assignment.title,
                                        assignment.points_possible,
                                    )
                                }
                                style={styles.button}
                                contentStyle={styles.buttonContent}>
                                View Work
                            </Button>

                            {assignment.status === 'draft' && (
                                <Button
                                    mode="outlined"
                                    icon="send"
                                    style={styles.button}
                                    contentStyle={styles.buttonContent}>
                                    Publish
                                </Button>
                            )}
                        </View>
                    </Card.Content>
                </Card>
            </>
        );
    };

    const handlePanelChange = panelId => {
        setActivePanels(prev => {
            const index = prev.indexOf(panelId[0]);
            if (index > -1) {
                return [...prev.slice(0, index), ...prev.slice(index + 1)];
            } else {
                return [...prev, panelId[0]];
            }
        });
    };

    const handleSubmission = async classwork => {
        const student = JSON.parse(await AsyncStorage.getItem('user'));
        const student_id = student?.student_id;
        setField('classwork_id', classwork?.slug);
        setField('classwork', classwork);

        setField('otherUser', {
            id: faculty?.id,
            name: `${faculty?.fname} ${faculty?.lname} `,
            role: 'faculty',
            email: '',
        });
        setField('currentUser', {
            id: student_id,
            name: `Student Name`,
            role: 'student',
            email: '',
        });
        navigation.navigate('StudentWork', {
            classworkId: classwork?.slug,
        });
    };

    const MemoizedAssignmentItem = React.memo(AssignmentItem);

    const renderItem = ({item}) => (
        <TouchableRipple
            onPress={() => handleSubmission(item)}
            borderless={true}
            style={[globalStyle.assignmentCard]}>
            <View style={globalStyle.assignmentContent}>
                <View
                    style={[
                        styles.termWrapper,
                        item?.term === 'midterm' && {
                            backgroundColor: '#91caff',
                            borderWidth: 1,
                            borderColor: '#91caff',
                        },
                        item?.term === 'final' && {
                            backgroundColor: '#f6ffed',
                            borderWidth: 1,
                            borderColor: '#b7eb8f',
                        },
                        // Add more conditions as needed
                    ]}>
                    <Text
                        style={[
                            styles.termText,
                            item?.term === 'midterm' && {color: '#0958d9'},
                            item?.term === 'final' && {color: '#389e0d'},
                            // Add more conditions as needed
                        ]}>
                        {item?.term?.toUpperCase?.() || ''}
                    </Text>
                </View>
                <Text style={[globalStyle.assignmentTitle, {marginTop: 10}]}>
                    {item.title}
                </Text>
                <View style={[globalStyle.assignmentDetailsRow]}>
                    <View style={globalStyle.assignmentDetailItem}>
                        <Feather
                            name="star"
                            size={16}
                            color={theme.colors.primary}
                        />
                        <Text style={globalStyle.assignmentDetailText}>
                            {item.score || '0'}/{item.points_possible || 0}
                        </Text>
                    </View>

                    <View style={globalStyle.assignmentDetailItem}>
                        <Feather
                            name="calendar"
                            size={16}
                            color={theme.colors.primary}
                        />
                        <Text style={globalStyle.assignmentDetailText}>
                            {item.due_date
                                ? formatDate(item.due_date, true)
                                : 'None'}
                        </Text>
                    </View>
                    <View style={globalStyle.assignmentDetailItem}>
                        <Feather
                            name="message-circle"
                            size={16}
                            color={theme.colors.primary}
                        />
                        <Text style={globalStyle.assignmentDetailText}>0</Text>
                    </View>
                    <View style={globalStyle.assignmentDetailItem}>
                        <Icon
                            name="attach"
                            size={16}
                            color={theme.colors.primary}
                        />
                        <Text style={globalStyle.assignmentDetailText}>0</Text>
                    </View>

                    {/* {item.submission_type && (
                        <View style={styles.assignmentDetailItem}>
                            <Icon
                                source="file-upload"
                                size={16}
                                color={theme.colors.primary}
                            />
                            <Text style={styles.assignmentDetailText}>
                                {item.submission_type}
                            </Text>
                        </View>
                    )} */}
                </View>

                {item?.status && (
                    <View style={styles.assignmentStatusBadge(status)}>
                        <Text style={styles.assignmentStatusText}>
                            {item?.status.charAt(0).toUpperCase() +
                                item?.status.slice(1)}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableRipple>
    );

    return (
        <>
            {/* <BottomSheet
                heightPercentage={0.95}
                visible={classworkDetails}
                onClose={() => {
                    setField('classworkDetails',false);
                }}>
                <StudentWork class_id={class_id} />
            </BottomSheet> */}
            {!isLoading && (
                <>
                    <Animated.View
                        style={[
                            styles.filterContainer,
                            {
                                transform: [{translateY}],
                                opacity: buttonCollapse,
                            },
                        ]}>
                        <View style={styles.filterContainerContent}>
                            <Menu
                                visible={termMenuVisible}
                                onDismiss={() => setTermMenuVisible(false)}
                                anchor={
                                    <Button
                                        mode="outlined"
                                        onPress={() => setTermMenuVisible(true)}
                                        style={styles.filterButton}
                                        icon="filter">
                                        {filterTerm
                                            ? filterTerm
                                                  .charAt(0)
                                                  .toUpperCase() +
                                              filterTerm.slice(1)
                                            : 'All Terms'}
                                    </Button>
                                }>
                                {termOptions.map(option => (
                                    <Menu.Item
                                        key={option.value || 'all'}
                                        onPress={() => {
                                            setFilterTerm(option.value);
                                            setTermMenuVisible(false);
                                        }}
                                        title={option.label}
                                    />
                                ))}
                            </Menu>

                            <Menu
                                visible={typeMenuVisible}
                                onDismiss={() => setTypeMenuVisible(false)}
                                anchor={
                                    <Button
                                        mode="outlined"
                                        onPress={() => setTypeMenuVisible(true)}
                                        style={styles.filterButton}
                                        icon="filter">
                                        {filterType
                                            ? typeOptions.find(
                                                  opt =>
                                                      opt.value === filterType,
                                              )?.label ||
                                              filterType.replace(/-/g, ' ')
                                            : 'All Types'}
                                    </Button>
                                }>
                                {typeOptions.map(option => (
                                    <Menu.Item
                                        key={option.value || 'all'}
                                        onPress={() => {
                                            setFilterType(option.value);
                                            setTypeMenuVisible(false);
                                        }}
                                        title={option.label}
                                    />
                                ))}
                            </Menu>

                            <Menu
                                visible={dueMenuVisible}
                                onDismiss={() => setDueMenuVisible(false)}
                                anchor={
                                    <Button
                                        mode="outlined"
                                        onPress={() => setDueMenuVisible(true)}
                                        style={styles.filterButton}
                                        icon="calendar">
                                        {filterDueStatus
                                            ? dueStatusOptions.find(
                                                  opt =>
                                                      opt.value ===
                                                      filterDueStatus,
                                              )?.label || 'Due Filter'
                                            : 'Due Date'}
                                    </Button>
                                }>
                                {dueStatusOptions.map(option => (
                                    <Menu.Item
                                        key={option.value || 'all'}
                                        onPress={() => {
                                            setFilterDueStatus(option.value);
                                            setDueMenuVisible(false);
                                        }}
                                        title={option.label}
                                    />
                                ))}
                            </Menu>

                            {(filterTerm || filterType || filterDueStatus) && (
                                <Button
                                    mode="text"
                                    onPress={() => {
                                        setFilterTerm(null);
                                        setFilterType(null);
                                        setFilterDueStatus(null);
                                    }}
                                    icon="close">
                                    Clear
                                </Button>
                            )}
                        </View>
                    </Animated.View>
                    <AnimatedFlatList
                        showsVerticalScrollIndicator={false}
                        data={filteredClassworks || []}
                        keyExtractor={item => item.id.toString()}
                        renderItem={renderItem}
                        onScroll={onScroll}
                        scrollEventThrottle={16}
                        ListEmptyComponent={() =>
                            !isLoading ? (
                                <View style={globalStyle.emptyContainer}>
                                    <Avatar.Icon
                                        size={64}
                                        icon="clipboard-text-outline"
                                        style={globalStyle.emptyIcon}
                                    />
                                    <Text style={globalStyle.emptyTitle}>
                                        No Classwork Assigned
                                    </Text>
                                    <Text style={globalStyle.emptySubtitle}>
                                        When your teacher assigns classwork, it
                                        will show up here.
                                    </Text>
                                </View>
                            ) : null
                        }
                        contentContainerStyle={styles.listContent}
                        style={globalStyle.container}
                        refreshControl={
                            <RefreshControl
                                refreshing={isFetching}
                                onRefresh={refetch}
                                colors={[theme.colors.primary]}
                                tintColor={theme.colors.primary}
                            />
                        }
                        initialNumToRender={5}
                        maxToRenderPerBatch={5}
                        windowSize={10}
                        updateCellsBatchingPeriod={50}
                        removeClippedSubviews={true}
                        ListHeaderComponent={
                            filteredClassworks?.length > 0 ? (
                                <Text style={styles.listHeader}>
                                    {filteredClassworks.length} classwork
                                    {filteredClassworks.length !== 1 ? 's' : ''}
                                    {(filterTerm ||
                                        filterType ||
                                        filterDueStatus) && (
                                        <Text style={styles.filteredText}>
                                            {' '}
                                            (filtered)
                                        </Text>
                                    )}
                                </Text>
                            ) : null
                        }
                    />
                </>
            )}
            {isLoading && <IconTextIcon count={4} />}
        </>
    );
};

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    headerRowInner: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    titleWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        marginLeft: 8,
        flexShrink: 1,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        marginTop: 10,
    },
    typeChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        flex: 1,
        gap: 8,
    },
    chip: {
        // marginRight: 8,
        // marginBottom: 4,
    },
    chipText: {
        fontSize: 12,
    },
    dueDateWrapper: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    dueDate: {
        textAlign: 'right',
    },
    pointsRow: {
        flexDirection: 'row',
        marginBottom: 12,
        justifyContent: 'space-between',
    },
    sectionTitle: {
        marginTop: 8,
        marginBottom: 8,
    },
    instructionsCard: {
        marginBottom: 16,
    },
    attachmentsCard: {
        marginBottom: 16,
    },
    linksCard: {
        marginBottom: 16,
    },
    listItem: {
        paddingVertical: 4,
    },
    buttonRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 8,
        gap: 8,
    },
    button: {
        flexGrow: 1,
        minWidth: 120,
    },
    buttonContent: {
        height: 44,
    },
    listHeader: {
        paddingVertical: 8,
        fontSize: 14,
    },
    filteredText: {
        color: '#666',
        fontStyle: 'italic',
    },
    filterContainer: {
        position: 'absolute',
        top: 15,
        left: 0,
        right: 0,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filterContainerContent: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexWrap: 'wrap',
    },
    filterButton: {
        marginRight: 8,
        marginBottom: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        marginTop: 16,
        marginBottom: 16,
        color: '#666',
    },
    retryButton: {
        marginTop: 8,
    },

    card: {
        borderRadius: 8,
        margin: 8,
        overflow: 'hidden',
        elevation: 2,
    },
    image: {
        width: '100%',
        height: 150,
    },
    content: {
        padding: 16,
    },
    title: {
        marginBottom: 12,
    },
    button: {
        borderRadius: 4,
    },
    buttonContent: {
        height: 44,
    },
    rippleContainer: {
        borderRadius: 8,
        margin: 4,
    },
    listContent: {
        paddingTop: 100,
        paddingBottom: 25,
    },
    termWrapper: {
        position: 'absolute',
        right: 0,
        paddingLeft: 5,
        paddingRight: 5,
        paddingBottom: 2,
    },
    termText: {
        fontSize: 12,
    },
});

export default ClassworksTab;
