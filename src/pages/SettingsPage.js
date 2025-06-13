//@ts-nocheck
import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Switch, Text, useTheme, Button} from 'react-native-paper';
import {useThemeStore} from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsPage = ({navigation}) => {
    const theme = useTheme();
    const {isDarkTheme, toggleTheme} = useThemeStore();


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
            <Text style={[styles.title, {color: theme.colors.text}]}>
                Settings
            </Text>
            <View style={styles.row}>
                <Text style={{color: theme.colors.text}}>Dark Theme</Text>
                <Switch value={isDarkTheme} onValueChange={toggleTheme} />
            </View>
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
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
    },
});

export default SettingsPage;
