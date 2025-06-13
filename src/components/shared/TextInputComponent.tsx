// @ts-nocheck
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { TextInput as Input, useTheme } from 'react-native-paper';

import { ERROR_COLOR } from '../../utils/constant';

const TextInputComponent = ({
    label,
    style,
    errorText,
    description,
    mode = 'outlined',
    error = false,
    inputRef, // ← accept the ref
    returnKeyType = 'next',
    onSubmitEditing,
    ...props
}) => {
    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            <Input
                {...props}
                ref={inputRef} // ← forward the ref to react-native-paper Input
                label={label}
                placeholder={label}
                mode={mode}
                returnKeyType={returnKeyType} // ← handle return key
                onSubmitEditing={onSubmitEditing} // ← move to next field
                style={[styles.input, style]}
                error={error}
                blurOnSubmit={false}
            />
            {description && !errorText ? (
                <Text style={styles.description}>{description}</Text>
            ) : null}
            {errorText ? (
                <Text style={[styles.error]}>{errorText}</Text>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        marginVertical: 0,
    },
    input: {
        marginVertical: 8, 
        width: '100%',
    },
    description: {
        fontSize: 13,
        paddingTop: 0,
    },
    error: {
        fontSize: 13,
        color: ERROR_COLOR,
        paddingTop: 0,
    },
});

export default TextInputComponent;