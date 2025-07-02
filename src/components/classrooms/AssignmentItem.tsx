//@ts-nocheck
import React from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Linking,
    Dimensions,
} from 'react-native';
import {useTheme, Card} from 'react-native-paper';
// import {WebView} from 'react-native-webview';
import RenderHtml from 'react-native-render-html';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AssignmentItem = ({assignment}) => {
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

    const theme = useTheme();
    const {width} = Dimensions.get('window');

    const baseStyle = {
        color: theme.colors.text,
        paddingHorizontal: 12,
        fontSize: 16,
        lineHeight: 24,
    };

    const dueStatus = getDueStatus(assignment?.due_date);

    const handleLinkPress = async url => {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        }
    };

    const formatDate = dateString => {
        const options = {month: 'short', day: 'numeric', year: 'numeric'};
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getStatusColor = () => {
        switch (dueStatus) {
            case 'overdue':
                return theme.colors.error;
            case 'due-today':
                return theme.colors.primary;
            case 'due-soon':
                return theme.colors.tertiary;
            default:
                return theme.colors.secondary;
        }
    };

    const getStatusText = () => {
        switch (dueStatus) {
            case 'overdue':
                return 'Overdue';
            case 'due-today':
                return 'Due Today';
            case 'due-soon':
                return 'Due Soon';
            case 'no-due':
                return 'No Due Date';
            default:
                return 'Not Due Yet';
        }
    };

    const getStatusIcon = () => {
        switch (dueStatus) {
            case 'overdue':
                return 'alert';
            case 'due-today':
                return 'calendar-check';
            case 'due-soon':
                return 'clock-alert';
            case 'no-due':
                return 'calendar-remove';
            default:
                return 'calendar';
        }
    };

    return (
        <Card style={{margin: 15}}>
            <Card.Content>
                {/* Header Row */}

                <View style={styles.headerRowInner}>
                    <View style={styles.titleWrapper}>
                        <Icon
                            name="clipboard-text"
                            size={24}
                            color={theme.colors.primary}
                        />
                        <Text
                            style={[styles.title, {color: theme.colors.text}]}>
                            {assignment.title}
                        </Text>
                    </View>
                </View>

                {/* Meta Row */}
                <View style={styles.metaRow}>
                    <View style={styles.chipContainer}>
                        {/* Term Chip */}
                        <View
                            style={[
                                styles.chip,
                                {
                                    backgroundColor:
                                        assignment?.term?.toLowerCase() ===
                                        'midterm'
                                            ? theme.colors.primaryContainer
                                            : theme.colors.secondaryContainer,
                                    borderColor: theme.colors.outline,
                                },
                            ]}>
                            <Icon
                                name="book"
                                size={16}
                                color={theme.colors.text}
                            />
                            <Text
                                style={[
                                    styles.chipText,
                                    {color: theme.colors.text},
                                ]}>
                                {assignment?.term?.toUpperCase?.() || 'N/A'}
                            </Text>
                        </View>

                        {/* Type Chip */}
                        {assignment.type && (
                            <View
                                style={[
                                    styles.chip,
                                    {
                                        backgroundColor:
                                            theme.colors.surfaceVariant,
                                        borderColor: theme.colors.outline,
                                    },
                                ]}>
                                <Icon
                                    name="tag"
                                    size={16}
                                    color={theme.colors.text}
                                />
                                <Text
                                    style={[
                                        styles.chipText,
                                        {color: theme.colors.text},
                                    ]}>
                                    {assignment?.type.replace(/-/g, ' ') ||
                                        'No Type'}
                                </Text>
                            </View>
                        )}

                        {/* Due Status Chip */}
                        <View
                            style={[
                                styles.chip,
                                {
                                    backgroundColor:
                                        dueStatus === 'overdue'
                                            ? theme.colors.errorContainer
                                            : dueStatus === 'due-today'
                                            ? theme.colors.primaryContainer
                                            : dueStatus === 'due-soon'
                                            ? theme.colors.tertiaryContainer
                                            : theme.colors.surfaceVariant,
                                    borderColor: theme.colors.outline,
                                },
                            ]}>
                            <Icon
                                name={getStatusIcon()}
                                size={16}
                                color={getStatusColor()}
                            />
                            <Text
                                style={[
                                    styles.chipText,
                                    {
                                        color:
                                            dueStatus === 'overdue'
                                                ? theme.colors.error
                                                : theme.colors.text,
                                    },
                                ]}>
                                {getStatusText()}
                            </Text>
                        </View>

                        {/* Due Date Chip */}
                        <View
                            style={[
                                styles.chip,
                                {
                                    backgroundColor:
                                        theme.colors.surfaceVariant,
                                    borderColor: theme.colors.outline,
                                },
                            ]}>
                            <Icon
                                name="calendar"
                                size={16}
                                color={theme.colors.text}
                            />
                            <Text
                                style={[
                                    styles.chipText,
                                    {color: theme.colors.text},
                                ]}>
                                {assignment.due_date
                                    ? formatDate(assignment.due_date)
                                    : 'No due date'}
                            </Text>
                        </View>

                        {/* Points Chip */}
                        <View
                            style={[
                                styles.chip,
                                {
                                    backgroundColor:
                                        theme.colors.surfaceVariant,
                                    borderColor: theme.colors.outline,
                                },
                            ]}>
                            <Icon
                                name="star"
                                size={16}
                                color={theme.colors.text}
                            />
                            <Text
                                style={[
                                    styles.chipText,
                                    {color: theme.colors.text},
                                ]}>
                                {assignment.score || '0'}/
                                {assignment.points_possible || '0'}
                            </Text>
                        </View>
                    </View>
                </View>
                <Text style={[styles.sectionTitle, {color: theme.colors.text}]}>
                    Instructions
                </Text>
                <RenderHtml
                    contentWidth={width}
                    source={{
                        html:
                            assignment?.instructions ||
                            '<p>No instructions provided</p>',
                    }}
                    baseStyle={baseStyle}
                    tagsStyles={{
                        p: {marginBottom: 10},
                        ul: {marginBottom: 10},
                        ol: {marginBottom: 10},
                    }}
                />
                {/* <WebView
                        originWhitelist={['*']}
                        source={{
                            html: `
                                <html>
                                    <head>
                                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                        <style>
                                            body {
                                                color: ${theme.colors.text};
                                                font-size: 16px;
                                                padding: 12px;
                                            }
                                        </style>
                                    </head>
                                    <body>
                                        ${assignment?.instructions || 'No instructions provided'}
                                    </body>
                                </html>
                            `,
                        }}
                        style={{height: 700, backgroundColor: theme.colors.surface }} // Adjust height as needed
                    /> */}

                {/* Attachments Section */}
                {Array.isArray(assignment.attachment) &&
                    assignment.attachment.length > 0 && (
                        <>
                            <Text
                                style={[
                                    styles.sectionTitle,
                                    {color: theme.colors.text},
                                ]}>
                                Files
                            </Text>
                            <View
                                style={[
                                    styles.sectionCard,
                                    {
                                        backgroundColor:
                                            theme.colors.surfaceVariant,
                                    },
                                ]}>
                                {assignment.attachment.map((item, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.listItem}
                                        onPress={() =>
                                            handleLinkPress(item?.file_link)
                                        }>
                                        <View style={styles.listItemContent}>
                                            <Icon
                                                name={getFileIcon('pdf')}
                                                size={24}
                                                color={theme.colors.text}
                                            />
                                            <View style={styles.listItemText}>
                                                <Text
                                                    style={{
                                                        color: theme.colors
                                                            .text,
                                                    }}>
                                                    {item?.file_name || 'File'}
                                                </Text>
                                                <Text
                                                    style={{
                                                        color: theme.colors
                                                            .secondary,
                                                        fontSize: 12,
                                                    }}>
                                                    PDF file
                                                </Text>
                                            </View>
                                        </View>
                                        <Icon
                                            name="download"
                                            size={24}
                                            color={theme.colors.text}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                    )}

                {/* Links Section */}
                {Array.isArray(assignment?.links) &&
                    assignment?.links.length > 0 && (
                        <>
                            <Text
                                style={[
                                    styles.sectionTitle,
                                    {color: theme.colors.text},
                                ]}>
                                Links
                            </Text>
                            <View
                                style={[
                                    styles.sectionCard,
                                    {
                                        backgroundColor:
                                            theme.colors.surfaceVariant,
                                    },
                                ]}>
                                {assignment.links.map((item, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.listItem}
                                        onPress={() =>
                                            handleLinkPress(item?.link)
                                        }>
                                        <View style={styles.listItemContent}>
                                            <Icon
                                                name="link"
                                                size={24}
                                                color={theme.colors.text}
                                            />
                                            <Text
                                                style={{
                                                    color: theme.colors.text,
                                                }}
                                                numberOfLines={2}>
                                                {item?.link}
                                            </Text>
                                        </View>
                                        <Icon
                                            name="open-in-new"
                                            size={24}
                                            color={theme.colors.text}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                    )}

                {/* Buttons Row */}
                {/* <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                {backgroundColor: theme.colors.primary},
                            ]}
                            onPress={() =>
                                handleSubmission(
                                    assignment.slug,
                                    assignment.title,
                                    assignment.points_possible,
                                )
                            }>
                            <Icon
                                name="file-eye"
                                size={20}
                                color={theme.colors.onPrimary}
                            />
                            <Text
                                style={[
                                    styles.buttonText,
                                    {color: theme.colors.onPrimary},
                                ]}>
                                View Work
                            </Text>
                        </TouchableOpacity>

                        {assignment.status === 'draft' && (
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    {
                                        backgroundColor: 'transparent',
                                        borderColor: theme.colors.outline,
                                        borderWidth: 1,
                                    },
                                ]}>
                                <Icon
                                    name="send"
                                    size={20}
                                    color={theme.colors.text}
                                />
                                <Text
                                    style={[
                                        styles.buttonText,
                                        {color: theme.colors.text},
                                    ]}>
                                    Publish
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View> */}
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 1,
    },
    content: {
        padding: 16,
    },
    headerRow: {
        marginBottom: 12,
    },
    headerRowInner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 8,
        flexShrink: 1,
    },
    metaRow: {
        marginBottom: 12,
        marginTop: 20,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        gap: 4,
    },
    chipText: {
        fontSize: 12,
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    sectionCard: {
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    listItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    listItemText: {
        flex: 1,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
        flex: 1,
    },
    buttonText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default AssignmentItem;
