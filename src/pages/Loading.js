import React, { useEffect } from 'react';
import { View, StyleSheet, BackHandler, Alert } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

const Loading = ({ navigation }) => {
    const isFocused = useIsFocused();

    // useEffect(() => {
    //     const backAction = () => {
    //         Alert.alert(
    //             'Hold on!',
    //             'Are you sure you want to exit the app?',
    //             [
    //                 {
    //                     text: 'Cancel',
    //                     onPress: () => null,
    //                     style: 'cancel',
    //                 },
    //                 {
    //                     text: 'Yes',
    //                     onPress: () => BackHandler.exitApp(),
    //                 },
    //             ]
    //         );
    //         return true; // prevent default behavior
    //     };

    //     const backHandler = BackHandler.addEventListener(
    //         'hardwareBackPress',
    //         backAction
    //     );

    //     return () => backHandler.remove();
    // }, []);

    useEffect(() => {
        const checkLoginStatus = async () => {
            const userToken = await AsyncStorage.getItem('token');
            if (userToken) {
                // navigation.reset({
                //     index: 0,
                //     routes: [{ name: 'Main' }],
                // });
                navigation.navigate('Main');
            } else {
                 navigation.navigate('Login');
            }
        };

        if (isFocused) {
            checkLoginStatus();
        }
    }, [isFocused, navigation]);

    return (
        <View style={styles.container}>
            <ActivityIndicator animating={true} size="large" />
            <Text style={styles.text}>Checking login status...</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        marginTop: 20,
        fontSize: 16,
    },
});

export default Loading;
