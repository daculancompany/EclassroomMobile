//@ts-nocheck
import {create} from 'zustand';
import dayjs from 'dayjs';
import {delay} from '../utils/helper';
import axiosConfig from '../utils/axiosConfig';

const useClassroomStore = create(set => ({
    studentSubmission: false,
    setField: (key, value) => set(() => ({[key]: value})),
    storeStudentWorkLink: async (params: any) => {
        await delay(1000);
        return axiosConfig
            .post('store-student-work-link', params)
            .then(result => result)
            .catch(error => ({
                error: true,
                message:
                    error.response?.data?.message ||
                    error.message ||
                    'Unknown error',
            }));
    },
    storeStudentSubmission: async (params: any) => {
 
        const formData = new FormData();

        // Append all parameters to formData
        for (const key in params) {
            if (params.hasOwnProperty(key)) {
                // Handle file objects differently
                if (key === 'file' && params[key]) {
                    formData.append(key, {
                        uri: params[key].uri,
                        name: params[key].name || 'file.jpg',
                        type: params[key].type || 'image/jpeg',
                    });
                } else {
                    formData.append(key, params[key]);
                }
            }
        }

        return axiosConfig
            .post('store-student-submission', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                transformRequest: data => data, // Prevent axios from transforming the FormData
            })
            .then(result => result)
            .catch(error => ({
                error: true,
                message:
                    error.response?.data?.message ||
                    error.message ||
                    'Unknown error',
            }));
    },
}));

export default useClassroomStore;
