// @ts-nocheck
import React from 'react';
import {View, StyleSheet, ScrollView, Dimensions} from 'react-native';
import {DataTable, Text, useTheme, Divider} from 'react-native-paper';
import {BarChart, PieChart} from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const chartData = [
    {
        name: 'ATTENDANCE (120/150)',
        population: 10,
        color: '#4CAF50',
        legendFontColor: '#333',
        legendFontSize: 12,
    },
    {
        name: 'LAB/CASE STUDIES',
        population: 40,
        color: '#2196F3',
        legendFontColor: '#333',
        legendFontSize: 12,
    },
    {
        name: 'ASSIGNMENTS',
        population: 20,
        color: '#FFC107',
        legendFontColor: '#333',
        legendFontSize: 12,
    },
    {
        name: 'MIDTERM EXAM',
        population: 30,
        color: '#F44336',
        legendFontColor: '#333',
        legendFontSize: 12,
    },
];

const ProgressReportTab = () => {
    const theme = useTheme();

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{flexGrow: 1, paddingBottom: 40}}
            style={[
                styles.container,
                {backgroundColor: theme.colors.background},
            ]}>
            <View style={{alignItems: 'center', marginVertical: 20}}>
                <Text
                    style={[
                        styles.sectionHeader,
                        {color: theme.colors.primary},
                    ]}>
                    MIDTERM COMPONENT BREAKDOWN
                </Text>
                <PieChart
                    data={chartData}
                    width={screenWidth - 32}
                    height={220}
                    chartConfig={{
                        backgroundGradientFrom: '#fff',
                        backgroundGradientTo: '#fff',
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                />
            </View>

            {/* MIDTERM CHART */}
            <View style={{alignItems: 'center', marginBottom: 20}}>
                <Text
                    style={[
                        styles.sectionHeader,
                        {color: theme.colors.primary},
                    ]}>
                    MIDTERM PERFORMANCE CHART
                </Text>
                <BarChart
                    data={{
                        labels: [
                            'ATTENDANCE',
                            'QUIZ',
                            'LAB/CASE',
                            'ASSIGNMENTS',
                            'EXAM',
                        ],
                        datasets: [{data: [95, 88, 92, 85, 90]}],
                    }}
                    width={screenWidth - 32}
                    height={250}
                    yAxisSuffix="%"
                    chartConfig={{
                        backgroundGradientFrom: '#ffffff',
                        backgroundGradientTo: '#ffffff',
                        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                        labelColor: (opacity = 1) =>
                            `rgba(0, 0, 0, ${opacity})`,
                        propsForBackgroundLines: {
                            stroke: '#e3e3e3',
                        },
                    }}
                    verticalLabelRotation={30}
                    style={{borderRadius: 16}}
                />
            </View>

            <Text style={[styles.sectionHeader, {color: theme.colors.primary}]}>
                MIDTERM GRADES
            </Text>
            <DataTable>
                <DataTable.Header>
                    <DataTable.Title style={styles.categoryColumn}>
                        Category
                    </DataTable.Title>
                    <DataTable.Title numeric>Score</DataTable.Title>
                    <DataTable.Title numeric>Weight</DataTable.Title>
                    <DataTable.Title numeric>Total</DataTable.Title>
                </DataTable.Header>

                <DataTable.Row>
                    <DataTable.Cell style={styles.categoryCell}>
                        ATTENDANCE
                    </DataTable.Cell>
                    <DataTable.Cell numeric>95%</DataTable.Cell>
                    <DataTable.Cell numeric>10%</DataTable.Cell>
                    <DataTable.Cell numeric>9.5</DataTable.Cell>
                </DataTable.Row>

                <DataTable.Row>
                    <DataTable.Cell style={styles.categoryCell}>
                        HANDS-ON QUIZ
                    </DataTable.Cell>
                    <DataTable.Cell numeric>88%</DataTable.Cell>
                    <DataTable.Cell numeric>15%</DataTable.Cell>
                    <DataTable.Cell numeric>13.2</DataTable.Cell>
                </DataTable.Row>

                <DataTable.Row>
                    <DataTable.Cell style={styles.categoryCell}>
                        LABORATORY EXERCISES/CASE STUDIES
                    </DataTable.Cell>
                    <DataTable.Cell numeric>92%</DataTable.Cell>
                    <DataTable.Cell numeric>25%</DataTable.Cell>
                    <DataTable.Cell numeric>23.0</DataTable.Cell>
                </DataTable.Row>

                <DataTable.Row>
                    <DataTable.Cell style={styles.categoryCell}>
                        ASSIGNMENTS
                    </DataTable.Cell>
                    <DataTable.Cell numeric>85%</DataTable.Cell>
                    <DataTable.Cell numeric>15%</DataTable.Cell>
                    <DataTable.Cell numeric>12.75</DataTable.Cell>
                </DataTable.Row>

                <DataTable.Row>
                    <DataTable.Cell style={styles.categoryCell}>
                        MIDTERM EXAM
                    </DataTable.Cell>
                    <DataTable.Cell numeric>90%</DataTable.Cell>
                    <DataTable.Cell numeric>35%</DataTable.Cell>
                    <DataTable.Cell numeric>31.5</DataTable.Cell>
                </DataTable.Row>

                <DataTable.Row style={styles.totalRow}>
                    <DataTable.Cell style={styles.categoryCell}>
                        MID TERM GRADE
                    </DataTable.Cell>
                    <DataTable.Cell numeric></DataTable.Cell>
                    <DataTable.Cell numeric>100%</DataTable.Cell>
                    <DataTable.Cell numeric>89.95</DataTable.Cell>
                </DataTable.Row>
            </DataTable>

            <Divider style={styles.divider} />

            {/* FINAL CHART */}
            <View style={{alignItems: 'center', marginBottom: 20}}>
                <Text
                    style={[
                        styles.sectionHeader,
                        {color: theme.colors.primary},
                    ]}>
                    FINAL PERFORMANCE CHART
                </Text>
                <BarChart
                    data={{
                        labels: [
                            'ATTENDANCE',
                            'QUIZ',
                            'LAB/CASE',
                            'ASSIGNMENTS',
                            'EXAM',
                        ],
                        datasets: [{data: [93, 91, 94, 87, 92]}],
                    }}
                    width={screenWidth - 32}
                    height={250}
                    yAxisSuffix="%"
                    chartConfig={{
                        backgroundGradientFrom: '#ffffff',
                        backgroundGradientTo: '#ffffff',
                        color: (opacity = 1) => `rgba(0, 200, 100, ${opacity})`,
                        labelColor: (opacity = 1) =>
                            `rgba(0, 0, 0, ${opacity})`,
                        propsForBackgroundLines: {
                            stroke: '#e3e3e3',
                        },
                    }}
                    verticalLabelRotation={30}
                    style={{borderRadius: 16}}
                />
            </View>

            <Text style={[styles.sectionHeader, {color: theme.colors.primary}]}>
                FINAL TERM GRADES
            </Text>
            <DataTable>
                <DataTable.Header>
                    <DataTable.Title style={styles.categoryColumn}>
                        Category
                    </DataTable.Title>
                    <DataTable.Title numeric>Score</DataTable.Title>
                    <DataTable.Title numeric>Weight</DataTable.Title>
                    <DataTable.Title numeric>Total</DataTable.Title>
                </DataTable.Header>

                <DataTable.Row>
                    <DataTable.Cell style={styles.categoryCell}>
                        ATTENDANCE
                    </DataTable.Cell>
                    <DataTable.Cell numeric>93%</DataTable.Cell>
                    <DataTable.Cell numeric>10%</DataTable.Cell>
                    <DataTable.Cell numeric>9.3</DataTable.Cell>
                </DataTable.Row>

                <DataTable.Row>
                    <DataTable.Cell style={styles.categoryCell}>
                        HANDS-ON QUIZ
                    </DataTable.Cell>
                    <DataTable.Cell numeric>91%</DataTable.Cell>
                    <DataTable.Cell numeric>15%</DataTable.Cell>
                    <DataTable.Cell numeric>13.65</DataTable.Cell>
                </DataTable.Row>

                <DataTable.Row>
                    <DataTable.Cell style={styles.categoryCell}>
                        LABORATORY EXERCISES/CASE STUDIES
                    </DataTable.Cell>
                    <DataTable.Cell numeric>94%</DataTable.Cell>
                    <DataTable.Cell numeric>25%</DataTable.Cell>
                    <DataTable.Cell numeric>23.5</DataTable.Cell>
                </DataTable.Row>

                <DataTable.Row>
                    <DataTable.Cell style={styles.categoryCell}>
                        ASSIGNMENTS
                    </DataTable.Cell>
                    <DataTable.Cell numeric>87%</DataTable.Cell>
                    <DataTable.Cell numeric>15%</DataTable.Cell>
                    <DataTable.Cell numeric>13.05</DataTable.Cell>
                </DataTable.Row>

                <DataTable.Row>
                    <DataTable.Cell style={styles.categoryCell}>
                        FINAL EXAM
                    </DataTable.Cell>
                    <DataTable.Cell numeric>92%</DataTable.Cell>
                    <DataTable.Cell numeric>35%</DataTable.Cell>
                    <DataTable.Cell numeric>32.2</DataTable.Cell>
                </DataTable.Row>

                <DataTable.Row style={styles.totalRow}>
                    <DataTable.Cell style={styles.categoryCell}>
                        FINAL TERM GRADE
                    </DataTable.Cell>
                    <DataTable.Cell numeric></DataTable.Cell>
                    <DataTable.Cell numeric>100%</DataTable.Cell>
                    <DataTable.Cell numeric>91.7</DataTable.Cell>
                </DataTable.Row>

                <DataTable.Row
                    style={[
                        styles.finalRatingRow,
                        {backgroundColor: theme.colors.surfaceVariant},
                    ]}>
                    <DataTable.Cell style={styles.categoryCell}>
                        FINAL RATING
                    </DataTable.Cell>
                    <DataTable.Cell numeric></DataTable.Cell>
                    <DataTable.Cell numeric></DataTable.Cell>
                    <DataTable.Cell numeric style={{fontWeight: 'bold'}}>
                        90.83
                    </DataTable.Cell>
                </DataTable.Row>
            </DataTable>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 15,
        textAlign: 'center',
    },
    categoryColumn: {
        flex: 2,
    },
    categoryCell: {
        flex: 2,
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    finalRatingRow: {
        borderTopWidth: 2,
        borderTopColor: '#000',
    },
    divider: {
        marginVertical: 20,
        height: 2,
    },
});

export default ProgressReportTab;
