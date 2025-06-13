import { useQuery } from "react-query";
import axiosConfig from "../utils/axiosConfig";

const fetchData = async () => {
    const { status, data } = await axiosConfig.get(
        `categories`
    );
    if (status !== 200) {
        throw new Error("Error found.");
    }
    return data || [];
};

function useCategories() {
    return useQuery({
        queryKey: ["categories"],
        queryFn: () => fetchData(),
        keepPreviousData: true,
        // refetchInterval: 1000,
    });
}

export default useCategories;
