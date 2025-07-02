//@ts-nocheck
import React, {useState} from 'react';
import {
    View,
    StyleSheet,
    Keyboard,
    Alert,
    Image,
    Dimensions,
} from 'react-native';
import {Formik} from 'formik';
import {
    Text,
    useTheme,
    TouchableRipple,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useThemeStore} from '../../App';
import {
    ButtonComponent,
    TextComponent,
    TextInputComponent,
    CenterContainer,
} from '../components/';
import {loginValidationSchema} from '../utils/validationHelper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import useLoginStore from '../states/loginState';
import  logo from "../assets/images/site-logo.png";

const {width} = Dimensions.get('window');

const Login = ({navigation}) => {
    const {checkLogin, loading, setLoading} = useLoginStore();
    const theme = useTheme();
    const {colors} = theme;
    const {isDarkTheme} = useThemeStore();
    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const submitForm = async values => {
        setLoading(true);
        Keyboard.dismiss();

        try {
            const response = await checkLogin(values);

            if (!response?.error) {
                const {access_token} = response?.data;
                await AsyncStorage.setItem('token', access_token);
                await AsyncStorage.setItem('user', JSON.stringify(response?.data));
                navigation.navigate('Main');
            } else {
                Alert.alert('Login Failed', response?.message || 'An unknown error occurred.');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }

        setLoading(false);
    };

    return (
        <CenterContainer style={styles.root}>
            <KeyboardAwareScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled">
                {/* Logo */}
                <Image
                    source={logo} 
                    style={styles.logo}
                    resizeMode="contain"
                />

                {/* App Name / Tagline */}
                <TextComponent variant="titleLarge" style={styles.appTitle}>
                   Classtrack
                </TextComponent>
                <TextComponent variant="bodyMedium" style={styles.tagline}>
                   "Track Every Student. Simplify Every Class."
                </TextComponent>

                {/* Login Form */}
                <Formik
                    validationSchema={loginValidationSchema}
                    initialValues={{
                        email: 'niel.daculan@gmail.com',
                        password: 'password123',
                    }}
                    onSubmit={submitForm}>
                    {({handleChange, handleBlur, handleSubmit, values, errors}) => (
                        <View style={styles.formContainer}>
                            <TextInputComponent
                                label="Email"
                                onChangeText={handleChange('email')}
                                onBlur={handleBlur('email')}
                                value={values.email}
                                error={!!errors.email}
                                errorText={errors.email}
                            />

                            <View style={styles.containerPassword}>
                                <TextInputComponent
                                    secureTextEntry={!showPassword}
                                    label="Password"
                                    onChangeText={handleChange('password')}
                                    onBlur={handleBlur('password')}
                                    value={values.password}
                                    error={!!errors.password}
                                    errorText={errors.password}
                                />
                                <Icon
                                    name={showPassword ? 'eye' : 'eye-off'}
                                    size={20}
                                    color="#aaa"
                                    style={[
                                        styles.icon,
                                        {
                                            marginTop: errors.password ? -10 : 10,
                                        },
                                    ]}
                                    onPress={toggleShowPassword}
                                />
                            </View>

                            <View style={styles.forgotPassword}>
                                <TouchableRipple onPress={() => {}}>
                                    <Text style={{ color: theme.colors.text }} >
                                        Forgot Password?
                                    </Text>
                                </TouchableRipple>
                            </View>

                            <ButtonComponent
                                label="Login"
                                onPress={handleSubmit}
                                disabled={loading}
                                loading={loading}
                            />
                        </View>
                    )}
                </Formik>
            </KeyboardAwareScrollView>
        </CenterContainer>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 20,
    },
    logo: {
        width: width * 0.4,
        height: width * 0.4,
        marginBottom: 10,
    },
    appTitle: {
        fontWeight: 'bold',
        fontSize: 24,
        marginBottom: 4,
        textAlign: 'center',
    },
    tagline: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    formContainer: {
        width: '90%',
    },
    forgotPassword: {
        alignItems: 'flex-end',
        marginTop: 8,
        marginBottom: 12,
    },
    icon: {
        marginLeft: -25,
    },
    containerPassword: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
});

export default Login;
