//@ts-nocheck
import React, {useRef, useState, useEffect} from 'react';
import {
    Platform,
    Alert,
    View,
    Button,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
} from 'react-native';
import {Camera, useCameraDevices} from 'react-native-vision-camera';
import {useScanBarcodes, BarcodeFormat} from 'vision-camera-code-scanner';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CameraCapture = ({onImageCapture}) => {
    const cameraRef = useRef(null);
    const [hasPermission, setHasPermission] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [flashMode, setFlashMode] = useState('off');
    const [cameraPosition, setCameraPosition] = useState('back');
    const devices = useCameraDevices();
    const device = cameraPosition === 'back' ? devices.back : devices.front;

    useEffect(() => {
        (async () => {
            const status = await Camera.requestCameraPermission();
            setHasPermission(status === 'authorized');
        })();
    }, []);

    const takePhoto = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.takePhoto({
                    flash: flashMode,
                    qualityPrioritization: 'quality',
                    skipMetadata: true,
                });

                if (photo?.path) {
                    setCapturedImage(photo.path);
                    if (onImageCapture) {
                        onImageCapture(photo.path);
                    }
                } else {
                    Alert.alert('Error', 'Photo capture returned no path');
                }
            } catch (error) {
                Alert.alert('Error', 'Failed to capture photo');
                console.error('Capture error:', error);
            }
        }
    };

    const toggleFlash = () => {
        setFlashMode(prev =>
            prev === 'auto' ? 'on' : prev === 'on' ? 'off' : 'auto',
        );
    };

    const toggleCameraPosition = () => {
        setCameraPosition(prev => (prev === 'back' ? 'front' : 'back'));
    };

    const retakePhoto = () => {
        setCapturedImage(null);
    };

    if (hasPermission === null) {
        return (
            <View style={styles.permissionContainer}>
                <Text>Requesting camera permissions...</Text>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View style={styles.permissionContainer}>
                <Text>No access to camera</Text>
                <Button
                    title="Request Permissions"
                    onPress={async () => {
                        const status = await Camera.requestCameraPermission();
                        setHasPermission(status === 'authorized');
                    }}
                />
            </View>
        );
    }

    if (!device) {
        return (
            <View style={styles.permissionContainer}>
                <Text>Camera device not found</Text>
            </View>
        );
    }

    if (capturedImage) {
        return (
            <View style={styles.container}>
                <Image
                    source={{uri: `file://${capturedImage}`}}
                    style={styles.previewImage}
                />
                <View style={styles.buttonGroup}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={retakePhoto}>
                        <Icon name="camera" size={30} color="#fff" />
                        <Text style={styles.buttonText}>Retake</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Camera
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                photo={true}
                torch={flashMode === 'on' ? 'on' : 'off'}
                preset="high"
                orientation="portrait"
            />

            <View style={styles.controlsContainer}>
                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={toggleFlash}>
                    <Icon
                        name={flashMode === 'off' ? 'flash-off' : 'flash-on'}
                        size={30}
                        color="#fff"
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.captureButton}
                    onPress={takePhoto}>
                    <View style={styles.captureButtonInner} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.controlButton}
                    onPress={toggleCameraPosition}>
                    <Icon name="flip-camera-android" size={30} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

// Keep the same styles as in your original code
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewImage: {
        flex: 1,
        resizeMode: 'contain',
        backgroundColor: 'black',
    },
    controlsContainer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    controlButton: {
        padding: 15,
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
    },
    buttonGroup: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 15,
        borderRadius: 30,
    },
    buttonText: {
        color: '#fff',
        marginLeft: 10,
        fontSize: 16,
    },
});

export default CameraCapture;
