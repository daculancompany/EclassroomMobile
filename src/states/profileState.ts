//@ts-nocheck
import {create} from 'zustand';
import dayjs from 'dayjs';
import {delay} from '../utils/helper';
import axiosConfig from '../utils/axiosConfig';

const useProfileStore = create(set => ({
    studentSubmission: false,
    setField: (key, value) => set(() => ({[key]: value})),
    updateProfile: async (params: any) => {
        const formData = new FormData();

        // Append text fields
        formData.append('fname', params.fname);
        formData.append('lname', params.lname);
        formData.append('mname', params.mname || '');
        formData.append('phone', params.phone);

        // Append image if exists
        if (params.image) {
            // Extract filename from URI if available
            const filename = params.image.split('/').pop();

            // Extract file extension
            const match = /\.(\w+)$/.exec(filename || '');
            const type = match ? `image/${match[1]}` : 'image';

            formData.append('image', {
                uri: params.image,
                name: filename || `profile_image.${match?.[1] || 'jpg'}`,
                type: type,
            } as any); // Type assertion needed for React Native
        }

         if (params.attendance_profile) {
            // Extract filename from URI if available
            const filename = params.attendance_profile.split('/').pop();

            // Extract file extension
            const match = /\.(\w+)$/.exec(filename || '');
            const type = match ? `image/${match[1]}` : 'image';

            formData.append('attendance_profile', {
                uri: params.attendance_profile,
                name: filename || `attendance_profile_image.${match?.[1] || 'jpg'}`,
                type: type,
            } as any); // Type assertion needed for React Native
        }
        

        try {
            const response = await axiosConfig.post('profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            return response.data;
        } catch (error: any) {
            return {
                error: true,
                message:
                    error.response?.data?.message ||
                    error.message ||
                    'Unknown error occurred while updating profile',
                status: error.response?.status,
            };
        }
    },
}));

export default useProfileStore;
