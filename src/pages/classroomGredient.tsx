//@ts-nocheck
import React from 'react';
import {View, StyleSheet, FlatList} from 'react-native';
import {
  Text,
  TouchableRipple,
  Card,
  IconButton,
  useTheme,
  Divider,
  Appbar,
} from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const ClassroomListScreen = () => {
  const theme = useTheme();

  // Sample classroom data
  const classrooms = [
    {
      id: '1',
      name: 'Computer Lab 101',
      capacity: 30,
      building: 'Tech Building',
      floor: '1st Floor',
    },
    {
      id: '2',
      name: 'Programming Lab',
      capacity: 25,
      building: 'Main Building',
      floor: '3rd Floor',
    },
    {
      id: '3',
      name: 'Network Lab',
      capacity: 20,
      building: 'Tech Building',
      floor: '2nd Floor',
    },
    {
      id: '4',
      name: 'Multimedia Room',
      capacity: 15,
      building: 'Arts Building',
      floor: 'Ground Floor',
    },
    {
      id: '5',
      name: 'Lecture Hall A',
      capacity: 50,
      building: 'Main Building',
      floor: '1st Floor',
    },
  ];

  const renderItem = ({item}) => (
    <LinearGradient
      colors={[
        theme.colors.primaryContainer,
        theme.colors.secondaryContainer,
        theme.colors.tertiaryContainer,
      ]}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={[
        styles.classroomCard,
        {
          borderRadius: 12,
          elevation: 3,
          shadowColor: theme.colors.shadow,
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
      ]}>
      <TouchableRipple onPress={() => {}} rippleColor="rgba(0, 0, 0, .12)">
        <Card.Content>
          <View style={styles.cardHeader}>
            <Ionicons
              name="desktop-outline"
              size={24}
              color={theme.colors.primary}
            />
            <Text variant="titleMedium" style={styles.classroomName}>
              {item.name}
            </Text>
          </View>

          {/* <Divider style={styles.divider} /> */}

          <View style={styles.cardDetails}>
            <View style={styles.detailRow}>
              <Ionicons
                name="people-outline"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
              <Text variant="bodyMedium" style={styles.detailText}>
                Capacity: {item.capacity}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons
                name="business-outline"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
              <Text variant="bodyMedium" style={styles.detailText}>
                {item.building}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons
                name="layers-outline"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
              <Text variant="bodyMedium" style={styles.detailText}>
                {item.floor}
              </Text>
            </View>
          </View>
        </Card.Content>
      </TouchableRipple>
    </LinearGradient>
  );

  return (
    <View
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryContainer]}
        start={{x: 0, y: 1}}
        end={{x: 0, y: 0}}
        style={styles.gradient}>
        <Appbar.Header
          style={[styles.header, {backgroundColor: 'transparent'}]}>
          <Appbar.Content
            title={
              <Text
                variant="headlineSmall"
                style={[styles.headerTitle, {color: theme.colors.onPrimary}]}>
                Classrooms
              </Text>
            }
          />
          <IconButton
            icon={() => (
              <Ionicons
                name="filter-outline"
                size={24}
                color={theme.colors.onPrimary}
              />
            )}
            onPress={() => {}}
            style={styles.filterButton}
          />
        </Appbar.Header>
      </LinearGradient>
      <View style={{minHeight: 15}}></View>
      <FlatList
        data={classrooms}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <View style={{minHeight: 40}}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  headerTitle: {
    marginLeft: 8,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
  classroomCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  classroomName: {
    marginLeft: 10,
  },
  cardDetails: {
    marginLeft: 34, // Align with icon
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
  },
  divider: {
    marginVertical: 8,
    marginLeft: 34,
  },
  gradient: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    elevation: 0, // Remove default elevation
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontWeight: 'bold',
    marginLeft: 8,
  },
  filterButton: {
    marginRight: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});

export default ClassroomListScreen;
