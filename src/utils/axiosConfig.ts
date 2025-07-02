// @ts-nocheck
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert} from 'react-native';
import {showMessage} from 'react-native-flash-message';
import { API_URL } from './constant';

// Base API URL


// Axios instance
const instance = axios.create({
    baseURL: API_URL,
});

// Paths to exclude from global error handling (like login)
const excludedPaths = ['login'];

// Get token from AsyncStorage
const getToken = async () => {
    return await AsyncStorage.getItem('token');
};

// Request interceptor to attach token
instance.interceptors.request.use(
    async config => {
        const token = await getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    },
);

// Response interceptor for error handling
instance.interceptors.response.use(
    response => response,
    error => {
        const statusCode = error.response?.status || null;
        const requestUrl = error.config?.url || '';
        let errorMessage =
            error.response?.data?.non_field_errors?.[0] ||
            error.response?.data?.message ||
            'No error message to show.';

        if (
            requestUrl &&
            excludedPaths.some(path => requestUrl.includes(path))
        ) {
            return Promise.reject(error);
        }

        // Unauthorized
        if (statusCode === 401 && error.response?.data?.error) {
            Alert.alert(
                'Unauthorized',
                error.response.data.error,
                [{text: 'Okay', style: 'cancel'}],
                {cancelable: false},
            );
            return Promise.reject(error);
        }

        // Forbidden
        if (statusCode === 403) {
            Alert.alert(
                `Error: ${statusCode} (Authentication required)`,
                'You must include a valid authentication token in the request headers to access this resource.',
                [{text: 'Okay', style: 'cancel'}],
                {cancelable: false},
            );
            return Promise.reject(error);
        }

        // Show flash message for general errors (unless path is excluded)
        if (
            requestUrl &&
            !excludedPaths.some(path => requestUrl.includes(path))
        ) {
            showMessage({
                message: `Error: ${statusCode}`,
                description: errorMessage,
                type: 'danger',
            });
        }

        // Optional: log error for debugging
        console.log('API Error:', {
            statusCode,
            url: requestUrl,
            message: errorMessage,
        });

        return Promise.reject(error);
    },
);

export default instance;
//https://chatgpt.com/c/6860a552-eb8c-800f-a63a-2401a137447f