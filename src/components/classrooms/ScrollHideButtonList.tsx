import React, { useRef } from 'react';
import {
  View,
  FlatList,
  Animated,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const ScrollHideButtonList = () => {
  const scrollY = useRef(new Animated.Value(0)).current;

  const data = Array.from({ length: 20 }, (_, i) => ({
    id: i.toString(),
    text: `Item ${i + 1}`,
  }));

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  );

  const buttonCollapse = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const translateY = buttonCollapse.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 0],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            transform: [{ translateY }],
            opacity: buttonCollapse,
          },
        ]}
      >
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Action Button</Text>
        </TouchableOpacity>
      </Animated.View>

      <AnimatedFlatList
        data={data}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>{item.text}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    zIndex: 1,
  },
  button: {
    backgroundColor: 'blue',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  item: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    fontSize: 16,
  },
  listContent: {
    paddingTop: 60, // Leave space for button
  },
});

export default ScrollHideButtonList;
