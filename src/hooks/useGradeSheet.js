import { useQuery } from "react-query";
import axiosConfig from "../utils/axiosConfig";

const fetch = async (classId) => {
    const { data } = await axiosConfig.get(`faculties/get-classwork-gradesheet/${classId}`);
    return data || [];
};

export default function useGradeSheet(classId) {
    return useQuery(
        ["classwork-gradesheet-data", classId], 
        () => fetch(classId),
        {
            keepPreviousData: true,
        }
    );
}
