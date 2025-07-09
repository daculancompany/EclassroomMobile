import { useState, useCallback } from 'react';

export const useScrollHandling = () => {
    const [isScrollAtTop, setIsScrollAtTop] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);

    const handleScroll = useCallback(event => {
        const offsetY = event.nativeEvent.contentOffset.y;
        const atTop = offsetY <= 0;
        setIsScrollAtTop(atTop);
        setIsScrolled(!atTop);
    }, []);

    return { isScrollAtTop, isScrolled, handleScroll };
};