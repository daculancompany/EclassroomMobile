import React from 'react';
import { View, StyleSheet } from 'react-native';
import Shimmer from 'react-native-shimmer';
import { useTheme } from 'react-native-paper';

// Reusable shimmer block
const ShimmerBlock = ({ height, borderRadius = 8, style }) => {
  const { colors } = useTheme();
  const backgroundColor = colors.surfaceVariant || colors.backdrop;

  return (
    <Shimmer style={style}>
      <View style={{ height, borderRadius, backgroundColor }} />
    </Shimmer>
  );
};

// SimpleLoading Component (e.g. profile card shimmer)
export const SimpleLoading = () => {
  return (
    <View style={styles.container}>
      <ShimmerBlock height={180} borderRadius={12} style={styles.cardShimmer} />
    </View>
  );
};

// ChatLoading Component (e.g. list of chat bubbles shimmer)
export const ChatLoading = () => {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4].map((item) => (
        <ShimmerBlock
          key={item}
          height={70}
          borderRadius={8}
          style={styles.listItemShimmer}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  cardShimmer: {
    marginBottom: 20,
  },
  listItemShimmer: {
    marginBottom: 12,
  },
});
