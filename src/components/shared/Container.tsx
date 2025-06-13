// @ts-nocheck
import React from 'react';
import {SafeAreaView, StyleSheet, ScrollView, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useTheme} from 'react-native-paper';



export const CenterContainer = React.memo(({children, style}) => {
    return (
        <SafeAreaView style={[style, {flex: 1, flexDirection: 'column'}]}>
            <View style={{padding: 20, flex: 1}}>{children}</View>
        </SafeAreaView>
    );
});



export const MainContainer = React.memo(({children, style}) => {
    return (
        <SafeAreaView style={[style, {flex: 1}]}>
            <KeyboardAwareScrollView keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false} >
                <View style={{padding: 10}}>{children}</View>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
});

export const FullContainer = props => {
    const theme = useTheme();
    const styles = makeStyles(theme);
    //<ScrollView showsVerticalScrollIndicator={false}>
    return (
        <SafeAreaView style={styles.containerFull}>
            {props.children}
        </SafeAreaView>
    );
};

const makeStyles = theme =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: 'rgb(20, 21, 20)',
            // paddingHorizontal: 20,
            // paddingVertical: 20,
        },
        containerFull: {
            flex: 1,
            backgroundColor: 'rgb(20, 21, 20)', //theme?.colors?.primaryContainer
            //paddingVertical: 20,
        },
    });
