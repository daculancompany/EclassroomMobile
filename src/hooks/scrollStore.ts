
import { create } from 'zustand';

type ScrollStore = {
  isScrollAtTop: boolean;
  setIsScrollAtTop: (value: boolean) => void;
};

export const useScrollStore = create<ScrollStore>((set) => ({
  isScrollAtTop: false,
  setIsScrollAtTop: (value) => set({ isScrollAtTop: value }),
}));
