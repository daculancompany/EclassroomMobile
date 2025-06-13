import { useQuery } from "react-query";
import axiosConfig from "../utils/axiosConfig";

const fetchData = async (page = 1) => {
    const { status, data } = await axiosConfig.get(`products-paginate?page=${page}`);
    if (status !== 200) {
        throw new Error("Error fetching products.");
    }
    return data;
};

function useProducts(page) {
    return useQuery({
        queryKey: ["product-list", page],
        queryFn: () => fetchData(page),
        keepPreviousData: true,
    });
}

export default useProducts;
