
import { useQuery } from "react-query";
import axiosConfig from "../utils/axiosConfig";

const fetch = async () => {
    const { data } = await axiosConfig.get(`faculties/get-classroom`);  
    return data || [];
};

export default function useClassroom() {
    return useQuery(["classroom-list"], () => fetch(), {
        keepPreviousData: true,
    });
}
