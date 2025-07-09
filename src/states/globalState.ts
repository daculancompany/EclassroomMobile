//@ts-nocheck
import {create} from 'zustand';
import {FileViewerModal} from '../components';

const useGlobalStore = create(set => ({
    loading: false,
    fileViewer: {visible: true, url: null, onDismiss: null},
    visible: false,
    notifications: [],
    addNotification: newNotification =>
        set(state => {
            const exists = state.notifications.some(
                n => n.id === newNotification.id,
            );
            return exists
                ? state
                : {notifications: [...state.notifications, newNotification]};
        }),
    removeNotification: id =>
        set(state => ({
            notifications: state.notifications.filter(n => n.id !== id),
        })),
    setNotifications: value => set({notifications: value}),
    setVisible: value => set({visible: value}),
    setField: (key, value) => set(() => ({[key]: value})),
    setLoading: value => set({loading: value}),
}));

export default useGlobalStore;
