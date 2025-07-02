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
import useStatusIcon from '../../hooks/useStatusIcon';
import {formatDate} from '../../utils/helper';

const {width} = Dimensions.get('window');
const size = width - 40;
const radius = size / 2;
const centerX = size / 2;
const centerY = size / 2;

const StatusIcon = React.memo(({status}) => {
    const icon = useStatusIcon(status);
    return icon;
});

const AttendanceRow = ({record}) => {
    const globalStyle = useGlobalStyles();
    return (
        <DataTable.Row>
            <DataTable.Cell style={styles.dateTime}>
                {formatDate(record.date_time, true)}
            </DataTable.Cell>
            <DataTable.Cell style={globalStyle[`${record.status}Cell`]}>
                <View style={globalStyle.statusContainer}>
                    <StatusIcon status={record.status} />
                    <Text style={globalStyle.statusText}>
                        {record.status.charAt(0).toUpperCase() +
                            record.status.slice(1)}
                        {record.time ? ` (${record.time})` : ''}
                    </Text>
                </View>
            </DataTable.Cell>
        </DataTable.Row>
    );
};

const AttendanceTable = ({attendances}) => {
    const globalStyle = useGlobalStyles();
    return (
        <>
            <Text style={[globalStyle.textCenter, globalStyle.textPrimary]}>
                ATTENDANCE
            </Text>
            <DataTable>
                <DataTable.Header>
                    <DataTable.Title>Date & Time</DataTable.Title>
                    <DataTable.Title>Status</DataTable.Title>
                </DataTable.Header>
                {attendances.map((record, index) => (
                    <AttendanceRow key={index} record={record} />
                ))}
            </DataTable>
        </>
    );
};

const OtherTable = ({title, quizes}) => {
    const globalStyle = useGlobalStyles();
    return (
        <>
            <View style={{marginVertical: 20}} />
            <Text style={[globalStyle.textCenter, globalStyle.textPrimary]}>
                {title}
            </Text>
            <DataTable>
                <DataTable.Header>
                    <DataTable.Title>Title</DataTable.Title>
                    <DataTable.Title
                        style={{maxWidth: 80, justifyContent: 'center'}}>
                        Score
                    </DataTable.Title>
                </DataTable.Header>
                {quizes.map((record, index) => (
                    <DataTable.Row key={index}>
                        <DataTable.Cell>
                            <Text>{record?.title}</Text>
                        </DataTable.Cell>
                        <DataTable.Cell
                            style={{maxWidth: 80, justifyContent: 'center'}}>
                            <Text style={globalStyle.textCenter}>
                                {record?.scores[0]?.score || 0}/
                                {record?.points_possible}
                            </Text>
                        </DataTable.Cell>
                    </DataTable.Row>
                ))}
            </DataTable>
        </>
    );
};

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

