//@ts-nocheck
import React from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    ImageBackground,
    StatusBar,
} from 'react-native';
import {Appbar, Text, Divider, Card, List, DataTable} from 'react-native-paper';
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
} from '../components/';
// ===== TAB NAVIGATOR =====

// ===== TAB SCREENS (Same as before) =====
const BroadcastTab = () => (
    <ScrollView style={styles.tabContent}>
        <Card style={styles.card}>
            <Card.Title title="Announcement" />
            <Card.Content>
                <Text>Homework due next Monday!</Text>
            </Card.Content>
        </Card>
        <Card style={styles.card}>
            <Card.Title title="Reminder" />
            <Card.Content>
                <Text>Bring your project materials tomorrow.</Text>
            </Card.Content>
        </Card>
    </ScrollView>
);



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
    // return <AnimatedHeaderWithImage />
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle="light-content"
                translucent
                backgroundColor="transparent"
            />
            <ImageBackground
                source={{
                    uri: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
                }}
                style={styles.imageBackground}
                resizeMode="cover">
                <LinearGradient
                    colors={['#ff00ffa6', '#07b5b59c']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    style={[styles.gradient]}>
                    <Appbar.Header
                        style={{
                            backgroundColor: 'transparent',
                            height: 140,
                            marginTop: -30,
                        }}>
                        <Appbar.BackAction
                            onPress={() => navigation.goBack()}
                        />
                        <Appbar.Content title="Class 10-A" />
                    </Appbar.Header>
                </LinearGradient>
            </ImageBackground>
            <TabsProvider defaultIndex={0}>
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
                        <AcademicRecordTab />
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
        height: 140,
    },
    gradient: {
        height: 140,
    },
});

export default ClassroomDetails;
