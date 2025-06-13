// @ts-nocheck
import React from 'react';
import {Button} from 'react-native-paper';

const ButtonComponent = ({
    label,
    onPress,
    style,
    mode = 'contained',
    ...props
}) => {
    return (
        <Button
            {...props}
            mode={mode}
            onPress={onPress}
            style={[{marginVertical: 8}, style]}>
            {' '}
            {label}{' '}
        </Button>
    );
};

export default ButtonComponent;
