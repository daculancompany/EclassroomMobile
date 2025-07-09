import { Animated } from 'react-native';
import { State } from 'react-native-gesture-handler';

export const useGestureHandling = (translateY, offsetY, closeSheet) => {
    const onGestureEvent = Animated.event(
        [{ nativeEvent: { translationY: translateY } }],
        { useNativeDriver: true }
    );

    const onHandlerStateChange = event => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            const { translationY, velocityY } = event.nativeEvent;
            offsetY.current = translationY;
            const dragDistance = translationY;
            const shouldClose = dragDistance > 120 || velocityY > 1200;

            if (shouldClose) {
                closeSheet();
            } else {
                Animated.spring(translateY, {
                    toValue: 0,
                    bounciness: 5,
                    useNativeDriver: true,
                }).start(() => {
                    offsetY.current = 0;
                });
            }
        }
    };

    return { onGestureEvent, onHandlerStateChange };
};