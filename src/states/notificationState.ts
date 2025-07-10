//@ts-nocheck
//https://chat.deepseek.com/a/chat/s/1ec44690-7ec4-4b51-a106-4c976928b6a2
import {create} from 'zustand';
import axiosConfig from '../utils/axiosConfig';

const useNotificationStore = create((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,

    // Fetch paginated notifications
    fetchNotifications: async (page = 1) => {
        set({isLoading: true, error: null});
        try {
            const response = await axiosConfig.get(
                `/notifications?page=${page}`,
            );
            set({
                notifications: response.data.data,
                currentPage: response.data.current_page,
                totalPages: response.data.last_page,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error.response?.data?.message || error.message,
                isLoading: false,
            });
        }
    },

    // Fetch unread count
    fetchUnreadCount: async () => {
        try {
            const response = await axiosConfig.get(
                '/notifications/unread-count',
            );
            set({unreadCount: response.data.count});
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    },

    // Mark notification as read
    markNotificationAsRead: async id => {
        try {
            // Optimistic update
            set(state => ({
                notifications: state.notifications.map(n =>
                    n.id === id ? {...n, read_at: new Date().toISOString()} : n,
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
            }));

            await axiosConfig.patch(`/notifications/${id}/read`);
        } catch (error) {
            // Rollback on error
            set(state => ({
                notifications: state.notifications.map(n =>
                    n.id === id ? {...n, read_at: null} : n,
                ),
                unreadCount: state.unreadCount + 1,
            }));
            console.error('Failed to mark as read:', error);
        }
    },

    // Mark all as read
    markAllNotificationsAsRead: async () => {
        try {
            // Optimistic update
            set(state => ({
                notifications: state.notifications.map(n => ({
                    ...n,
                    read_at: n.read_at || new Date().toISOString(),
                })),
                unreadCount: 0,
            }));

            await axiosConfig.post('/notifications/mark-all-read');
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    },

    // Delete notification
    deleteNotification: async id => {
        try {
            // Optimistic update
            const notification = get().notifications.find(n => n.id === id);
            set(state => ({
                notifications: state.notifications.filter(n => n.id !== id),
                unreadCount: notification?.read_at
                    ? state.unreadCount
                    : Math.max(0, state.unreadCount - 1),
            }));

            await axiosConfig.delete(`/notifications/${id}`);
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    },
}));

export default useNotificationStore;
