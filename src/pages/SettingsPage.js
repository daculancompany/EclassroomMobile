import * as React from 'react';
import {View, StyleSheet, Alert} from 'react-native'; // <-- Import Alert
import {
    Provider as PaperProvider,
    Avatar,
    Title,
    Paragraph,
    Button,
    Card,
    useTheme,
    DefaultTheme,
    DarkTheme,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Ensure this is imported
import {useNavigation} from '@react-navigation/native'; // <-- Import navigation hook

// Toggle between themes (optional)
const isDarkMode = false; // change to true for dark theme

const ProfileScreen = () => {
    const theme = useTheme();
    const navigation = useNavigation(); // <-- Get navigation object

    const confirmLogout = () => {
        Alert.alert(
            'Confirm Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.removeItem('userToken');
                        navigation.navigate('Login');
                    },
                },
            ],
            {cancelable: true}
        );
    };

    return (
        <View
            style={[
                styles.container,
                {backgroundColor: theme.colors.onBackground},
            ]}>
            <Avatar.Image
                size={120}
                source={{uri: 'https://via.placeholder.com/150'}}
                style={styles.avatar}
            />
            <Title style={{color: theme.colors.primary}}>John Doe</Title>
            <Paragraph style={{color: theme.colors.onSurface}}>
                B.Sc Computer Science
            </Paragraph>
            <Paragraph style={{color: theme.colors.onSurface}}>
                Year: 3rd
            </Paragraph>

            <Card style={styles.card}>
                <Card.Content>
                    <Paragraph>Email: johndoe@example.com</Paragraph>
                    <Paragraph>Phone: +1234567890</Paragraph>
                </Card.Content>
            </Card>

            <Button
                mode="contained"
                onPress={() => console.log('Edit Profile')}
                style={styles.button}>
                Edit Profile
            </Button>

            <Button
                mode="outlined"
                onPress={confirmLogout}
                style={styles.logoutButton}
                textColor={theme.colors.error}>
                Logout
            </Button>
        </View>
    );
};

const App = () => {
    return (
        <PaperProvider theme={isDarkMode ? DarkTheme : DefaultTheme}>
            <ProfileScreen />
        </PaperProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 50,
    },
    avatar: {
        marginBottom: 20,
    },
    card: {
        width: '90%',
        marginVertical: 20,
    },
    button: {
        marginTop: 10,
        width: '60%',
        borderRadius: 25,
    },
    logoutButton: {
        marginTop: 10,
        width: '60%',
        borderRadius: 25,
        borderColor: 'red',
    },
});

export default App;
