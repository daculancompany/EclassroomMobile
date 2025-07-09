import { useState, useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing } from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export const useBottomSheetAnimation = (visible, onDismiss) => {
    const [isMounted, setIsMounted] = useState(visible);
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const offsetY = useRef(0);

    useEffect(() => {
        if (visible) {
            setIsMounted(true);
            Animated.timing(translateY, {
                toValue: 0,
                duration: 250,
                easing: Easing.out(Easing.poly(4)),
                useNativeDriver: true,
            }).start(() => {
                offsetY.current = 0;
            });
        } else {
            Animated.timing(translateY, {
                toValue: SCREEN_HEIGHT,
                duration: 250,
                useNativeDriver: true,
            }).start(() => {
                setTimeout(() => {
                    setIsMounted(false);
                }, 100);
                onDismiss?.();
            });
        }
    }, [visible]);

    const closeSheet = () => {
        Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            setTimeout(() => {
                setIsMounted(false);
            }, 100);
            onDismiss?.();
        });
    };

    return { isMounted, translateY, offsetY, closeSheet };
};