const initialData2 = [
    {
        label: 'QUIZ/ATENDANCE',
        value: 30,
        display: '0/0',
        color: '#4CAF50',
    },
    {label: 'LAB', value: 25, display: '0/0', color: '#2196F3'},
    {label: 'ASSIGNMENTS', value: 14, display: '0/0', color: '#FFC107'},
    {label: 'FINAL EXAM/PROJECT', value: 30, display: '0/0', color: '#F44336'},
];

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

    const [data, setData] = useState(initialData);
    const [data2, setData2] = useState(initialData2);

    const attendances = Array.isArray(sheet?.attendances)
        ? sheet?.attendances
        : [];
    const fattendances = Array.isArray(sheet?.fattendances)
        ? sheet?.fattendances
        : [];
    const distinctDates = [
        ...new Set(attendances.map(att => att.date_time.split(' ')[0])),
    ];
    const fdistinctDates = [
        ...new Set(fattendances.map(att => att.date_time.split(' ')[0])),
    ];

    const studentList = sheet?.students ?? [];
    const quizes = sheet?.quizes ?? [];
    const fquizes = sheet?.fquizes ?? [];
    const exercises = sheet?.exercises ?? [];
    const fexercises = sheet?.fexercises ?? [];
    const assignments = sheet?.assignments ?? [];
    const fassignments = sheet?.fassignments ?? [];
    const midterm = sheet?.midterm ?? [];
    const finalExam = sheet?.final ?? [];
    const midtermCount = sheet?.midterm_count || 0;
    const finalCount = sheet?.final_count || 0;

    const [selectedSlice, setSelectedSlice] = useState(null);
    const [selectedSlice2, setSelectedSlice2] = useState(null);
    const [visible, setVisible] = useState(false);

    // Create pie generator function
    const pieGenerator = d3Pie().value(d => d.value);
    const pieData = pieGenerator(data);
    const pieData2 = pieGenerator(data2);

    // Create arc generator for the main slice
    const arcGenerator = d3Arc().outerRadius(radius).innerRadius(60);

    // Create arc generator for the border (slightly larger outer radius)
    const borderArcGenerator = d3Arc()
        .outerRadius(radius + 2) // 2 pixels larger than main slice
        .innerRadius(60);

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

    // Constants for better readability
    const GRADE_COMPONENTS = {
        ATTENDANCE: 'ATTENDANCE',
        LABORATORY: 'LABORATORY',
        ASSIGNMENT: 'ASSIGNMENT',
        MIDTERM: 'MIDTERM',
    };

    // Weight configuration (now more explicit)
    const WEIGHTS = {
        MIXED_SCORE: 0.7, // 70% of final grade
        MIDTERM: 0.3, // 30% of final grade
    };

    const MIXED_SCORE_WEIGHTS = {
        ATTENDANCE: 0.4, // 40% of mixed score
        LABORATORY: 0.4, // 40% of mixed score
        ASSIGNMENT: 0.2, // 20% of mixed score
    };

    function calculateFinalGrade(components) {
        // Calculate mixed score components
        const mixedScore =
            components.reduce((sum, comp) => {
                if (!MIXED_SCORE_WEIGHTS[comp.componentType]) return sum;

                const percentage = (comp.earned / comp.total) * 100;
                const grade = percentageToGrade(percentage);
                return sum + grade * MIXED_SCORE_WEIGHTS[comp.componentType];
            }, 0) * WEIGHTS.MIXED_SCORE;

        // Calculate midterm score
        const midtermComponent = components.find(
            c => c.componentType === GRADE_COMPONENTS.MIDTERM,
        );
        const midtermPercentage =
            (midtermComponent.earned / midtermComponent.total) * 100;
        const midtermGrade =
            percentageToGrade(midtermPercentage) * WEIGHTS.MIDTERM;

        // Calculate final grade
        const finalGrade = mixedScore + midtermGrade;

        // Prepare detailed component results
        const componentResults = components.map(comp => {
            const percentage = (comp.earned / comp.total) * 100;
            const unweightedGrade = percentageToGrade(percentage);
            const weight =
                comp.componentType === GRADE_COMPONENTS.MIDTERM
                    ? WEIGHTS.MIDTERM
                    : MIXED_SCORE_WEIGHTS[comp.componentType] *
                      WEIGHTS.MIXED_SCORE;

            return {
                componentType: comp.componentType,
                earned: comp.earned,
                total: comp.total,
                percentage: Math.round(percentage * 10) / 10,
                unweightedGrade: Math.round(unweightedGrade * 10) / 10,
                weight,
                weightedGrade: Math.round(unweightedGrade * weight * 10) / 10,
            };
        });

        return {
            finalGrade: parseFloat(finalGrade.toFixed(1)),
            components: componentResults,
            gradingScale: '1.0–5.0 (1.0 highest, 5.0 lowest)',
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

            const fattendanceScores =
                Array.isArray(fdistinctDates) &&
                fdistinctDates.map(date => {
                    const hasAttendance = fattendances.some(
                        att =>
                            att.student_id === studentId &&
                            att.date_time.startsWith(date),
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
    const studentData = dataSet?.[0] || {};

    // Utility function to sum possible points
    const sumPoints = (items = []) =>
        items.reduce((sum, item) => sum + (item?.points_possible || 0), 0);

    // Utility function to sum actual scores
    const sumScores = (items = []) =>
        items.reduce(
            (sum, item) =>
                sum +
                (item.scores?.reduce(
                    (scoreSum, score) => scoreSum + (score?.score || 0),
                    0,
                ) || 0),
            0,
        );

    // Attendance + Quiz point total calculator
    const calculateAttendanceQuizTotal = (quizzes, classroom, dates) => {
        const totalQuizPoints = sumPoints(quizzes);
        const attendancePointsPerDay = classroom?.attendance_points || 0;
        const totalAttendancePoints =
            (dates?.length || 0) * attendancePointsPerDay;
        return totalAttendancePoints + totalQuizPoints;
    };

    // Midterm Data
    const midtermGrade = studentData.midtermGrade ?? '-';
    const totalScoreAttendanceQuiz = calculateAttendanceQuizTotal(
        quizes,
        classroom,
        distinctDates,
    );
    const totalAttendance = studentData.totalAttendance ?? '-';
    const totalExercises = studentData.totalExercises ?? '-';
    const totalExercisePoints = sumPoints(exercises);
    const totalAssigments = studentData.totalAssigments ?? '-';
    const totalAssignmentPoints = sumPoints(assignments);
    const maxMidtermPoints = sumPoints(midterm) || 100;
    const totalMidtermPoints = sumScores(midterm);

    // Final Data
    const finalGrade = studentData.finalGrade ?? '-';
    const ftotalScoreAttendanceQuiz = calculateAttendanceQuizTotal(
        fquizes,
        classroom,
        distinctDates,
    );
    const ftotalAttendance = studentData.ftotalAttendance ?? '-';
    const ftotalExercises = studentData.ftotalExercises ?? '-';
    const ftotalExercisePoints = sumPoints(fexercises);
    const ftotalAssigments = studentData.ftotalAssigments ?? '-';
    const ftotalAssignmentPoints = sumPoints(fassignments);
    const finalPoints = sumPoints(finalExam) || 100;
    const totalFinalPoints = sumScores(finalExam);

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

    const getChartValueFinal2 = value => {
        console.log(value);
        if (value === 'QUIZ/ATENDANCE') {
            return `${ftotalAttendance}/${ftotalScoreAttendanceQuiz}`;
        }
        if (value === 'LAB') {
            return `${ftotalExercises}/${ftotalExercisePoints}`;
        }
        if (value === 'ASSIGNMENTS') {
            return `${ftotalAssigments}/${ftotalAssignmentPoints}`;
        }
        if (value === 'FINAL EXAM/PROJECT') {
            return `${totalFinalPoints}/${finalPoints}`;
        }
        return '';
    };

    if (!sheet) return null;

    const attendanceList = sheet.attendances || [];
    const sliceMappings = [
        {key: 'quizes', title: 'HANDS-ON QUIZ/ATTENDANCE'},
        {key: 'exercises', title: 'LABORATORY EXERCISES/CASE STUDIES'},
        {key: 'assignments', title: 'ASSIGNMENT/GROUP WORK'},
        {key: 'midterm', title: 'MIDTERM EXAM'},
    ];

    const sliceMappings2 = [
        {key: 'fquizes', title: 'HANDS-ON QUIZ/ATTENDANCE'},
        {key: 'fexercises', title: 'LABORATORY EXERCISES/CASE STUDIES'},
        {key: 'fassignments', title: 'ASSIGNMENT/GROUP WORK'},
        {key: 'final', title: 'FINAL EXAM'},
    ];

    let quizesList = [];
    let titleData = null;

    const selected = sliceMappings[selectedSlice];
    if (selected) {
        quizesList = sheet[selected.key] || [];
        titleData = selected.title;
    }
    const selected2 = sliceMappings2[selectedSlice2];
    if (selected2) {
        quizesList = sheet[selected2.key] || [];
        titleData = selected2.title;
    }

    return (
        <>
            <BottomSheet
                heightPercentage={0.9}
                visible={visible}
                isScroll={true}
                onDismiss={() => {
                    setSelectedSlice(null);
                    setVisible(false);
                }}>
                <>
                    {selectedSlice === 0 && (
                        <AttendanceTable attendances={attendanceList} />
                    )}
                    <OtherTable title={titleData} quizes={quizesList} />
                </>
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
                                            onPress={() => {
                                                {
                                                    setSelectedSlice(index);
                                                    setTimeout(() => {
                                                        setVisible(true);
                                                    }, 200);
                                                }
                                            }}
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
                                    {pieData2.map((slice, index) => {
                                        const {color, display, label} =
                                            data2[index];
                                        const path = arcGenerator(slice);
                                        const borderPath =
                                            borderArcGenerator(slice);
                                        const [labelX, labelY] =
                                            arcGenerator.centroid(slice);

                                        return (
                                            <G key={`slice-${index}`}>
                                                <Path
                                                    d={borderPath}
                                                    fill="none"
                                                />
                                                <Path
                                                    d={path}
                                                    fill={color}
                                                    opacity={
                                                        selectedSlice2 === index
                                                            ? 0.7
                                                            : 1.0
                                                    }
                                                    onPress={() => {
                                                        {
                                                            setSelectedSlice2(
                                                                index,
                                                            );
                                                            setTimeout(() => {
                                                                setVisible(
                                                                    true,
                                                                );
                                                            }, 200);
                                                        }
                                                    }}
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
                                                    {getChartValueFinal2(label)}
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
                                            {finalGrade}
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
