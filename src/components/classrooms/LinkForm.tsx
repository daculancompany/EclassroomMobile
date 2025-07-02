// @ts-nocheck
import React, {useRef, useEffect, useState} from 'react';
import {
    View,
    TextInput as RNTextInput,
    TouchableOpacity,
    Animated,
    PanResponder,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    Keyboard,
    StyleSheet,
    TouchableWithoutFeedback,
} from 'react-native';
import {Text, useTheme} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Easing} from 'react-native';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const LinkForm = ({
    visible,
    onDismiss,
    currentLink,
    setCurrentLink,
    handleAddLink,
    submitLink,
}) => {
    const theme = useTheme();
    const [isMounted, setIsMounted] = useState(visible);
    const [error, setError] = useState('');
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const offsetY = useRef(0);

    const isValidUrl = url => {
        if (typeof url !== 'string') return false;
        const trimmedUrl = url.trim().toLowerCase();
        return (
            trimmedUrl.startsWith('http://') ||
            trimmedUrl.startsWith('https://')
        );
    };

    const handleValidatedSubmit = () => {
        if (!isValidUrl(currentLink)) {
            setError('Please enter a valid URL.');
            return;
        }
        setError('');
        handleAddLink();
    };

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) =>
                gestureState.dy > 5,
            onPanResponderMove: (_, gestureState) => {
                const newY = gestureState.dy + offsetY.current;
                if (newY > 0) translateY.setValue(newY);
            },
            onPanResponderRelease: (_, gestureState) => {
                const dragDistance = gestureState.dy;
                const velocity = gestureState.vy;
                const shouldClose = dragDistance > 120 || velocity > 1.2;

                if (shouldClose) {
                    Animated.timing(translateY, {
                        toValue: SCREEN_HEIGHT,
                        duration: 250,
                        useNativeDriver: true,
                    }).start(() => {
                        setIsMounted(false);
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
            },
        }),
    ).current;

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
                setIsMounted(false);
                onDismiss?.();
            });
        }
    }, [visible]);

    if (!isMounted) return null;

    return (
        <>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.backdrop} />
            </TouchableWithoutFeedback>

            <Animated.View
                {...panResponder.panHandlers}
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
                                        setIsMounted(false);
                                        onDismiss?.();
                                    });
                                }}
                                style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>×</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Content */}
                        <View style={styles.content}>
                            <Text
                                variant="titleMedium"
                                style={[
                                    styles.title,
                                    {color: theme.colors.onBackground},
                                ]}>
                                Paste a Link
                            </Text>

                            <RNTextInput
                                placeholder="https://example.com"
                                value={currentLink}
                                onChangeText={text => {
                                    setError('');
                                    setCurrentLink(text);
                                }}
                                keyboardType="url"
                                autoCapitalize="none"
                                autoCorrect={false}
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor:
                                            theme.colors.surfaceVariant,
                                        color: theme.colors.onSurface,
                                        borderColor:
                                            theme.colors.outlineVariant,
                                    },
                                ]}
                                placeholderTextColor={
                                    theme.colors.onSurfaceDisabled
                                }
                            />

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

                        {/* Footer */}
                        <View
                            style={[
                                styles.footer,
                                {
                                    borderTopColor: theme.colors.outlineVariant,
                                    backgroundColor: theme.colors.background,
                                },
                            ]}>
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    {
                                        backgroundColor:
                                            !currentLink?.trim() || submitLink
                                                ? theme.colors.surfaceDisabled
                                                : theme.colors.primary,
                                    },
                                ]}
                                onPress={handleValidatedSubmit}
                                disabled={!currentLink?.trim() || submitLink}>
                                <Text
                                    style={[
                                        styles.buttonText,
                                        {color: theme.colors.onPrimary},
                                    ]}>
                                    {submitLink ? 'Submitting...' : 'Confirm'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </SafeAreaView>
            </Animated.View>
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
        fontWeight: '600',
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
});

export default LinkForm;
