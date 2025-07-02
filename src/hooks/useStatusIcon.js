import { useMemo } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const useStatusIcon = (status) => {
    return useMemo(() => {
        switch (status) {
            case 'present':
                return <Icon name="check-circle" size={20} color="#4CAF50" />;
            case 'absent':
                return <Icon name="close-circle" size={20} color="#F44336" />;
            case 'late':
                return <Icon name="clock-alert" size={20} color="#FF9800" />;
            default:
                return null;
        }
    }, [status]);
};

export default useStatusIcon;