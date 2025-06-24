import {StyleSheet, Dimensions} from 'react-native';
import {MD3Theme} from 'react-native-paper';

const MODAL_HEIGHT = Dimensions.get('window').height - 20;

export const createBottomSheetStyles = (theme: MD3Theme) =>
  StyleSheet.create({
    modal: {
      margin: 0,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'transparent',
    },
    container: {
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: 'hidden',
    },
    safeArea: {
      flex: 1,
    },
    header: {
      paddingVertical: 10,
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
    },
    dragHandle: {
      width: 40,
      height: 5,
      backgroundColor: theme.colors.onSurfaceVariant,
      borderRadius: 5,
      opacity: 0.6,
    },
    contentContainer: {
      flex: 1,
    },
    appContainer: {
      flex: 1,
    },
    openButton: {
      position: 'absolute',
      bottom: 40,
      right: 20,
      zIndex: 1,
    },
  });

export const MODAL_HEIGHT_CONST = MODAL_HEIGHT;
