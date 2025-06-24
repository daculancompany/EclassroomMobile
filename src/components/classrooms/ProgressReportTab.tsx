// @ts-nocheck
import React, {useState} from 'react';
import {
    View,
    Dimensions,
    StyleSheet,
    ScrollView,
    RefreshControl,
} from 'react-native';
import Svg, {G, Path, Text as SvgText} from 'react-native-svg';
import {pie as d3Pie, arc as d3Arc} from 'd3-shape';
import {
    Modal,
    Portal,
    Text,
    Button,
    PaperProvider,
    useTheme,
    DataTable,
    Divider,
} from 'react-native-paper';
import useClassRoomSettings from '../../hooks/useClassRoomSettings';
import useGradeSheet from '../../hooks/useGradeSheet';
import {useRoute} from '@react-navigation/native';
import BottomSheet from '../BottomSheet';
import {useGlobalStyles} from '../../styles/globalStyles';

const {width} = Dimensions.get('window');
const size = width - 40;
const radius = size / 2;
const centerX = size / 2;
const centerY = size / 2;

// Chart data

const CustomPieChart = () => {
    const globalStyle = useGlobalStyles();
    const theme = useTheme();
    const route = useRoute();
    const {class_id} = route.params || {};
    const {
        isLoading,
        data: classroom,
        refetch: refetchSettings,
    } = useClassRoomSettings(class_id);
    const {
        data: sheet,
        isFetching: fetchingSheet,
        refetch: refetchSheet,
    } = useGradeSheet(class_id);

    console.log('sheet --->', sheet);
    const initialData = [
        {
            label: 'QUIZ/ATENDANCE',
            value: 30,
            display: '0/0',
            color: '#4CAF50',
        },
        {label: 'LAB', value: 25, display: '0/0', color: '#2196F3'},
        {label: 'ASSIGNMENTS', value: 14, display: '0/0', color: '#FFC107'},
        {label: 'MIDTERM EXAM', value: 30, display: '0/0', color: '#F44336'},
    ];



    const [data, setData] = useState(initialData);

    const attendances = sheet?.attendances || [];
    const fattendances = sheet?.fattendances || [];
    const distinctDates = [
        ...new Set(attendances.map(att => att.date_time.split(' ')[0])),
    ];
    const fdistinctDates = [
        ...new Set(fattendances.map(att => att.date_time.split(' ')[0])),
    ];
    const studentList = sheet?.students || [];
    const quizes = sheet?.quizes || [];
    const fquizes = sheet?.fquizes || [];
    const exercises = sheet?.exercises || [];
    const fexercises = sheet?.fexercises || [];
    const assignments = sheet?.assignments || [];
    const fassignments = sheet?.fassignments || [];
    const midterm = sheet?.midterm || [];
    const finalExam = sheet?.final || [];
    const midtermCount = sheet?.midterm_count || 0;
    const finalCount = sheet?.final_count || 0;

    const [selectedSlice, setSelectedSlice] = useState(null);
    const [visible, setVisible] = useState(false);

    // Create pie generator function
    const pieGenerator = d3Pie().value(d => d.value);
    const pieData = pieGenerator(data);

    // Create arc generator for the main slice
    const arcGenerator = d3Arc().outerRadius(radius).innerRadius(60);

    // Create arc generator for the border (slightly larger outer radius)
    const borderArcGenerator = d3Arc()
        .outerRadius(radius + 2) // 2 pixels larger than main slice
        .innerRadius(60);

    const handleSlicePress = index => {
        setSelectedSlice(index);
        console.log(data[index]);
        if (index === 0) {
            console.log(sheet?.attendances);
            console.log(sheet?.exercises);
        }
        setVisible(true);
        // setTimeout(() => {
        //     setVisible(true);
        // }, 200);
    };

    const hideModal = () => {
        setVisible(false);
        setSelectedSlice(null);
    };

    function percentageToGrade(percentage) {
        if (percentage >= 100) return 1.0;
        else if (percentage >= 50) {
            return 1.0 + -0.04 * (percentage - 100);
        } else if (percentage >= 0) {
            return 3.0 + -0.04 * (percentage - 50);
        } else {
            return 5.0;
        }
    }

    function calculateFinalGrade(components) {
        const WEIGHTS = {
            MIDTERM: 0.3,
            ATTENDANCE: 0.3,
            LABORATORY: 0.25,
            ASSIGNMENT: 0.14,
        };

        const totalWeight = Object.values(WEIGHTS).reduce(
            (sum, w) => sum + w,
            0,
        );

        const componentResults = components.map(comp => {
            const percentage = (comp.earned / comp.total) * 100;

            let unweightedGrade = percentageToGrade(percentage);

            unweightedGrade = Math.round(unweightedGrade * 10) / 10;

            const weight = WEIGHTS[comp.componentType];
            const weightedGrade = unweightedGrade * weight;

            return {
                componentType: comp.componentType,
                earned: comp.earned,
                total: comp.total,
                percentage: Math.round(percentage * 10) / 10,
                unweightedGrade,
                weight,
                weightedGrade: Math.round(weightedGrade * 10) / 10,
            };
        });

        const totalWeighted = componentResults.reduce(
            (sum, comp) => sum + comp.weightedGrade,
            0,
        );
        return {
            finalGrade: parseFloat(totalWeighted.toFixed(1)),
            components: componentResults,
            gradingScale: '1.0–5.0 (1.0 highest, 5.0 lowest)',
            totalWeight: parseFloat(totalWeight.toFixed(1)),
        };
    }

    const generateStudentData = () => {
        const students = [];

        for (let i = 0; i < studentList.length; i++) {
            const student = studentList[i];

            // For each date, check if student has attendance (10 = present, 0 = absent)
            const attendanceScores = distinctDates.map(date => {
                const attendancesOnDate = attendances.filter(att =>
                    att.date_time.startsWith(date),
                );
                return attendancesOnDate.length
                    ? classroom?.attendance_points
                    : 0;
            });
            // Calculate maximum possible points
            const maxAttendancePoints =
                distinctDates.length * classroom?.attendance_points;
            const maxQuizPoints = quizes.reduce(
                (sum, quiz) => sum + (quiz?.points_possible || 0),
                0,
            );

            const maxExercisesPoints = (() => {
                const calculated = exercises.reduce(
                    (sum, quiz) => sum + (quiz?.points_possible || 0),
                    0,
                );
                return calculated === 0 ? 100 : calculated;
            })();

            const totalExercisesPoints = exercises.reduce((sum, item) => {
                return (
                    sum +
                    (item.scores?.reduce(
                        (scoreSum, score) => scoreSum + (score?.score || 0),
                        0,
                    ) || 0)
                );
            }, 0);

            const maxAssignmentPoints =
                assignments.reduce(
                    (sum, quiz) => sum + (quiz?.points_possible || 0),
                    0,
                ) || 100;

            const totalAssigmentPoints = assignments.reduce((sum, item) => {
                const allScoresSum =
                    item.scores?.reduce(
                        (scoreSum, score) => scoreSum + (score?.score || 0),
                        0,
                    ) || 0;
                return sum + allScoresSum;
            }, 0);
            const maxMidtermPoints =
                midterm.reduce(
                    (sum, quiz) => sum + (quiz?.points_possible || 0),
                    0,
                ) || 100;

            const totalMidtermPoints = midterm.reduce((sum, item) => {
                const allScoresSum =
                    item.scores?.reduce(
                        (scoreSum, score) => scoreSum + (score?.score || 0),
                        0,
                    ) || 0;
                return sum + allScoresSum;
            }, 0);

            const totalMidtermAttendance =
                parseFloat(maxAttendancePoints) + parseFloat(maxQuizPoints) ||
                100;

            // Calculate total scores
            const totalAttendanceScores = attendanceScores.reduce(
                (sum, score) => sum + score,
                0,
            );

            const totalQuizPoints = quizes.reduce((sum, quiz) => {
                const allScoresSum =
                    quiz.scores?.reduce(
                        (scoreSum, score) => scoreSum + (score?.score || 0),
                        0,
                    ) || 0;
                return sum + allScoresSum;
            }, 0);

            const totalMidtermQuizPoints = parseFloat(
                totalAttendanceScores + totalQuizPoints,
            );

            const result = calculateFinalGrade([
                {
                    componentType: 'ATTENDANCE',
                    earned:
                        distinctDates.length === 0 && quizes.length === 0
                            ? totalMidtermAttendance
                            : totalMidtermQuizPoints,
                    total: totalMidtermAttendance,
                },
                {
                    componentType: 'LABORATORY',
                    earned:
                        exercises.length === 0
                            ? maxExercisesPoints
                            : totalExercisesPoints,
                    total: maxExercisesPoints,
                },
                {
                    componentType: 'ASSIGNMENT',
                    earned:
                        assignments.length === 0
                            ? maxAssignmentPoints
                            : totalAssigmentPoints,
                    total: maxAssignmentPoints,
                },
                {
                    componentType: 'MIDTERM',
                    earned:
                        midterm.length === 0
                            ? maxMidtermPoints
                            : totalMidtermPoints,
                    total: maxMidtermPoints,
                },
            ]);

            // final

            const fattendanceScores = fdistinctDates.map(date => {
                const hasAttendance = fattendances.some(
                    att => att.date_time.startsWith(date), // Removed student_id check
                );
                return hasAttendance ? classroom?.attendance_points : 0;
            });

            const ftotalAttendanceScores = fattendanceScores.reduce(
                (sum, score) => sum + score,
                0,
            );

            // For quizzes
            const ftotalQuizPoints = fquizes.reduce((sum, quiz) => {
                const allScores =
                    quiz.scores?.reduce(
                        (scoreSum, score) => scoreSum + (score?.score || 0),
                        0,
                    ) || 0;
                return sum + allScores;
            }, 0);

            // For exercises
            const ftotalExercisesPoints = fexercises.reduce((sum, item) => {
                const allScores =
                    item.scores?.reduce(
                        (scoreSum, score) => scoreSum + (score?.score || 0),
                        0,
                    ) || 0;
                return sum + allScores;
            }, 0);

            // For assignments
            const ftotalAssigmentPoints = fassignments.reduce((sum, item) => {
                const allScores =
                    item.scores?.reduce(
                        (scoreSum, score) => scoreSum + (score?.score || 0),
                        0,
                    ) || 0;
                return sum + allScores;
            }, 0);

            const fmaxAssigmentPoints =
                fassignments.reduce(
                    (sum, quiz) => sum + (quiz?.points_possible || 0),
                    0,
                ) || 100;

            const totalFinalPoints = finalExam.reduce((sum, item) => {
                const allScores =
                    item.scores?.reduce(
                        (scoreSum, score) => scoreSum + (score?.score || 0),
                        0,
                    ) || 0;
                return sum + allScores;
            }, 0);

            const maxFinalPoints =
                finalExam.reduce(
                    (sum, quiz) => sum + (quiz?.points_possible || 0),
                    0,
                ) || 100;

            const fmaxAttendancePoints =
                fdistinctDates.length * classroom?.attendance_points;
            const fmaxQuizPoints = fquizes.reduce(
                (sum, quiz) => sum + (quiz?.points_possible || 0),
                0,
            );

            const fmaxExercisesPoints =
                fexercises.reduce(
                    (sum, quiz) => sum + (quiz?.points_possible || 0),
                    0,
                ) || 100;

            // end final

            const tAttendance = ftotalAttendanceScores + ftotalQuizPoints;
            const tAttendancePoints =
                fmaxAttendancePoints + fmaxQuizPoints || 100;
            const fresult = calculateFinalGrade([
                {
                    componentType: 'ATTENDANCE',
                    earned:
                        fdistinctDates.length + fquizes.length === 0
                            ? tAttendancePoints
                            : tAttendance,
                    total: tAttendancePoints,
                },
                {
                    componentType: 'LABORATORY',
                    earned:
                        fexercises.length === 0
                            ? fmaxExercisesPoints
                            : ftotalExercisesPoints,
                    total: fmaxExercisesPoints,
                },
                {
                    componentType: 'ASSIGNMENT',
                    earned:
                        fassignments.length === 0
                            ? fmaxAssigmentPoints
                            : ftotalAssigmentPoints,
                    total: fmaxAssigmentPoints,
                },
                {
                    componentType: 'MIDTERM',
                    earned:
                        finalExam.length === 0
                            ? maxFinalPoints
                            : totalFinalPoints,
                    total: maxFinalPoints,
                },
            ]);

            let finalRating = (result.finalGrade + fresult.finalGrade) / 2;
            students.push({
                key: i.toString(),
                sid: student.student?.id,
                studentId: `S${1000 + i}`,
                studentName: `${student.student?.lname}, ${student.student?.fname}`,
                attendanceScores: attendanceScores,
                totalAttendance: totalAttendanceScores + totalQuizPoints,
                totalExercises: totalExercisesPoints,
                totalAssigments: totalAssigmentPoints,
                midterm: totalMidtermPoints,
                midtermGrade: midtermCount === 0 ? '-' : result.finalGrade,
                fattendanceScores: fattendanceScores,
                ftotalAttendance: ftotalAttendanceScores + ftotalQuizPoints,
                ftotalExercises: ftotalExercisesPoints,
                ftotalAssigments: ftotalAssigmentPoints,
                final: totalFinalPoints,
                finalGrade:
                    midtermCount === 0 || finalCount === 0
                        ? '-'
                        : fresult.finalGrade,
                finalRating:
                    midtermCount === 0 || finalCount === 0
                        ? '-'
                        : finalRating.toFixed(1),
            });
        }

        return students;
    };

    const dataSet = generateStudentData();

    const midtermGrade = dataSet?.[0]?.midtermGrade ?? '-';

    const totalScoreAttendanceQuiz = (() => {
        const totalQuizPoints =
            quizes?.reduce(
                (sum, quiz) => sum + (quiz?.points_possible || 0),
                0,
            ) || 0;

        const attendancePointsPerDay = classroom?.attendance_points || 0;
        const totalAttendancePoints =
            (distinctDates?.length || 0) * attendancePointsPerDay;

        return totalAttendancePoints + totalQuizPoints;
    })();
    const totalAttendance = dataSet?.[0]?.totalAttendance ?? '-';

    const totalExercises = dataSet?.[0]?.totalExercises ?? '-';
    const totalExercisePoints =
        exercises?.reduce(
            (sum, exercise) => sum + (exercise?.points_possible || 0),
            0,
        ) || 0;

    const totalAssigments = dataSet?.[0]?.totalAssigments ?? '-';
    const totalAssignmentPoints =
        assignments?.reduce(
            (sum, assignment) => sum + (assignment?.points_possible || 0),
            0,
        ) || 0;

    const maxMidtermPoints =
        midterm.reduce((sum, quiz) => sum + (quiz?.points_possible || 0), 0) ||
        100;

    const totalMidtermPoints = midterm.reduce((sum, item) => {
        return (
            sum +
            (item.scores?.reduce(
                (scoreSum, score) => scoreSum + (score?.score || 0),
                0,
            ) || 0)
        );
    }, 0);

    const getChartValue = value => {
        if (value === 'QUIZ/ATENDANCE') {
            return `${totalAttendance}/${totalScoreAttendanceQuiz}`;
        }
        if (value === 'LAB') {
            return `${totalExercises}/${totalExercisePoints}`;
        }
        if (value === 'ASSIGNMENTS') {
            return `${totalAssigments}/${totalAssignmentPoints}`;
        }
        if (value === 'MIDTERM EXAM') {
            return `${totalMidtermPoints}/${maxMidtermPoints}`;
        }
        return '';
    };

    const getChartValueFinal = value => {
        if (value === 'QUIZ/ATENDANCE') {
            return `${totalAttendance}/${totalScoreAttendanceQuiz}`;
        }
        if (value === 'LAB') {
            return `${totalExercises}/${totalExercisePoints}`;
        }
        if (value === 'ASSIGNMENTS') {
            return `${totalAssigments}/${totalAssignmentPoints}`;
        }
        if (value === 'MIDTERM EXAM') {
            return `${totalMidtermPoints}/${maxMidtermPoints}`;
        }
        return '';
    };

    let modalDAta = null;

    if (selectedSlice === 0) {
        const attendances = sheet?.attendances || [];
        const quizes = sheet?.quizesZ || [];
        modalDAta = (
            <>
                <Text style={[globalStyle.textCenter, globalStyle.textPrimary]}>
                    ATTENDANCE
                </Text>
                <DataTable>
                    <DataTable.Header>
                        <DataTable.Title style={styles.categoryColumn}>
                            Title
                        </DataTable.Title>
                        <DataTable.Title numeric>Score</DataTable.Title>
                    </DataTable.Header>

                    {attendances.map((attendance, index) => (
                        <DataTable.Row key={index}>
                            <DataTable.Cell style={styles.categoryCell}>
                                {attendance.date_time}
                            </DataTable.Cell>
                            <DataTable.Cell>{attendance.status}</DataTable.Cell>
                        </DataTable.Row>
                    ))}
                </DataTable>
                <View style={{marginVertical: 20}} />
                <Text style={[globalStyle.textCenter, globalStyle.textPrimary]}>
                    HANDS-ON QUIZ
                </Text>
                <DataTable>
                    <DataTable.Header>
                        <DataTable.Title style={styles.categoryColumn}>
                            Title
                        </DataTable.Title>
                        <DataTable.Title numeric>Score</DataTable.Title>
                    </DataTable.Header>
                    <DataTable.Row>
                        <DataTable.Cell style={styles.categoryCell}>
                            ATTENDANCE
                        </DataTable.Cell>
                        <DataTable.Cell numeric>93/100</DataTable.Cell>
                    </DataTable.Row>
                </DataTable>
            </>
        );
    }

    return (
        <>
            <BottomSheet
                heightPercentage={0.8}
                visible={visible}
                isScroll={true}
                onDismiss={() => {
                    setVisible(false);
                }}>
                {modalDAta}
            </BottomSheet>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{padding: 20}}
                refreshControl={
                    <RefreshControl
                        refreshing={fetchingSheet}
                        onRefresh={() => {
                            refetchSheet();
                            refetchSettings();
                        }}
                    />
                }>
                <View style={styles.container}>
                    <Text style={{marginBottom: 10}}>Midterm</Text>
                    <Svg width={size} height={size}>
                        <G x={centerX} y={centerY}>
                            {pieData.map((slice, index) => {
                                const {color, display, label} = data[index];
                                const path = arcGenerator(slice);
                                const borderPath = borderArcGenerator(slice);
                                const [labelX, labelY] =
                                    arcGenerator.centroid(slice);

                                return (
                                    <G key={`slice-${index}`}>
                                        {/* Border path (behind the main slice) */}
                                        <Path
                                            d={borderPath}
                                            fill="none"
                                            // stroke="#000" // Black border color
                                            //  strokeWidth={1} // Border width
                                        />

                                        {/* Main slice */}
                                        <Path
                                            d={path}
                                            fill={color}
                                            opacity={
                                                selectedSlice === index
                                                    ? 0.7
                                                    : 1.0
                                            }
                                            onPress={() =>
                                                handleSlicePress(index)
                                            }
                                            // stroke="#000"
                                            // strokeWidth={1}
                                        />

                                        <SvgText
                                            x={labelX}
                                            y={labelY - 10}
                                            fill="white"
                                            fontSize="10"
                                            fontWeight="bold"
                                            textAnchor="middle">
                                            {label}
                                        </SvgText>

                                        <SvgText
                                            x={labelX}
                                            y={labelY + 8}
                                            fill="white"
                                            fontSize="12"
                                            fontWeight="bold"
                                            textAnchor="middle">
                                            {getChartValue(label)}
                                        </SvgText>
                                    </G>
                                );
                            })}

                            {/* Centered text */}
                            <G>
                                {/* <SvgText
                                x={0}
                                y={-10}
                                fill="black"
                                fontSize="16"
                                fontWeight="bold"
                                textAnchor="middle">
                                GRADE
                            </SvgText> */}
                                <SvgText
                                    x={0}
                                    y={0}
                                    fill={theme.colors.primary}
                                    fontSize="32"
                                    fontWeight="bold"
                                    textAnchor="middle">
                                    {midtermGrade}
                                </SvgText>
                                <SvgText
                                    x={0}
                                    y={20}
                                    fill="#666"
                                    fontSize="12"
                                    textAnchor="middle">
                                    MID TERM GRADE
                                </SvgText>
                            </G>
                        </G>
                    </Svg>
                    {classroom?.term === 'final' && (
                        <>
                            <Text style={{marginBottom: 10, marginTop: 40}}>
                                FINAL
                            </Text>
                            <Svg width={size} height={size}>
                                <G x={centerX} y={centerY}>
                                    {pieData.map((slice, index) => {
                                        const {color, display, label} =
                                            data[index];
                                        const path = arcGenerator(slice);
                                        const borderPath =
                                            borderArcGenerator(slice);
                                        const [labelX, labelY] =
                                            arcGenerator.centroid(slice);

                                        return (
                                            <G key={`slice-${index}`}>
                                                {/* Border path (behind the main slice) */}
                                                <Path
                                                    d={borderPath}
                                                    fill="none"
                                                    // stroke="#000" // Black border color
                                                    //  strokeWidth={1} // Border width
                                                />

                                                {/* Main slice */}
                                                <Path
                                                    d={path}
                                                    fill={color}
                                                    opacity={
                                                        selectedSlice === index
                                                            ? 0.7
                                                            : 1.0
                                                    }
                                                    onPress={() =>
                                                        handleSlicePress(index)
                                                    }
                                                    // stroke="#000"
                                                    // strokeWidth={1}
                                                />

                                                <SvgText
                                                    x={labelX}
                                                    y={labelY - 10}
                                                    fill="white"
                                                    fontSize="10"
                                                    fontWeight="bold"
                                                    textAnchor="middle">
                                                    {label}
                                                </SvgText>

                                                <SvgText
                                                    x={labelX}
                                                    y={labelY + 8}
                                                    fill="white"
                                                    fontSize="12"
                                                    fontWeight="bold"
                                                    textAnchor="middle">
                                                    {getChartValueFinal(label)}
                                                </SvgText>
                                            </G>
                                        );
                                    })}

                                    {/* Centered text */}
                                    <G>
                                        {/* <SvgText
                                x={0}
                                y={-10}
                                fill="black"
                                fontSize="16"
                                fontWeight="bold"
                                textAnchor="middle">
                                GRADE
                            </SvgText> */}
                                        <SvgText
                                            x={0}
                                            y={0}
                                            fill={theme.colors.primary}
                                            fontSize="32"
                                            fontWeight="bold"
                                            textAnchor="middle">
                                            {midtermGrade}
                                        </SvgText>
                                        <SvgText
                                            x={0}
                                            y={20}
                                            fill="#666"
                                            fontSize="12"
                                            textAnchor="middle">
                                            FINAL GRADE
                                        </SvgText>
                                    </G>
                                </G>
                            </Svg>
                        </>
                    )}
                </View>
            </ScrollView>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: 20,
    },
    modalContainer: {
        padding: 10,
        margin: 10,
        borderRadius: 8,
    },
    modalContent: {
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 5,
    },
    modalButton: {
        marginTop: 15,
        width: '100%',
    },
});

export default CustomPieChart;
