import { useQuery } from "react-query";
import axiosConfig from "../utils/axiosConfig";

const fetch = async () => {  
    const { data } = await axiosConfig.get(`profile`);
    return data || null;
};

export default function useProfile() {
    return useQuery(["profile"], () => fetch(), {
        keepPreviousData: true,
    });
}
