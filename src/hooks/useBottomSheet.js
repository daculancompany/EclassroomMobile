// useBottomSheet.ts
import {useRef, useState, useEffect} from 'react';
import {Animated, Keyboard, Dimensions} from 'react-native';
import {State} from 'react-native-gesture-handler';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export const useBottomSheet = (enablePanGesture = true) => {
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [visible, setVisible] = useState(false);

    // Animation effects
    useEffect(() => {
        Animated[visible ? 'spring' : 'timing'](translateY, {
            toValue: visible ? 0 : SCREEN_HEIGHT,
            duration: 250,
            useNativeDriver: true,
            damping: 20,
        }).start();
    }, [visible]);

    // Keyboard handling
    useEffect(() => {
        const showSub = Keyboard.addListener('keyboardDidShow', e => {
            setKeyboardHeight(e.endCoordinates.height);
        });
        const hideSub = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardHeight(0);
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const onGestureEvent = Animated.event(
        [{nativeEvent: {translationY: translateY}}],
        {useNativeDriver: true},
    );

    const onHandlerStateChange = (event: any) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            const {translationY} = event.nativeEvent;
            if (translationY > 100 && enablePanGesture) {
                Animated.timing(translateY, {
                    toValue: SCREEN_HEIGHT,
                    duration: 250,
                    useNativeDriver: true,
                }).start(() => setVisible(false));
            } else {
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                    damping: 20,
                }).start();
            }
        }
    };

    return {
        visible,
        setVisible,
        translateY,
        keyboardHeight,
        onGestureEvent,
        onHandlerStateChange,
    };
};
