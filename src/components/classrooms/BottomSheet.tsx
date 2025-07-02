import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Modal, Portal, useTheme } from 'react-native-paper';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_UP = 100;
const MID_HEIGHT = 0.95;
const CLOSE_THRESHOLD = 0.75;

const BottomSheet = ({ visible, onClose, children }) => {
  const { colors } = useTheme();

  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const lastOffsetRef = useRef(SCREEN_HEIGHT * (1 - MID_HEIGHT));

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 5,
      onPanResponderMove: (_, gesture) => {
        const newY = gesture.dy + lastOffsetRef.current;
        translateY.setValue(Math.max(newY, MAX_UP));
      },
      onPanResponderRelease: (_, gesture) => {
        const dragEndY = gesture.dy + lastOffsetRef.current;
        if (dragEndY > SCREEN_HEIGHT * CLOSE_THRESHOLD) {
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start(() => onClose?.());
        } else if (gesture.dy < -50) {
          Animated.spring(translateY, {
            toValue: MAX_UP,
            useNativeDriver: true,
          }).start(() => {
            lastOffsetRef.current = MAX_UP;
          });
        } else {
          const snapY = SCREEN_HEIGHT * (1 - MID_HEIGHT);
          Animated.spring(translateY, {
            toValue: snapY,
            useNativeDriver: true,
          }).start(() => {
            lastOffsetRef.current = snapY;
          });
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: SCREEN_HEIGHT * (1 - MID_HEIGHT),
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.transparentModal}
      >
        <Animated.View
          style={[
            styles.sheetContainer,
            { backgroundColor: colors.background, transform: [{ translateY }] },
          ]}
        >
          {/* <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          > */}
            <View {...panResponder.panHandlers} style={styles.handleBarContainer}>
              <View style={[styles.handleBar, { backgroundColor: colors.onSurfaceDisabled }]} />
            </View>

            <View style={styles.content}>{children}</View>
          {/* </KeyboardAvoidingView> */}
        </Animated.View>
      </Modal>
    </Portal>
  );
};

export default BottomSheet;

const styles = StyleSheet.create({
  transparentModal: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  sheetContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 6,
  },
  handleBarContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handleBar: {
    width: 40,
    height: 5,
    borderRadius: 3,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
