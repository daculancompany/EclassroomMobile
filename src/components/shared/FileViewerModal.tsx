// @ts-nocheck
import React from 'react';
import {
    List,
    IconButton,
    Modal,
    ActivityIndicator,
    useTheme,
} from 'react-native-paper';
import {WebView} from 'react-native-webview';
import {View, StyleSheet} from 'react-native';
import useGlobalStore from '../../states/globalState';

const FileViewerModal = () => {
    const theme = useTheme();
    const {fileViewer, setField} = useGlobalStore();
    console.log({fileViewer});
    if (!fileViewer?.url) {
        return null;
    }

    return (
        <Modal
            visible={fileViewer.visible}
            onDismiss={() =>
                setField('fileViewer', {visible: false, url: null})
            }
            contentContainerStyle={[
                styles.modalContent,
                {backgroundColor: theme.colors.background},
            ]}>
            <View style={styles.container}>
                <WebView
                    source={{uri: fileViewer.url}}
                    style={styles.webview}
                    startInLoadingState={true}
                    renderLoading={() => (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" />
                        </View>
                    )}
                    onError={e => {
                        console.log('WebView error:', e.nativeEvent);
                    }}
                />
                <IconButton
                    icon="close"
                    style={styles.closeButton}
                    onPress={() =>
                        setField('fileViewer', {visible: false, url: null})
                    }
                />
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContent: {
        flex: 1,
        borderRadius: 8,
        margin: 20,
    },
    container: {
        flex: 1,
    },
    webview: {
        flex: 1,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        right: 10,
        top: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 2,
    },
});

export default FileViewerModal;
