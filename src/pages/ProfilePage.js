//@ts-nocheck
import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Button, Text, useTheme} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfilePage = ({navigation}) => {
    const theme = useTheme();

    const handleLogout = async () => {
        await AsyncStorage.removeItem('userToken');
        navigation.navigate('Login');
    };

    return (
        <View
            style={[
                styles.container,
                {backgroundColor: theme.colors.background},
            ]}>
            <Text style={{color: theme.colors.text}}>Profile Page</Text>
            <Button
                mode="contained"
                onPress={handleLogout}
                style={styles.button}>
                Logout
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        marginTop: 10,
    },
});

export default ProfilePage;
