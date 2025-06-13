//@ts-nocheck
import React, { useState } from 'react';
import {View, StyleSheet, FlatList, StatusBar} from 'react-native';
import {
    Text,
    TouchableRipple,
    Card,
    IconButton,
    useTheme,
    Divider,
    Appbar,
    Menu,
    TextInput,
} from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {MaskedView} from '@react-native-masked-view/masked-view';
import {useNavigation} from '@react-navigation/native';
import GradientStatusBar from './GradientStatusBar';

const ClassroomListScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterVisible, setFilterVisible] = useState(false);
    const [capacityFilter, setCapacityFilter] = useState(null);
    const [buildingFilter, setBuildingFilter] = useState(null);

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
         {
            id: '6',
            name: 'Lecture Hall B',
            capacity: 50,
            building: 'Main Building',
            floor: '1st Floor',
        },
         {
            id: '7',
            name: 'Lecture Hall C',
            capacity: 50,
            building: 'Main Building',
            floor: '1st Floor',
        },
         {
            id: '8',
            name: 'Lecture Hall D',
            capacity: 50,
            building: 'Main Building',
            floor: '1st Floor',
        },
    ];

    const buildings = [...new Set(classrooms.map(item => item.building))];

    const filteredClassrooms = classrooms.filter(classroom => {
        // Search by name
        const matchesSearch = classroom.name.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Filter by capacity
        let matchesCapacity = true;
        if (capacityFilter === 'small') {
            matchesCapacity = classroom.capacity < 20;
        } else if (capacityFilter === 'medium') {
            matchesCapacity = classroom.capacity >= 20 && classroom.capacity < 40;
        } else if (capacityFilter === 'large') {
            matchesCapacity = classroom.capacity >= 40;
        }
        
        // Filter by building
        const matchesBuilding = buildingFilter ? classroom.building === buildingFilter : true;
        
        return matchesSearch && matchesCapacity && matchesBuilding;
    });

    const clearFilters = () => {
        setCapacityFilter(null);
        setBuildingFilter(null);
        setSearchQuery('');
    };

    const renderItem = ({item}) => (
        <LinearGradient
            colors={['#a308a3', '#068c8c']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={{
                borderRadius: 12,
                padding: 2,
                margin: 5,
                opacity: 0.9,
            }}>
            <Card>
                <TouchableRipple
                    onPress={() => navigation.navigate('ClassroomDetails')}
                    rippleColor="#a308a3">
                    <Card.Content>
                        <View style={styles.cardHeader}>
                            <Ionicons
                                name="desktop-outline"
                                size={20}
                                color={theme.colors.primary}
                            />
                            <Text
                                variant="titleMedium"
                                style={styles.classroomName}>
                                {item.name}
                            </Text>
                        </View>

                        <View style={styles.cardDetails}>
                            <View style={styles.detailRow}>
                                <Ionicons
                                    name="people-outline"
                                    size={16}
                                    color={theme.colors.onSurfaceVariant}
                                />
                                <Text
                                    variant="bodyMedium"
                                    style={styles.detailText}>
                                    Capacity: {item.capacity}
                                </Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Ionicons
                                    name="business-outline"
                                    size={16}
                                    color={theme.colors.onSurfaceVariant}
                                />
                                <Text
                                    variant="bodyMedium"
                                    style={styles.detailText}>
                                    {item.building}
                                </Text>
                            </View>

                            <View style={styles.detailRow}>
                                <Ionicons
                                    name="layers-outline"
                                    size={16}
                                    color={theme.colors.onSurfaceVariant}
                                />
                                <Text
                                    variant="bodyMedium"
                                    style={styles.detailText}>
                                    {item.floor}
                                </Text>
                            </View>
                        </View>
                    </Card.Content>
                </TouchableRipple>
            </Card>
        </LinearGradient>
    );

    const GradientIconButton = ({icon, onPress, colors}) => (
        <LinearGradient
            colors={colors || ['#4c669f', '#3b5998', '#192f6a']}
            style={styles.gradientButton}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}>
            <IconButton
                icon={icon}
                onPress={onPress}
                style={{backgroundColor: 'transparent'}}
                rippleColor="rgba(255, 255, 255, 0.2)"
            />
        </LinearGradient>
    );

    return (
        <>
            <GradientStatusBar />
            <View
                style={[
                    styles.container,
                    {backgroundColor: 'transparent'},
                ]}>
                <Appbar.Header>
                    <Appbar.Content
                        title={<Text variant="headlineSmall">Classrooms</Text>}
                    />
                    <Menu
                        visible={filterVisible}
                        onDismiss={() => setFilterVisible(false)}
                        anchor={
                            <GradientIconButton
                                icon={() => (
                                    <Ionicons
                                        name="filter-outline"
                                        size={24}
                                        color={theme.colors.onPrimary}
                                    />
                                )}
                                onPress={() => setFilterVisible(true)}
                                colors={['#FF00FF', '#07b5b5']}
                            />
                        }>
                        <Menu.Item 
                            leadingIcon="magnify" 
                            title="Search"
                            onPress={() => {
                                setFilterVisible(false);
                                // You might want to focus on the search input here
                            }} 
                        />
                        <Menu.Item 
                            leadingIcon="account-group" 
                            title="Capacity"
                            onPress={() => {
                                setFilterVisible(false);
                                // Show capacity filter options
                            }} 
                        />
                        <Menu.Item 
                            leadingIcon="office-building" 
                            title="Building"
                            onPress={() => {
                                setFilterVisible(false);
                                // Show building filter options
                            }} 
                        />
                        <Divider />
                        <Menu.Item 
                            leadingIcon="filter-remove" 
                            title="Clear Filters"
                            onPress={() => {
                                clearFilters();
                                setFilterVisible(false);
                            }} 
                        />
                    </Menu>
                </Appbar.Header>

                {/* <View style={styles.searchContainer}>
                    <TextInput
                        placeholder="Search classrooms..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={styles.searchInput}
                        left={<TextInput.Icon icon="magnify" />}
                        mode="outlined"
                    />
                </View> */}

                <View style={styles.filterChips}>
                    {capacityFilter && (
                        <View style={[styles.chip, { backgroundColor: theme.colors.primaryContainer }]}>
                            <Text style={styles.chipText}>
                                {capacityFilter === 'small' ? 'Small (<20)' : 
                                 capacityFilter === 'medium' ? 'Medium (20-40)' : 'Large (40+)'}
                            </Text>
                            <IconButton 
                                icon="close" 
                                size={16} 
                                onPress={() => setCapacityFilter(null)} 
                            />
                        </View>
                    )}
                    {buildingFilter && (
                        <View style={[styles.chip, { backgroundColor: theme.colors.primaryContainer }]}>
                            <Text style={styles.chipText}>{buildingFilter}</Text>
                            <IconButton 
                                icon="close" 
                                size={16} 
                                onPress={() => setBuildingFilter(null)} 
                            />
                        </View>
                    )}
                </View>

                <FlatList
                    data={filteredClassrooms}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search-off" size={50} color={theme.colors.onSurfaceDisabled} />
                            <Text style={styles.emptyText}>No classrooms found</Text>
                            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
                        </View>
                    }
                />

                {/* Filter modal for capacity */}
                <Menu
                    visible={false} // You'll need to manage this state
                    onDismiss={() => {}}
                    anchor={<View />}>
                    <Menu.Item 
                        title="Small (<20)" 
                        onPress={() => setCapacityFilter('small')} 
                    />
                    <Menu.Item 
                        title="Medium (20-40)" 
                        onPress={() => setCapacityFilter('medium')} 
                    />
                    <Menu.Item 
                        title="Large (40+)" 
                        onPress={() => setCapacityFilter('large')} 
                    />
                </Menu>

                {/* Filter modal for building */}
                <Menu
                    visible={false} // You'll need to manage this state
                    onDismiss={() => {}}
                    anchor={<View />}>
                    {buildings.map(building => (
                        <Menu.Item 
                            key={building}
                            title={building} 
                            onPress={() => setBuildingFilter(building)} 
                        />
                    ))}
                </Menu>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 0,
    },
    classroomName: {
        marginLeft: 10,
    },
    cardDetails: {
        marginLeft: 34,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    detailText: {
        marginLeft: 8,
    },
    gradientButton: {
        borderRadius: 50,
        padding: 0,
        margin: 0,
        height: 45,
        width: 45,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    searchInput: {
        backgroundColor: 'white',
    },
    filterChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        margin: 4,
        paddingLeft: 12,
    },
    chipText: {
        marginRight: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 18,
    },
    emptySubtext: {
        marginTop: 8,
        fontSize: 14,
        opacity: 0.6,
    },
});

export default ClassroomListScreen;