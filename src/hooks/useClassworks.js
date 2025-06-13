import { useQuery } from "react-query";
import axiosConfig from "../utils/axiosConfig";

const fetch = async (class_id) => {  
    const { data } = await axiosConfig.get(`faculties/classworks/${class_id}`);
    return data || [];
};

export default function useClassworks(class_id) {
    return useQuery(["classroom-classwork-list",class_id], () => fetch(class_id), {
        keepPreviousData: true,
    });
}
