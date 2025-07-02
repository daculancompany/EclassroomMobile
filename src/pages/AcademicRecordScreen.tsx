import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {DataTable, Divider, Text, Title} from 'react-native-paper';

const GradeTableScreen = () => {
    // Sample grade data
    const gradeData = {
        firstYear: {
            firstSemester: [
                {subject: 'Mathematics', grade: 'A', credits: 4},
                {subject: 'Physics', grade: 'B+', credits: 3},
                {subject: 'Programming', grade: 'A-', credits: 3},
            ],
            secondSemester: [
                {subject: 'Chemistry', grade: 'B', credits: 3},
                {subject: 'Algorithms', grade: 'A', credits: 4},
                {subject: 'English', grade: 'A-', credits: 2},
            ],
        },
        secondYear: {
            firstSemester: [
                {subject: 'Data Structures', grade: 'A', credits: 4},
                {subject: 'Database Systems', grade: 'B+', credits: 3},
            ],
            secondSemester: [
                {subject: 'Operating Systems', grade: 'A-', credits: 3},
                {subject: 'Computer Networks', grade: 'B', credits: 3},
            ],
        },
    };

    const renderSemesterTable = (semesterData, title) => (
        <View style={styles.semesterContainer}>
            <Title style={styles.semesterTitle}>{title}</Title>
            <DataTable>
                <DataTable.Header>
                    <DataTable.Title>Subject</DataTable.Title>
                    <DataTable.Title numeric>Credits</DataTable.Title>
                    <DataTable.Title numeric>Grade</DataTable.Title>
                </DataTable.Header>

                {semesterData.map((item, index) => (
                    <DataTable.Row key={index}>
                        <DataTable.Cell>{item.subject}</DataTable.Cell>
                        <DataTable.Cell numeric>{item.credits}</DataTable.Cell>
                        <DataTable.Cell numeric>{item.grade}</DataTable.Cell>
                    </DataTable.Row>
                ))}
            </DataTable>
        </View>
    );

    return (
        <ScrollView showsVerticalScrollIndicator={false}  style={styles.container}>
            <Title style={styles.yearTitle}>First Year</Title>
            {renderSemesterTable(
                gradeData.firstYear.firstSemester,
                'First Semester',
            )}
            <Divider style={styles.divider} />
            {renderSemesterTable(
                gradeData.firstYear.secondSemester,
                'Second Semester',
            )}

            <Title style={styles.yearTitle}>Second Year</Title>
            {renderSemesterTable(
                gradeData.secondYear.firstSemester,
                'First Semester',
            )}
            <Divider style={styles.divider} />
            {renderSemesterTable(
                gradeData.secondYear.secondSemester,
                'Second Semester',
            )}
            <View style={{ minHeight: 100 }}></View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    yearTitle: {
        marginTop: 20,
        marginBottom: 10,
        fontSize: 20,
    },
    semesterContainer: {
        marginBottom: 20,
    },
    semesterTitle: {
        fontSize: 18,
        marginBottom: 8,
    },
    divider: {
        marginVertical: 16,
    },
});

export default GradeTableScreen;
