//@ts-nocheck
import React, {useState, useEffect} from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    ImageBackground,
    StatusBar,
    Dimensions,
} from 'react-native';
import {
    Appbar,
    Text,
    Divider,
    Card,
    List,
    DataTable,
    useTheme,
} from 'react-native-paper';
import {
    TabsProvider,
    Tabs,
    TabScreen,
    useTabIndex,
    useTabNavigation,
} from 'react-native-paper-tabs';
import LinearGradient from 'react-native-linear-gradient';
import AnimatedHeaderWithImage from './AnimatedHeaderWithImage';
// import useClassroomStore from '../states/classroomState';

import {
    ClassworksTab,
    AttendanceTab,
    MainContainer,
    ProgressReportTab,
    BroadcastTab,
} from '../components/';
import {DEFAULT_BANNER, HERO_IMAGE} from '../utils/constant';
import useClassRoomSettings from '../hooks/useClassRoomSettings';
import {useRoute} from '@react-navigation/native';
import Pdf from 'react-native-pdf';
import { BASE_URL } from "../utils/constant"

const AcademicRecordTab = () => (
    <ScrollView style={styles.tabContent}>
        <DataTable style={styles.table}>
            <DataTable.Header>
                <DataTable.Title>Subject</DataTable.Title>
                <DataTable.Title numeric>Grade</DataTable.Title>
            </DataTable.Header>
            <DataTable.Row>
                <DataTable.Cell>Mathematics</DataTable.Cell>
                <DataTable.Cell numeric>95%</DataTable.Cell>
            </DataTable.Row>
            <DataTable.Row>
                <DataTable.Cell>Science</DataTable.Cell>
                <DataTable.Cell numeric>88%</DataTable.Cell>
            </DataTable.Row>
        </DataTable>
    </ScrollView>
);

// Custom Gradient Tab Label Component
const GradientTabLabel = ({label, active}) => {
    return (
        <MaskedView
            maskElement={
                <Text
                    style={[styles.tabLabel, active && styles.activeTabLabel]}>
                    {label}
                </Text>
            }>
            <LinearGradient
                colors={active ? ['#FF416C', '#FF4B2B'] : ['#888', '#555']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.gradient}>
                <Text style={[styles.tabLabel, {opacity: 0}]}>{label}</Text>
            </LinearGradient>
        </MaskedView>
    );
};

// Custom Tab Bar Component
const GradientTabBar = props => {
    return (
        <LinearGradient
            colors={['#FF00FF', '#07b5b5']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.tabBar}>
            <Tabs
                {...props}
                style={{backgroundColor: 'transparent'}}
                indicatorStyle={styles.tabIndicator}
            />
        </LinearGradient>
    );
};

// ===== MAIN COMPONENT =====

const ClassroomDetails = ({navigation}) => {
    const theme = useTheme();
    const route = useRoute();
    const {class_id, id, ntype} = route.params || {};
    const [previewImage, setPreviewImage] = useState(null);
    const {
        isLoading,
        data: classroom,
        refetch: refetchSettings,
    } = useClassRoomSettings(class_id);

 

    useEffect(() => {
        if (classroom) {
            if (classroom.hero_image) {
                setPreviewImage(HERO_IMAGE + classroom.hero_image);
            } else {
                setPreviewImage(DEFAULT_BANNER);
            }
        } else {
            if (!isLoading) {
                setPreviewImage(DEFAULT_BANNER);
            }
        }
    }, [classroom]);

    const source = {
        uri: `${BASE_URL}course-syllabus.pdf`,
        cache: true,
    };



    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle="light-content"
                translucent
                backgroundColor="transparent"
            />
            <ImageBackground
                source={{
                    uri: previewImage,
                }}
                style={styles.imageBackground}
                resizeMode="cover">
                <LinearGradient
                    colors={['#ff00ff75', '#07b5b559']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={[styles.gradient]}>
                    <Appbar.Header
                        style={{
                            backgroundColor: 'transparent',
                            height: 100,
                            marginTop: -20,
                        }}>
                        <Appbar.BackAction
                            onPress={() => navigation.goBack()}
                        />
                        <Appbar.Content title="Class 10-A" />
                    </Appbar.Header>
                </LinearGradient>
            </ImageBackground>
            <TabsProvider defaultIndex={0} >
                <Tabs mode="scrollable">
                    <TabScreen
                        label="Broadcast"
                        icon="access-point"
                        labelStyle={styles.tabLabel}>
                        <BroadcastTab />
                    </TabScreen>
                    <TabScreen
                        label="Classworks"
                        icon="table"
                        labelStyle={styles.tabLabel}>
                        <ClassworksTab />
                    </TabScreen>
                    <TabScreen
                        label="Attendance   "
                        icon="clock"
                        labelStyle={styles.tabLabel}>
                        <AttendanceTab />
                    </TabScreen>
                    <TabScreen
                        label="Progress Report   "
                        icon="file"
                        labelStyle={styles.tabLabel}>
                        <ProgressReportTab />
                    </TabScreen>
                    <TabScreen
                        label="Course Syllabus   "
                        icon="file"
                        labelStyle={styles.tabLabel}>
                        <View
                            style={{
                                height: 500,
                                backgroundColor: theme.colors.background,
                                marginTop: 20,
                            }}>
                            <Pdf
                                trustAllCerts={false}
                                source={source}
                                style={[
                                    styles.pdf,
                                    {
                                        backgroundColor:
                                            theme.colors.background,
                                    },
                                ]}
                                onError={error =>
                                    console.log('PDF load error:', error)
                                }
                            />
                        </View>
                    </TabScreen>
                </Tabs>
            </TabsProvider>
        </SafeAreaView>
    );
};

// ===== STYLES (Same as before) =====
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tabContent: {
        padding: 16,
    },
    card: {
        marginBottom: 16,
    },
    table: {
        marginVertical: 8,
    },

    imageBackground: {
        width: '100%',
        height: 100,
    },
    gradient: {
        height: 100,
    },
    pdf: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
});

export default ClassroomDetails;
