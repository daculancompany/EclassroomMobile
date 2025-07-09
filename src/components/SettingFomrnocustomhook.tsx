// @ts-nocheck
import React, {useRef, useEffect, useState} from 'react';
import {
    View,
    TextInput as RNTextInput,
    TouchableOpacity,
    Animated,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    Keyboard,
    StyleSheet,
    TouchableWithoutFeedback,
    Image,
    ScrollView,
} from 'react-native';
import {Text, useTheme, Portal, Avatar} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Easing} from 'react-native';
import {
    MainContainer,
    ButtonComponent,
    TextInputComponent,
    TextComponent,
} from '../components/';
import {Formik} from 'formik';
import {profileValidationSchema} from '../utils/validationHelper';
import {ERROR_COLOR} from '../utils/constant';
import * as ImagePicker from 'react-native-image-picker';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const SeetingsForm = ({
    visible,
    onDismiss,
    currentLink,
    setCurrentLink,
    handleAddLink,
    submitLink,
    profile,
}) => {
    const theme = useTheme();
    const [isMounted, setIsMounted] = useState(visible);
    const [error, setError] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const offsetY = useRef(0);
    const [editableProfile, setEditableProfile] = React.useState({
        fname: '',
        lname: '',
        email: '',
        phone: '',
        degree: '',
        year: '',
        imageUri: '',
    });
    const [isScrollAtTop, setIsScrollAtTop] = useState(true);
    const panGestureRef = useRef(null);

    const nameRef = useRef();
    const barcodeRef = useRef();
    const priceRef = useRef();
    const stockRef = useRef();
    const descriptionRef = useRef();
    const formikRef = useRef();

    React.useEffect(() => {
        if (visible && formikRef.current && profile?.profile?.fname) {
            formikRef.current.setFieldValue('fname', profile.profile.fname);
            formikRef.current.setFieldValue('lname', profile.profile.lname);
            formikRef.current.setFieldValue('mname', profile.profile.mname);
            formikRef.current.setFieldValue('phone', profile.profile.phone);
            setEditableProfile({
                imageUri: profile.imageUri || '',
                fname: profile.profile.fname || '',
                lname: profile.profile.lname || '',
            });
        }
    }, [visible, profile]);

    const onGestureEvent = Animated.event(
        [{ nativeEvent: { translationY: translateY } }],
        { useNativeDriver: true }
    );

    const onHandlerStateChange = event => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            const { translationY, velocityY } = event.nativeEvent;
            offsetY.current = translationY;
            const dragDistance = translationY;
            const shouldClose = dragDistance > 120 || velocityY > 1200;

            if (shouldClose) {
                Animated.timing(translateY, {
                    toValue: SCREEN_HEIGHT,
                    duration: 250,
                    useNativeDriver: true,
                }).start(() => {
                    setTimeout(() => {
                        setIsMounted(false);
                    }, 100);
                    onDismiss?.();
                });
            } else {
                Animated.spring(translateY, {
                    toValue: 0,
                    bounciness: 5,
                    useNativeDriver: true,
                }).start(() => {
                    offsetY.current = 0;
                });
            }
        }
    };

    useEffect(() => {
        if (visible) {
            setIsMounted(true);
            Animated.timing(translateY, {
                toValue: 0,
                duration: 250,
                easing: Easing.out(Easing.poly(4)),
                useNativeDriver: true,
            }).start(() => {
                offsetY.current = 0;
            });
        } else {
            Animated.timing(translateY, {
                toValue: SCREEN_HEIGHT,
                duration: 250,
                useNativeDriver: true,
            }).start(() => {
                setTimeout(() => {
                    setIsMounted(false);
                }, 100);
                onDismiss?.();
            });
        }
    }, [visible]);

    if (!isMounted) return null;

    const handleValidatedSubmit = () => {
        if (formikRef.current) {
            formikRef.current.handleSubmit();
        }
    };

    const submitForm = async (values, resetForm) => {
        console.log({values});
    };

    const pickImage = () => {
        const options = {
            title: 'Select Profile Picture',
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
        };

        ImagePicker.launchImageLibrary(options, response => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else if (response.assets && response.assets[0].uri) {
                setEditableProfile({
                    ...editableProfile,
                    imageUri: response.assets[0].uri,
                });
            }
        });
    };

    const handleScroll = event => {
        const offsetY = event.nativeEvent.contentOffset.y;
        console.log({offsetY})
        setIsScrollAtTop(offsetY <= 0);
    };

    return (
        <>
            <Portal>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>

                <PanGestureHandler
                    ref={panGestureRef}
                    onGestureEvent={onGestureEvent}
                    onHandlerStateChange={onHandlerStateChange}
                    activeOffsetY={10}
                    enabled={isScrollAtTop}>
                    <Animated.View
                        style={[
                            styles.sheetContainer,
                            {
                                transform: [{translateY}],
                                backgroundColor: theme.colors.elevation.level2,
                            },
                        ]}>
                        <SafeAreaView style={{flex: 1}} edges={['bottom']}>
                            <KeyboardAvoidingView
                                style={{flex: 1}}
                                behavior={
                                    Platform.OS === 'ios' ? 'padding' : undefined
                                }>
                                {/* Header */}
                                <View style={styles.header}>
                                    <View
                                        style={[
                                            styles.dragIndicator,
                                            {
                                                backgroundColor:
                                                    theme.colors.outlineVariant,
                                            },
                                        ]}
                                    />
                                    <TouchableOpacity
                                        onPress={() => {
                                            Animated.timing(translateY, {
                                                toValue: SCREEN_HEIGHT,
                                                duration: 200,
                                                useNativeDriver: true,
                                            }).start(() => {
                                                setTimeout(() => {
                                                    setIsMounted(false);
                                                }, 100);
                                                onDismiss?.();
                                            });
                                        }}
                                        style={styles.closeButton}>
                                        <Text style={styles.closeButtonText}>
                                            ×
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <ScrollView
                                    contentContainerStyle={styles.contentContainer}
                                    keyboardShouldPersistTaps="handled"
                                    showsVerticalScrollIndicator={false}
                                    onScroll={({nativeEvent}) => {
                                        const {contentOffset} = nativeEvent;
                                        setIsScrolled(contentOffset.y > 0);
                                    }}
                                    scrollEventThrottle={16}
                                    onScroll={handleScroll}>
                                    {/* Content */}
                                    <View style={styles.content}>
                                        <Text
                                            variant="titleLarge"
                                            style={[styles.title]}>
                                            Edit Profile
                                        </Text>
                                        <Formik
                                            innerRef={formikRef}
                                            validationSchema={
                                                profileValidationSchema
                                            }
                                            initialValues={{
                                                fname:
                                                    profile?.profile?.fname || '',
                                                lname:
                                                    profile?.profile?.lname || '',
                                                mname:
                                                    profile?.profile?.mname || '',
                                                phone:
                                                    profile?.profile?.phone || '',
                                            }}
                                            onSubmit={(values, {resetForm}) => {
                                                console.log(
                                                    'Submitted values:',
                                                    values,
                                                );
                                                submitForm(values, resetForm);
                                            }}>
                                            {({
                                                setFieldValue,
                                                handleChange,
                                                handleBlur,
                                                handleSubmit,
                                                values,
                                                errors,
                                                isValid,
                                            }) => (
                                                <>
                                                    <View
                                                        style={
                                                            styles.imagePickerContainer
                                                        }>
                                                        {editableProfile.imageUri ? (
                                                            <Image
                                                                source={{
                                                                    uri: editableProfile.imageUri,
                                                                }}
                                                                style={
                                                                    styles.profileImage
                                                                }
                                                            />
                                                        ) : (
                                                            <Avatar.Text
                                                                size={100}
                                                                label={
                                                                    (editableProfile?.fname?.charAt(
                                                                        0,
                                                                    ) || '') +
                                                                        (editableProfile?.lname?.charAt(
                                                                            0,
                                                                        ) || '') ||
                                                                    'JD'
                                                                }
                                                                style={{
                                                                    backgroundColor:
                                                                        theme.colors
                                                                            .primary,
                                                                }}
                                                            />
                                                        )}
                                                        <ButtonComponent
                                                            label="Change Profile Photo"
                                                            mode="outlined"
                                                            onPress={pickImage}
                                                            style={
                                                                styles.imagePickerButton
                                                            }
                                                            textColor={
                                                                theme.colors.primary
                                                            }
                                                        />
                                                    </View>

                                                    <TextInputComponent
                                                        label="First Name"
                                                        onChangeText={handleChange(
                                                            'fname',
                                                        )}
                                                        onBlur={handleBlur('fname')}
                                                        value={values.fname}
                                                        error={
                                                            errors.fname
                                                                ? true
                                                                : false
                                                        }
                                                        errorText={errors.fname}
                                                        inputRef={nameRef}
                                                        returnKeyType="next"
                                                        onSubmitEditing={() =>
                                                            barcodeRef.current?.focus()
                                                        }
                                                    />
                                                    <TextInputComponent
                                                        label="Last Name"
                                                        onChangeText={handleChange(
                                                            'lname',
                                                        )}
                                                        onBlur={handleBlur('lname')}
                                                        value={values.lname}
                                                        error={
                                                            errors.lname
                                                                ? true
                                                                : false
                                                        }
                                                        errorText={errors.lname}
                                                        inputRef={nameRef}
                                                        returnKeyType="next"
                                                        onSubmitEditing={() =>
                                                            barcodeRef.current?.focus()
                                                        }
                                                    />
                                                    <TextInputComponent
                                                        label="Middle Name"
                                                        onChangeText={handleChange(
                                                            'mname',
                                                        )}
                                                        onBlur={handleBlur('mname')}
                                                        value={values.mname}
                                                        error={
                                                            errors.mname
                                                                ? true
                                                                : false
                                                        }
                                                        errorText={errors.mname}
                                                        inputRef={nameRef}
                                                        returnKeyType="next"
                                                        onSubmitEditing={() =>
                                                            barcodeRef.current?.focus()
                                                        }
                                                    />
                                                    <TextInputComponent
                                                        label="Contact Number"
                                                        onChangeText={handleChange(
                                                            'phone',
                                                        )}
                                                        onBlur={handleBlur('phone')}
                                                        value={values.phone}
                                                        error={
                                                            errors.phone
                                                                ? true
                                                                : false
                                                        }
                                                        errorText={errors.phone}
                                                        inputRef={nameRef}
                                                        returnKeyType="next"
                                                        onSubmitEditing={() =>
                                                            barcodeRef.current?.focus()
                                                        }
                                                    />
                                                </>
                                            )}
                                        </Formik>

                                        {error ? (
                                            <Text
                                                style={{
                                                    color: theme.colors.error,
                                                    marginTop: 8,
                                                }}>
                                                {error}
                                            </Text>
                                        ) : null}
                                    </View>
                                </ScrollView>

                                {/* Footer */}
                                <View
                                    style={[
                                        styles.footer,
                                        {
                                            borderTopColor:
                                                theme.colors.outlineVariant,
                                            backgroundColor:
                                                theme.colors.background,
                                        },
                                    ]}>
                                    <ButtonComponent
                                        mode="contained"
                                        onPress={handleValidatedSubmit}
                                        loading={submitLink}
                                        disabled={
                                            submitLink ||
                                            !formikRef.current?.isValid ||
                                            !formikRef.current?.dirty
                                        }
                                        label={
                                            submitLink
                                                ? 'Submitting...'
                                                : 'Save Changes'
                                        }></ButtonComponent>
                                </View>
                            </KeyboardAvoidingView>
                        </SafeAreaView>
                    </Animated.View>
                </PanGestureHandler>
            </Portal>
        </>
    );
};

const styles = StyleSheet.create({
    sheetContainer: {
        position: 'absolute',
        bottom: 0,
        height: '85%',
        width: '100%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        elevation: 15,
        zIndex: 999,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -3},
        shadowOpacity: 0.1,
        shadowRadius: 10,
        overflow: 'hidden',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 998,
    },
    header: {
        paddingTop: 16,
        paddingBottom: 10,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    dragIndicator: {
        width: 40,
        height: 5,
        borderRadius: 3,
    },
    closeButton: {
        position: 'absolute',
        right: 16,
        top: 10,
        backgroundColor: '#00000040',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        lineHeight: 24,
    },
    content: {
        flex: 1,
        padding: 24,
    },
    title: {
        marginBottom: 16,
        fontSize: 18,
        textAlign: 'center',
    },
    input: {
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
    },
    button: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
    },
    buttonText: {
        fontWeight: '600',
        fontSize: 16,
    },
    imagePickerContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
    },
    imagePickerButton: {
        marginTop: 10,
    },
    input: {
        marginBottom: 15,
        backgroundColor: 'transparent',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    editButton: {
        flex: 1,
        marginHorizontal: 5,
    },
});

export default SeetingsForm;
