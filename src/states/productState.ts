//@ts-nocheck
import { create } from "zustand";
import { delay } from "../utils/helper";
import axiosConfig from '../utils/axiosConfig';

const useProductStore = create((set) => ({
    loading: false,
    setLoading: (value) => set({ loading: value }),
    isNew: false,
    setNew: (value) => set({ isNew: value }),
    product: null,
    setProduct: (value) => set({ product: value }),
    storeProduct: async (params: any) => {
        await delay(1000);
        return axiosConfig.post("products", params)
        .then((result) => result)
        .catch((error) => ({
            error: true,
            message: error.response?.data?.message || error.message || "Unknown error"
        }));
    },
    updateProduct: async (params: any) => {
        await delay(1000);   console.log({params})
        return axiosConfig.patch("products/" + params?.id, params)
        .then((result) => result)
        .catch((error) => ({
            error: true,
            message: error.response?.data?.message || error.message || "Unknown error"
        }));
    },
}));

export default useProductStore;
