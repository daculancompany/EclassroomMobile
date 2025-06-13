import { useQuery } from "react-query";
import axiosConfig from "../utils/axiosConfig";

const fetchData = async (page = 1) => {
    const { status, data } = await axiosConfig.get(`cateogry-paginate?page=${page}`);
    if (status !== 200) {
        throw new Error("Error fetching products.");
    }
    return data;
};

function useCategory(page) {
    return useQuery({
        queryKey: ["catetory-list", page],
        queryFn: () => fetchData(page),
        keepPreviousData: true,
    });
}

export default useCategory;
