// @ts-nocheck
import React, {useRef} from 'react';
import {
  Animated,
  StyleSheet,
  View,
  StatusBar,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {Appbar, Text, Divider, Card, List, DataTable} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const HEADER_MAX_HEIGHT = 200;
const HEADER_MIN_HEIGHT = 70;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const AnimatedHeaderWithImage = ({navigation}) => {
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  // Back button opacity changes as you scroll
  const backButtonOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  // Title vertical position moves up as you scroll
  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT - 60, HEADER_MIN_HEIGHT - 40],
    extrapolate: 'clamp',
  });

  // Title scale shrinks slightly
  const titleScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  // Title opacity stays fully visible
  const titleOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Animated Header with Image and Gradient */}
      <Animated.View style={[styles.header, {height: headerHeight}]}>
        <ImageBackground
          source={{
            uri: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          }}
          style={styles.imageBackground}
          resizeMode="cover">
          <LinearGradient
            colors={['#ff00ffa6', '#07b5b59c']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.gradient}
          />
          
          {/* Back Button */}
          <Animated.View style={[styles.backButton, {opacity: backButtonOpacity}]}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
          </Animated.View>
        </ImageBackground>
      </Animated.View>

      {/* Animated Title */}
      <Animated.View
        style={[
          styles.titleContainer,
          {
            transform: [{translateY: titleTranslateY}, {scale: titleScale}],
            opacity: titleOpacity,
          },
        ]}>
        <Text style={styles.headerText}>Class 10-A</Text>
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        contentContainerStyle={{paddingTop: HEADER_MAX_HEIGHT}}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: false},
        )}>
        {Array.from({length: 25}).map((_, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.rowText}>Item {index + 1}</Text>
          </View>
        ))}
      </Animated.ScrollView>
    </View>
  );
};

export default AnimatedHeaderWithImage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  imageBackground: {
    flex: 1,
    width: '100%',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1002,
  },
  titleContainer: {
    position: 'absolute',
    left: 60,
    right: 20,
    zIndex: 1001,
  },
  headerText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4,
  },
  row: {
    height: 80,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  rowText: {
    fontSize: 16,
  },
});