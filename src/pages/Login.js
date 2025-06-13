//@ts-nocheck
import React, {useState} from 'react';
import {View, StyleSheet, Keyboard, Alert} from 'react-native';
import {Formik} from 'formik';
import {
    TextInput,
    Button,
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

const Login = ({navigation}) => {
    const {checkLogin, loading, setLoading} = useLoginStore();
    const theme = useTheme();
    const {colors} = theme;
    const {isDarkTheme} = useThemeStore();
    const [email, setEmail] = useState('niel.daculan@gmail.com');
    const [password, setPassword] = useState('password123');
    const [showPassword, setShowPassword] = useState(false);

    const themeStyles = {
        container: {
            ...styles.container,
            backgroundColor: theme.colors.background,
        },
        title: {
            ...styles.title,
            color: theme.colors.text,
        },
    };

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const submitForm = async values => {
        //   await AsyncStorage.setItem('token', "access_token");
        //   return
        setLoading(true);
        Keyboard.dismiss();

        try {
            const response = await checkLogin(values);

            if (!response?.error) {
                const {access_token} = response?.data;
                await AsyncStorage.setItem('token', access_token);
                await AsyncStorage.setItem('user', JSON.stringify(response));
                navigation.navigate('Main');
            } else {
                Alert.alert(
                    'Login Failed',
                    response?.message || 'An unknown error occurred.',
                );
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }

        setLoading(false);
    };

    return (
        <CenterContainer>
            <TextComponent variant="titleLarge">
                Login to continue
            </TextComponent>
            <KeyboardAwareScrollView keyboardShouldPersistTaps="always">
                <Formik
                    validationSchema={loginValidationSchema}
                    initialValues={{email: 'niel.daculan@gmail.com', password: 'password123'}}
                    onSubmit={values => submitForm(values)}>
                    {(
                        {
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            values,
                            errors,
                            isValid,
                        }, // console.log({errors}),
                    ) => (
                        <>
                            <TextInputComponent
                                label="Email"
                                onChangeText={handleChange('email')}
                                onBlur={handleBlur('email')}
                                value={values.email}
                                error={errors.email ? true : false}
                                errorText={errors.email}
                            />
                            <View style={styles.containerPassword}>
                                <TextInputComponent
                                    secureTextEntry={!showPassword}
                                    label="Password"
                                    onChangeText={handleChange('password')}
                                    onBlur={handleBlur('password')}
                                    value={values.password}
                                    error={errors.password ? true : false}
                                    errorText={errors.password}
                                />
                                <Icon
                                    name={showPassword ? 'eye' : 'eye-off'}
                                    size={20}
                                    color="#aaa"
                                    style={[
                                        styles.icon,
                                        {
                                            marginTop: errors.password
                                                ? -10
                                                : 10,
                                        },
                                    ]}
                                    onPress={toggleShowPassword}
                                />
                            </View>
                            <View style={styles.forgotPassword}>
                                <TouchableRipple
                                    onPress={() => setForgotPassword(true)}>
                                    <Text style={[{color: colors?.textColor}]}>
                                        Forgot Password?
                                    </Text>
                                </TouchableRipple>
                            </View>
                            {/* <ButtonComponent label="Login"  onPress={handleSubmit} /> */}
                            <ButtonComponent
                                label="Login"
                                onPress={handleSubmit}
                                disabled={loading}
                                loading={loading}
                            />
                        </>
                    )}
                </Formik>
            </KeyboardAwareScrollView>
        </CenterContainer>
    );
};

const styles = StyleSheet.create({
    title: {
        fontWeight: 'bold',
        fontSize: 25,
        textAlign: 'center',
        color: '#fff',
        marginTop: 20,
    },
    loginText: {
        marginTop: 30,
        marginBottom: 10,
        textAlign: 'center',
        color: '#fff',
    },
    footerSection: {
        marginTop: 20,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 50,
        flex: 1,
    },
    footerSectionText: {
        marginLeft: 5,
        fontWeight: 'bold',
        paddingLeft: 2,
        paddingRight: 5,
    },
    forgotPassword: {
        alignItems: 'flex-end',
    },
    icon: {
        marginLeft: -25,
        // paddingTop: 10
        // position: 'absolute'
    },
    containerPassword: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '99%',
    },
});

export default Login;
