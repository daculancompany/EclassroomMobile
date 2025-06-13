import { useQuery } from "react-query";
import axiosConfig from "../utils/axiosConfig";

const fetchClassroomStudents = async (classId) => {
    const { data } = await axiosConfig.get(`faculties/get-classroom-attendance/${classId}`);
    return data || [];
};

export default function useClassroomAttendance(classId) {
    return useQuery(
        ["classroom-aattendance-list-all", classId], 
        () => fetchClassroomStudents(classId),
        {
            keepPreviousData: true,
        }
    );
}
