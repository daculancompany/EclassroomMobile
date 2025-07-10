//@ts-nocheck
import React from 'react';
import {StyleSheet, useColorScheme, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Ionicons from 'react-native-vector-icons/Ionicons';

const GradientIcon = ({name, size, colors}) => {
    return (
        <MaskedView
            maskElement={
                <View style={{alignItems: 'center', justifyContent: 'center'}}>
                    <Ionicons name={name} size={size} color="black" />
                </View>
            }>
            <LinearGradient
                colors={['#0af5f5', '#FF00FF']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={{width: size, height: size}}>
                {/* Empty View with gradient used for masking */}
                <View style={{flex: 1}} />
            </LinearGradient>
        </MaskedView>
    );
};

export default GradientIcon
