//@ts-nocheck
import React from 'react';
import {View, StyleSheet} from 'react-native';
import {IconButton, Chip} from 'react-native-paper';
import {Text, useTheme} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const HeaderWithStatus = ({handleClose, status = 'assigned'}) => {
    const theme = useTheme();
    const dynamicStyles = StyleSheet.create({
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
        },
        headerTitle: {
            fontSize: 20,
            fontWeight: 'bold',
        },
    });

    const getStatusProps = status => {
        switch (status.toLowerCase()) {
            case 'done':
                return {
                    label: 'Done',
                    icon: 'check-circle-outline',
                    backgroundColor: '#E8F5E9',
                    textColor: '#2E7D32',
                };
            case 'assigned':
            default:
                return {
                    label: 'Assigned',
                    icon: 'clipboard-text-outline',
                    backgroundColor: '#E3F2FD',
                    textColor: '#1565C0',
                };
        }
    };

    const {label, icon, backgroundColor, textColor} = getStatusProps(status);

    return (
        <View style={dynamicStyles.header}>
            <View style={styles.closeHeader}>
                <IconButton
                    icon="close"
                    onPress={handleClose}
                    style={styles.closeButton}
                />
                <Text style={dynamicStyles.headerTitle}>Your Work</Text>
            </View>

            <View style={styles.statusContainer}>
                <Chip
                    icon={() => (
                        <MaterialCommunityIcons
                            name={icon}
                            size={18}
                            color={textColor}
                        />
                    )}
                    style={[styles.statusChip, {backgroundColor}]}
                    textStyle={[styles.statusText, {color: textColor}]}>
                    {label}
                </Chip>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    closeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    closeButton: {
        marginRight: 8,
    },
    statusContainer: {
        marginTop: 8,
        alignItems: 'flex-start',
    },
    statusChip: {
        paddingHorizontal: 6,
        paddingVertical: 0,
    },
    statusText: {
        fontWeight: '600',
    },
});

export default HeaderWithStatus;
