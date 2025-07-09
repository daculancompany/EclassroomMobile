// @ts-nocheck
import React, {useRef, useEffect, useState} from 'react';
import {
    View,
    TextInput as RNTextInput,
    TouchableOpacity,
    Animated,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    Keyboard,
    StyleSheet,
    TouchableWithoutFeedback,
    Image,
    ScrollView,
} from 'react-native';
import {Text, useTheme, Portal, Avatar, DataTable} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Formik} from 'formik';
import {PanGestureHandler} from 'react-native-gesture-handler';
import ImagePicker from 'react-native-image-crop-picker';

// Import custom hooks
import {useBottomSheetAnimation} from '../../hooks/bottomSheet/useBottomSheetAnimation';
import {useGestureHandling} from '../../hooks/bottomSheet/useGestureHandling';
import {useScrollHandling} from '../../hooks/bottomSheet/useScrollHandling';

// Import components and utilities
import {ButtonComponent, TextInputComponent} from '../../components/';
import {profileValidationSchema} from '../../utils/validationHelper';
import useProfileStore from '../../states/profileState';
import {PROFILE, ATTENDANCE_PROFILE} from '../../utils/constant';
import {useQueryClient} from 'react-query';
import useStatusIcon from '../../hooks/useStatusIcon';
import {useGlobalStyles} from '../../styles/globalStyles';
import {formatDate} from '../../utils/helper';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

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

const ProgressReportSheet = ({
    visible,
    onDismiss,
    selectedSlice,
    selectedSlice2,
    sheet
}) => {
    const queryClient = useQueryClient();
    const theme = useTheme();
    const [error, setError] = useState('');
    const formikRef = useRef();
    const panGestureRef = useRef();
    const {setField, updateProfile} = useProfileStore();
    const [submit, setSubmit] = React.useState(false);

    const {isMounted, translateY, offsetY, closeSheet} =
        useBottomSheetAnimation(visible, onDismiss);
    const {isScrollAtTop, isScrolled, handleScroll} = useScrollHandling();
    const {onGestureEvent, onHandlerStateChange} = useGestureHandling(
        translateY,
        offsetY,
        closeSheet,
    );

    if (!isMounted) return null;

0
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

    const attendanceList = sheet.attendances || [];

    return (
        <>
            <Portal>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>

                <PanGestureHandler
                    ref={panGestureRef}
                    onGestureEvent={onGestureEvent}
                    onHandlerStateChange={onHandlerStateChange}
                    activeOffsetY={10}
                    enabled={isScrollAtTop}>
                    <Animated.View
                        style={[
                            styles.sheetContainer,
                            {
                                transform: [{translateY}],
                                backgroundColor: theme.colors.elevation.level2,
                            },
                        ]}>
                        <SafeAreaView style={{flex: 1}} edges={['bottom']}>
                            <KeyboardAvoidingView
                                style={{flex: 1}}
                                behavior={
                                    Platform.OS === 'ios'
                                        ? 'padding'
                                        : undefined
                                }>
                                {/* Header */}
                                <View style={styles.header}>
                                    <View
                                        style={[
                                            styles.dragIndicator,
                                            {
                                                backgroundColor:
                                                    theme.colors.outlineVariant,
                                            },
                                        ]}
                                    />
                                    <TouchableOpacity
                                        onPress={() => {
                                            Animated.timing(translateY, {
                                                toValue: SCREEN_HEIGHT,
                                                duration: 200,
                                                useNativeDriver: true,
                                            }).start(() => {
                                                onDismiss?.();
                                            });
                                        }}
                                        style={styles.closeButton}>
                                        <Text style={styles.closeButtonText}>
                                            ×
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <ScrollView
                                    contentContainerStyle={
                                        styles.contentContainer
                                    }
                                    keyboardShouldPersistTaps="handled"
                                    showsVerticalScrollIndicator={false}
                                    onScroll={({nativeEvent}) => {
                                        const {contentOffset} = nativeEvent;
                                        setIsScrolled(contentOffset.y > 0);
                                    }}
                                    scrollEventThrottle={16}
                                    onScroll={handleScroll}>
                                    {selectedSlice === 0 && (
                                        <AttendanceTable
                                            attendances={attendanceList}
                                        />
                                    )}
                                    <OtherTable
                                        title={titleData}
                                        quizes={quizesList}
                                    />
                                </ScrollView>
                            </KeyboardAvoidingView>
                        </SafeAreaView>
                    </Animated.View>
                </PanGestureHandler>
            </Portal>
        </>
    );
};

const styles = StyleSheet.create({
    sheetContainer: {
        position: 'absolute',
        bottom: 0,
        height: '90%',
        width: '100%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        elevation: 15,
        zIndex: 999,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -3},
        shadowOpacity: 0.1,
        shadowRadius: 10,
        overflow: 'hidden',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 998,
    },
    header: {
        paddingTop: 16,
        paddingBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        height: 45,
    },
    dragIndicator: {
        width: 40,
        height: 5,
        borderRadius: 3,
    },
    closeButton: {
        position: 'absolute',
        right: 16,
        top: 10,
        backgroundColor: '#00000040',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        lineHeight: 24,
    },
    content: {
        flex: 1,
        padding: 24,
    },
    title: {
        marginBottom: 16,
        fontSize: 18,
        textAlign: 'center',
    },
    input: {
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
    },
    button: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
    },
    buttonText: {
        fontWeight: '600',
        fontSize: 16,
    },
    imagePickerContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    imagePickerButton: {
        marginTop: 10,
    },
    input: {
        marginBottom: 15,
        backgroundColor: 'transparent',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    editButton: {
        flex: 1,
        marginHorizontal: 5,
    },
});

export default ProgressReportSheet;
