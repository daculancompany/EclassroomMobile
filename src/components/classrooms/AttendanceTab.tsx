// @ts-nocheck
import React, {useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {
    DataTable,
    List,
    Text,
    Card,
    Title,
    RadioButton,
    Button,
    useTheme,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useClassroomAttendance from '../../hooks/useClassroomAttendance';
import {useRoute} from '@react-navigation/native';
import {formatDate} from '../../utils/helper';
import {useGlobalStyles} from '../../styles/globalStyles';

const AttendanceTab = () => {
    const globalStyle = useGlobalStyles();
    const theme = useTheme();
    const route = useRoute();
    const {class_id} = route.params || {};
    const {data: attendance = [], isFetching} =
        useClassroomAttendance(class_id);

    const [termFilter, setTermFilter] = useState('all');
    // Initialize attendances as empty array if undefined
    // Safe data handling
    const attendances = Array.isArray(attendance?.attendances)
        ? attendance.attendances
        : [];
    const attendanceDates = Array.isArray(attendance?.attendance_dates)
        ? attendance.attendance_dates
        : [];

    // Filter function
    const filteredAttendances = attendances.filter(att => {
        if (termFilter === 'all') return true;
        return att?.term?.toLowerCase() === termFilter.toLowerCase();
    });

    // // Filter attendances based on termFilter
    // const filteredAttendances = attendances.filter(att => {
    //     if (termFilter === 'all') return true;
    //     return att?.term?.toLowerCase() === termFilter.toLowerCase();
    // });

    // Calculate summary based on filtered data
    const presentCount = filteredAttendances.filter(
        a => a.status === 'present',
    ).length;
    const absentCount = filteredAttendances.filter(
        a => a.status === 'absent',
    ).length;
    const lateCount = filteredAttendances.filter(
        a => a.status === 'late',
    ).length;
    const totalDays = filteredAttendances.length;

    const getStatusIcon = status => {
        switch (status) {
            case 'present':
                return <Icon name="check-circle" size={20} color="#4CAF50" />;
            case 'absent':
                return <Icon name="close-circle" size={20} color="#F44336" />;
            case 'late':
                return <Icon name="clock-alert" size={20} color="#FF9800" />;
            default:
                return null;
        }
    };

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={true}
            bouncesZoom={true}
            keyboardShouldPersistTaps="handled"
            style={globalStyle.container}
            contentContainerStyle={styles.scrollContent}>
            {/* Header Card */}
            <Card
                style={[styles.card, {backgroundColor: theme.colors.success}]}>
                <List.Item
                    title="Today's Attendance"
                    description="Recorded at 9:45 AM"
                    left={props => <List.Icon {...props} icon="clock" />}
                />
            </Card>
            <View style={styles.filterContainer}>
                <RadioButton.Group
                    value={termFilter}
                    onValueChange={value => setTermFilter(value)} // Immediate filter update
                >
                    <View style={styles.radioRow}>
                        <RadioButton.Item label="All" value="all" />
                        <RadioButton.Item label="Midterm" value="midterm" />
                        <RadioButton.Item label="Final" value="final" />
                    </View>
                </RadioButton.Group>
            </View>

            {/* Summary Section */}
            <Card style={[styles.card, styles.summaryCard]}>
                <Title style={styles.summaryTitle}>Attendance Summary</Title>
                <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                        <Text
                            style={[styles.summaryNumber, styles.presentText]}>
                            {presentCount}
                        </Text>
                        <Text style={styles.summaryLabel}>Present</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={[styles.summaryNumber, styles.absentText]}>
                            {absentCount}
                        </Text>
                        <Text style={styles.summaryLabel}>Absent</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={[styles.summaryNumber, styles.lateText]}>
                            {lateCount}
                        </Text>
                        <Text style={styles.summaryLabel}>Late</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryNumber}>{totalDays}</Text>
                        <Text style={styles.summaryLabel}>Total</Text>
                    </View>
                </View>
            </Card>
            {/* Attendance Table */}
            <DataTable style={styles.table}>
                <DataTable.Header>
                    <DataTable.Title>Date & Time</DataTable.Title>
                    <DataTable.Title>Status</DataTable.Title>
                </DataTable.Header>

                {filteredAttendances.map((record, index) => (
                    <DataTable.Row key={index}>
                        <DataTable.Cell style={styles.dateTime}>
                            {formatDate(record.date_time, true)}
                        </DataTable.Cell>
                        <DataTable.Cell style={styles[`${record.status}Cell`]}>
                            <View style={styles.statusContainer}>
                                {getStatusIcon(record.status)}
                                <Text style={styles.statusText}>
                                    {record.status.charAt(0).toUpperCase() +
                                        record.status.slice(1)}
                                    {record.time ? ` (${record.time})` : ''}
                                </Text>
                            </View>
                        </DataTable.Cell>
                    </DataTable.Row>
                ))}

                {/* {attendanceDates.map((record, index) => (
                    <DataTable.Row key={index}>
                        <DataTable.Cell>  {formatDate(record)}</DataTable.Cell>
                        <DataTable.Cell>
                            12-04-2024
                        </DataTable.Cell>
                    </DataTable.Row>
                ))} */}
            </DataTable>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: 32, // Add some bottom padding
        flexGrow: 1, // This makes the content expand properly
    },
    card: {
        marginBottom: 16,
        borderRadius: 8,
    },
    summaryCard: {
        padding: 16,
    },
    summaryTitle: {
        fontSize: 16,
        marginBottom: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryNumber: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    summaryLabel: {
        fontSize: 12,
        color: '#666',
    },
    presentText: {
        color: '#4CAF50',
    },
    absentText: {
        color: '#F44336',
    },
    lateText: {
        color: '#FF9800',
    },
    table: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        overflow: 'hidden',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        textAlign: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    statusText: {
        marginLeft: 8,
    },
    presentCell: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    absentCell: {
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
    },
    lateCell: {
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    radioRow: {
        flexDirection: 'row',
    },
    filterButton: {
        marginLeft: 16,
        borderRadius: 4,
    },
    dateTime: {
        textAlign: 'left',
    },
});

export default AttendanceTab;
