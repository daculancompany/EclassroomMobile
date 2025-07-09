// @ts-nocheck
import React, {useRef, useEffect, useState} from 'react';
import {
  View,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  StyleSheet,
  PanResponder,
  Keyboard,
  Easing,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme, Text} from 'react-native-paper';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const BottomSheet = ({
  visible,
  onDismiss,
  children,
  heightPercentage = 0.90,
}) => {
  const theme = useTheme();
  const [isMounted, setIsMounted] = useState(visible);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const offsetY = useRef(0);
  const height = SCREEN_HEIGHT * 0.90;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        const newY = gestureState.dy + offsetY.current;
        if (newY > 0) translateY.setValue(newY);
      },
      onPanResponderRelease: (_, gestureState) => {
        const dragDistance = gestureState.dy;
        const velocity = gestureState.vy;
        const shouldClose = dragDistance > 120 || velocity > 1.2;

        if (shouldClose) {
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            setIsMounted(false);
            onDismiss?.();
          });
        } else {
          Animated.spring(translateY, {
            toValue: SCREEN_HEIGHT - height,
            bounciness: 5,
            useNativeDriver: true,
          }).start(() => {
            offsetY.current = 0;
          });
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT - height,
        duration: 250,
        easing: Easing.out(Easing.poly(4)),
        useNativeDriver: true,
      }).start(() => {
        offsetY.current = 0;
      });
    } else {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setIsMounted(false);
        onDismiss?.();
      });
    }
  }, [visible]);

  if (!isMounted) return null;

  return (
    <>
      {/* Backdrop */}
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            setIsMounted(false);
            onDismiss?.();
          });
        }}
      >
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      {/* Bottom Sheet */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.sheetContainer,
          {
            height,
            transform: [{translateY}],
            backgroundColor: theme.colors.elevation.level2,
          },
        ]}
      >
        <SafeAreaView style={{flex: 1}} edges={['bottom']}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{flex: 1}}
          >
            {/* Header */}
            <View style={styles.header}>
              <View
                style={[
                  styles.dragIndicator,
                  {backgroundColor: theme.colors.outlineVariant},
                ]}
              />
              <TouchableOpacity
                onPress={() => {
                  Animated.timing(translateY, {
                    toValue: SCREEN_HEIGHT,
                    duration: 200,
                    useNativeDriver: true,
                  }).start(() => {
                    setIsMounted(false);
                    onDismiss?.();
                  });
                }}
                style={[
                  styles.closeButton,
                  {backgroundColor: theme.colors.backdrop},
                ]}
              >
                <Text style={{fontSize: 22, color: theme.colors.onSurface}}>
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>{children}</View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 998,
  },
  sheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.1,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dragIndicator: {
    width: 40,
    height: 5,
    borderRadius: 3,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
});

export default BottomSheet;
