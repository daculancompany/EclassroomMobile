import { useEffect, useState } from 'react';
import useProducts from './useProducts';

const usePaginatedProducts = () => {
    const [page, setPage] = useState(1);
    const [allProducts, setAllProducts] = useState([]);
    const { data, isLoading, isFetching, isError } = useProducts(page);

    const products = data?.data ?? [];
    const hasMore = data?.current_page < data?.last_page;

    useEffect(() => {
        if (products.length) {
            setAllProducts(prev => {
                const existingIds = new Set(prev.map(p => p.id));
                const newItems = products.filter(p => !existingIds.has(p.id));
                return [...prev, ...newItems];
            });
        }
    }, [data]);

    const loadMore = () => {   
         console.log({hasMore})
         console.log({isFetching})
        if (!isFetching && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    return {
        products: allProducts,
        isLoading,
        isFetching,
        isError,
        loadMore,
    };
};

export default usePaginatedProducts;
