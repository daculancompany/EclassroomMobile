//@ts-nocheck
import { create } from "zustand";
import { delay } from "../utils/helper";
import axiosConfig from '../utils/axiosConfig';

const useLoginStore = create((set) => ({
    loading: false,
    setLoading: (value) => set({ loading: value }),
    checkLogin: async (params: any) => {
        await delay(1000);
        return axiosConfig.post("login", params)
        .then((result) => result)
        .catch((error) => ({
            error: true,
            message: error.response?.data?.message || error.message || "Unknown error"
        }));
    },
}));

export default useLoginStore;
