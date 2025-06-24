//@ts-nocheck
import React, {useEffect} from 'react';
import {Text} from 'react-native';
import echo from '../services/socket';

export default function PushListener() {
    const [message, setMessage] = React.useState('');

    useEffect(() => {
        echo.channel('push-channel').listen('PushMessageEvent', data => {
            setMessage(data.message);
        });

        return () => echo.leave('push-channel');
    }, []);

    return <Text>{message || 'Waiting for messages...'}</Text>;
}
