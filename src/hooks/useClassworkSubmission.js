import {useQuery} from 'react-query';
import axiosConfig from '../utils/axiosConfig';

const fetch = async class_id => {
    const {data} = await axiosConfig.get(`classworks-submission/${class_id}`);
    return data || [];
};

export default function useClassworkSubmission(class_id) {
    return useQuery(
        ['classroom-classwork-submission', class_id],
        () => fetch(class_id),
        {
            keepPreviousData: true,
            // enabled: !!studentSubmission,
        },
    );
}
