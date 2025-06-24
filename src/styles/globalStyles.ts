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
            elevation: 2,
            backgroundColor: theme.colors.surface,
            shadowColor: theme.colors.shadow,
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
        textCenter:{
            textAlign: 'center',
        },
        textPrimary:{
            color: theme.colors.primary,
        }
    });
};
