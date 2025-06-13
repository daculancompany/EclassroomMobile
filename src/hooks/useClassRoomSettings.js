import { useQuery } from "react-query";
import axiosConfig from "../utils/axiosConfig";

const fetch = async (class_id) => {  
    const { data } = await axiosConfig.get(`faculties/classroom-settings/${class_id}`);
    return data || null;
};

export default function useClassRoomSettings(class_id) {
    return useQuery(["classroom-settings",class_id], () => fetch(class_id), {
        keepPreviousData: true,
    });
}
