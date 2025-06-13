//@ts-nocheck
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useTheme} from 'react-native-paper';

const POSPage = () => {
    const theme = useTheme();

    return (
        <View style={{flex: 1, backgroundColor: theme.colors.background}}>
            <Text style={{color: theme.colors.text}}>POS Page</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default POSPage;
