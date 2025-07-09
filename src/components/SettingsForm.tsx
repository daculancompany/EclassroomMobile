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
import {Formik} from 'formik';
import {PanGestureHandler} from 'react-native-gesture-handler';
import ImagePicker from 'react-native-image-crop-picker';

// Import custom hooks
import {useBottomSheetAnimation} from '../hooks/bottomSheet/useBottomSheetAnimation';
import {useGestureHandling} from '../hooks/bottomSheet/useGestureHandling';
import {useScrollHandling} from '../hooks/bottomSheet/useScrollHandling';

// Import components and utilities
import {ButtonComponent, TextInputComponent} from '../components/';
import {profileValidationSchema} from '../utils/validationHelper';
import useProfileStore from '../states/profileState';
import {PROFILE, ATTENDANCE_PROFILE} from '../utils/constant';
import {useQueryClient} from 'react-query';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

const SeetingsForm = ({
    visible,
    onDismiss,
    currentLink,
    setCurrentLink,
    handleAddLink,
    submitLink,
    profile,
}) => {
    const queryClient = useQueryClient();
    const theme = useTheme();
    const [error, setError] = useState('');
    const formikRef = useRef();
    const panGestureRef = useRef();
    const [editableProfile, setEditableProfile] = React.useState({
        fname: '',
        lname: '',
        email: '',
        phone: '',
        degree: '',
        year: '',
        imageUri: '',
        attendance_profile: '',
    });
    const {setField, updateProfile} = useProfileStore();
    const [submit, setSubmit] = React.useState(false);

    const {isMounted, translateY, offsetY, closeSheet} =
        useBottomSheetAnimation(visible, onDismiss);
    const {isScrollAtTop, isScrolled, handleScroll} = useScrollHandling();
    const {onGestureEvent, onHandlerStateChange} = useGestureHandling(
        translateY,
        offsetY,
        closeSheet,
    );

    const nameRef = useRef();
    const [imageVersion, setImageVersion] = React.useState(0);
    const refreshImage = () => setImageVersion(v => v + 1);

    React.useEffect(() => {
        if (visible && profile) {
            refreshImage();
            formikRef?.current?.setFieldValue('fname', profile.profile.fname);
            formikRef?.current?.setFieldValue('lname', profile.profile.lname);
            formikRef?.current?.setFieldValue('mname', profile.profile.mname);
            formikRef?.current?.setFieldValue('phone', profile.profile.phone);
            setEditableProfile({
                imageUri: profile?.user.image
                    ? PROFILE + profile?.user.image
                    : '',
                attendance_profile: profile?.profile.attendance_profile
                    ? ATTENDANCE_PROFILE + profile?.profile.attendance_profile
                    : '',
                fname: profile.profile.fname || '',
                lname: profile.profile.lname || '',
            });
        }
    }, [visible, profile]);

    const handleValidatedSubmit = () => {
        if (formikRef.current) {
            formikRef.current.handleSubmit();
        }
    };

    const submitForm = async (values, resetForm) => {
        setSubmit(true);
        values.image = editableProfile.imageUri;
        values.attendance_profile = editableProfile.attendance_profile;
        const res = await updateProfile(values);
        setSubmit(false);
        queryClient.invalidateQueries('profile');
    };

    const pickImage = () => {
        ImagePicker.openPicker({
            width: 200,
            height: 200,
            cropping: true,
            compressImageQuality: 0.5,
            mediaType: 'photo',
        })
            .then(image => {
                if (image.path) {
                    setEditableProfile({
                        ...editableProfile,
                        imageUri: image.path,
                    });
                }
            })
            .catch(error => {
                if (error.code !== 'E_PICKER_CANCELLED') {
                    console.log('ImagePicker Error: ', error);
                }
            });
    };

    const pickImage2 = () => {
        ImagePicker.openPicker({
            width: 200,
            height: 200,
            cropping: true,
            compressImageQuality: 0.5,
            mediaType: 'photo',
        })
            .then(image => {
                if (image.path) {
                    setEditableProfile({
                        ...editableProfile,
                        attendance_profile: image.path,
                    });
                }
            })
            .catch(error => {
                if (error.code !== 'E_PICKER_CANCELLED') {
                    console.log('ImagePicker Error: ', error);
                }
            });
    };

    if (!isMounted) return null;

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
                                    Platform.OS === 'ios'
                                        ? 'padding'
                                        : undefined
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
                                    contentContainerStyle={
                                        styles.contentContainer
                                    }
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
                                                    profile?.profile?.fname ||
                                                    '',
                                                lname:
                                                    profile?.profile?.lname ||
                                                    '',
                                                mname:
                                                    profile?.profile?.mname ||
                                                    '',
                                                phone:
                                                    profile?.profile?.phone ||
                                                    '',
                                            }}
                                            onSubmit={(values, {resetForm}) => {
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
                                                            <Avatar.Image
                                                                size={120}
                                                                source={{
                                                                    uri: editableProfile.imageUri,
                                                                }}
                                                                key={
                                                                    editableProfile.imageUri
                                                                }
                                                                style={[
                                                                    styles.avatar,
                                                                    {
                                                                        backgroundColor:
                                                                            theme
                                                                                .colors
                                                                                .surface,
                                                                    },
                                                                ]}
                                                            />
                                                        ) : (
                                                            <Avatar.Text
                                                                size={100}
                                                                label={
                                                                    (profile.profile?.fname?.charAt(
                                                                        0,
                                                                    ) || '') +
                                                                        (profile.profile?.lname?.charAt(
                                                                            0,
                                                                        ) ||
                                                                            '') ||
                                                                    'JD'
                                                                }
                                                                style={{
                                                                    backgroundColor:
                                                                        theme
                                                                            .colors
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
                                                                theme.colors
                                                                    .primary
                                                            }
                                                        />
                                                    </View>
                                                    <View
                                                        style={
                                                            styles.imagePickerContainer
                                                        }>
                                                        {editableProfile.attendance_profile ? (
                                                            <Avatar.Image
                                                                size={120}
                                                                source={{
                                                                    uri: editableProfile.attendance_profile
                                                                        ? `${editableProfile.attendance_profile}?v=${imageVersion}`
                                                                        : '',
                                                                }}
                                                                style={[
                                                                    styles.avatar,
                                                                    {
                                                                        backgroundColor:
                                                                            theme
                                                                                .colors
                                                                                .surface,
                                                                    },
                                                                ]}
                                                            />
                                                        ) : (
                                                            <Avatar.Text
                                                                size={100}
                                                                label={'N/A'}
                                                                style={{
                                                                    backgroundColor:
                                                                        theme
                                                                            .colors
                                                                            .primary,
                                                                }}
                                                            />
                                                        )}
                                                        <ButtonComponent
                                                            label="Change Attendance Photo"
                                                            mode="outlined"
                                                            onPress={pickImage2}
                                                            style={
                                                                styles.imagePickerButton
                                                            }
                                                            textColor={
                                                                theme.colors
                                                                    .primary
                                                            }
                                                        />
                                                    </View>

                                                    <TextInputComponent
                                                        label="First Name"
                                                        onChangeText={handleChange(
                                                            'fname',
                                                        )}
                                                        onBlur={handleBlur(
                                                            'fname',
                                                        )}
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
                                                        onBlur={handleBlur(
                                                            'lname',
                                                        )}
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
                                                        onBlur={handleBlur(
                                                            'mname',
                                                        )}
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
                                                        onBlur={handleBlur(
                                                            'phone',
                                                        )}
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
                                        loading={submit}
                                        disabled={submit}
                                        label={
                                            submit
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
        height: 45,
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
