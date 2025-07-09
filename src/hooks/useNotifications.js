
import { useQuery } from "react-query";
import axiosConfig from "../utils/axiosConfig";

const fetch = async () => {
    const { data } = await axiosConfig.get(`notifications`);  
    return data || [];
};

export default function useNotifications() {
    return useQuery(["notification-list"], () => fetch(), {
        keepPreviousData: true,
    });
}
