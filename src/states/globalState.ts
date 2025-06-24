//@ts-nocheck
import {create} from 'zustand';
import {FileViewerModal} from '../components';

const useGlobalStore = create(set => ({
    loading: false,
    fileViewer: {visible: true, url: null, onDismiss: null},
    visible: false,
    setVisible: value => set({visible: value}),
    setField: (key, value) => set(() => ({[key]: value})),
    setLoading: value => set({loading: value}),
}));

export default useGlobalStore;
