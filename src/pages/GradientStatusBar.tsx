import React from 'react';
import {View, StatusBar, StyleSheet, Platform} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const GradientStatusBar = () => {
  return (
    <>
      {/* Set status bar to transparent */}
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {/* Gradient background that extends behind status bar */}
      <View style={styles.container}>
        <LinearGradient
          style={styles.gradient}
          colors={['#FF00FF', '#07b5b5']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'android' ? StatusBar.currentHeight : 44, // 44 is default iOS status bar height
    zIndex: 999,
  },
  gradient: {
    flex: 1,
  },
});

export default GradientStatusBar;
