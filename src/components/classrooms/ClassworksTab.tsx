//@ts-nocheck
import React, {useEffect, useState} from 'react';
import {
    View,
    StyleSheet,
    Linking,
    ScrollView,
    FlatList,
    useWindowDimensions,
    RefreshControl,
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
} from 'react-native-paper';
import useClassroomStore from '../../states/classroomState';
import {StudentWork, AssignmentItem} from '../../components/';
import {useRoute} from '@react-navigation/native';
import useClassworks from '../../hooks/useClassworks';
import {formatDueDate, formatDate} from '../../utils/helper';
import RenderHtml from 'react-native-render-html';
import Icon from 'react-native-vector-icons/Ionicons';
import {useGlobalStyles} from '../../styles/globalStyles';
import useClassworkSubmission from '../../hooks/useClassworkSubmission';
import useGlobalStore from '../../states/globalState';
import BottomSheet from '../BottomSheet';

const ClassworksTab = () => {
    const globalStyle = useGlobalStyles();
    const theme = useTheme();
    const {width} = useWindowDimensions();
    const {setField, studentSubmission} = useClassroomStore();
    const route = useRoute();
    const {class_id} = route.params || {};
    const {
        isLoading,
        data: classworks,
        refetch,
        isFetching,
    } = useClassworks(class_id);

    const [activePanels, setActivePanels] = useState([]);
    const [filterTerm, setFilterTerm] = useState(null);
    const [filterType, setFilterType] = useState(null);
    const [filterDueStatus, setFilterDueStatus] = useState(null);
    const [termMenuVisible, setTermMenuVisible] = useState(false);
    const [typeMenuVisible, setTypeMenuVisible] = useState(false);
    const [dueMenuVisible, setDueMenuVisible] = useState(false);
    const [classworkId, setClassworkId] = useState(null);
    const [visible, setIsVisible] = useState(false);

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
        //getDueStatus(assignment.due_date)
        const dueStatus = 'due-soon';

        // const handleLinkPress = async url => {
        //     const supported = await Linking.canOpenURL(url);
        //     if (supported) {
        //         await Linking.openURL(url);
        //     }
        // };

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

                        {/* <HtmlRendererWithSeeMore
                            htmlContent={assignment?.instructions || ''}
                            maxLines={3}
                        /> */}
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

    const handleSubmission = (slug, title, points_possible) => {
        setField('studentSubmission', true);
        setField('classwork_id', slug);
        setField('classwork_title', title);
        setField('classwork_points', points_possible);
        setIsVisible(true);
    };

    const MemoizedAssignmentItem = React.memo(AssignmentItem);

    const renderItem = ({item}) => (
        <TouchableRipple
            onPress={() =>
                handleSubmission(item.slug, item.title, item.points_possible)
            }
            borderless={true}
            style={globalStyle.assignmentCard}>
            <View style={globalStyle.assignmentContent}>
                <Text style={globalStyle.assignmentTitle}>{item.title}</Text>

                <View style={globalStyle.assignmentDetailsRow}>
                    <View style={globalStyle.assignmentDetailItem}>
                        <Icon
                            source="numeric"
                            size={16}
                            color={theme.colors.primary}
                        />
                        <Text style={globalStyle.assignmentDetailText}>
                            {item.points_possible || 0} pts
                        </Text>
                    </View>

                    {item.due_date && (
                        <View style={globalStyle.assignmentDetailItem}>
                            <Icon
                                source="calendar-clock"
                                size={16}
                                color={theme.colors.primary}
                            />
                            <Text style={globalStyle.assignmentDetailText}>
                                {new Date(item.due_date).toLocaleDateString()}
                            </Text>
                        </View>
                    )}

                    {item.submission_type && (
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
                    )}
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
            <BottomSheet
                heightPercentage={1}
                visible={visible}
                onDismiss={() => {
                    setIsVisible(false);
                }}>
                <StudentWork class_id={class_id} />
            </BottomSheet>
            {/* <IconButton
                icon="close"
                size={20}
                iconColor={'red'}
                onPress={() => setIsVisible(true)}
                style={{
                    marginRight: 8,
                }}
            /> */}
            {/* Filter Controls */}
            <View style={styles.filterContainer}>
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
                                ? filterTerm.charAt(0).toUpperCase() +
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
                                      opt => opt.value === filterType,
                                  )?.label || filterType.replace(/-/g, ' ')
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
                                      opt => opt.value === filterDueStatus,
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
            <FlatList
                data={filteredClassworks || []}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
                // renderItem={({item: assignment}) => (
                //     <AssignmentItem
                //         assignment={assignment}
                //         activePanels={activePanels}
                //         handlePanelChange={handlePanelChange}
                //         handleSubmission={handleSubmission}
                //         getFileIcon={getFileIcon}
                //         getDueStatus={getDueStatus}
                //     />
                // )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon
                            name="document-text-outline"
                            size={48}
                            color="#999"
                        />
                        <Text style={styles.emptyText}>
                            {filterTerm || filterType || filterDueStatus
                                ? 'No assignments match your filters'
                                : 'No assignments found'}
                        </Text>
                        {!isLoading && (
                            <Button
                                mode="contained-tonal"
                                onPress={() => refetch()}
                                style={styles.retryButton}>
                                Refresh
                            </Button>
                        )}
                    </View>
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
                            {(filterTerm || filterType || filterDueStatus) && (
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
        borderRadius: 8, // Match your card's border radius
        margin: 4, // Optional margin for the ripple effect
    },
});

export default ClassworksTab;
