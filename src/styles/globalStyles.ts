//@ts-nocheck
import {StyleSheet} from 'react-native';
import {useTheme} from 'react-native-paper';

export const useGlobalStyles = () => {
    const theme = useTheme(); // works only inside React component or hook

    return StyleSheet.create({
        container: {
            flex: 1,
            padding: 16,
            // backgroundColor: theme.colors.background,
        },

        assignmentCard: {
            margin: 8,
            borderRadius: 8,
            backgroundColor: theme.colors.elevation.level1,
            shadowColor: theme.colors.shadow,
            // Android shadow
            elevation: 5,

            // iOS shadow
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.3,
            shadowRadius: 4,
        },

        assignmentContent: {
            padding: 16,
        },
        assignmentTitle: {
            marginBottom: 8,
            fontWeight: 'bold',
            fontSize: 16,
            color: theme.colors.onSurface,
        },
        assignmentDetailsRow: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 8,
        },
        assignmentDetailItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        assignmentDetailText: {
            color: theme.colors.onSurfaceVariant,
            fontSize: 14,
        },
        assignmentStatusBadge: status => ({
            alignSelf: 'flex-start',
            backgroundColor:
                status === 'late'
                    ? theme.colors.errorContainer
                    : status === 'graded'
                    ? theme.colors.secondaryContainer
                    : theme.colors.primaryContainer,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            marginTop: 4,
        }),
        assignmentStatusText: {
            color: theme.colors.onPrimaryContainer,
            fontSize: 12,
            fontWeight: '500',
        },
        textCenter: {
            textAlign: 'center',
        },
        textPrimary: {
            color: theme.colors.primary,
        },
        statusContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            textAlign: 'center',
            flex: 1,
            justifyContent: 'center',
        },
        statusText: {
            marginLeft: 8,
        },
        presentCell: {
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
        },
        absentCell: {
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
        },
        lateCell: {
            backgroundColor: 'rgba(255, 152, 0, 0.1)',
        },
        emptyContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
            marginTop: 50,
        },
        emptyIcon: {
            backgroundColor: '#e0e0e0',
            marginBottom: 16,
        },
        emptyTitle: {
            fontSize: 18,
            fontWeight: '600',
            marginBottom: 8,
        },
        emptySubtitle: {
            fontSize: 14,
            color: '#777',
            textAlign: 'center',
        },
    });
};
