import React, { createContext, useContext, useState, useRef } from 'react';
import BottomSheet from './BottomSheet';

const BottomSheetContext = createContext();

export const BottomSheetProvider = ({ children }) => {
  const [bottomSheetState, setBottomSheetState] = useState({
    visible: false,
    content: null,
    config: {},
  });

  // Use ref to maintain stable reference for callbacks
  const bottomSheetRef = useRef();

  const showBottomSheet = (content, config = {}) => {
    setBottomSheetState({
      visible: true,
      content,
      config: {
        heightPercentage: 0.9,
        enablePanGesture: true,
        showDragHandle: true,
        ...config,
      },
    });
  };

  const hideBottomSheet = () => {
    setBottomSheetState(prev => ({ ...prev, visible: false }));
  };

  return (
    <BottomSheetContext.Provider value={{ showBottomSheet, hideBottomSheet }}>
      {children}
      <BottomSheet
        ref={bottomSheetRef}
        visible={bottomSheetState.visible}
        onDismiss={hideBottomSheet}
        {...bottomSheetState.config}>
        {bottomSheetState.content}
      </BottomSheet>
    </BottomSheetContext.Provider>
  );
};

export const useBottomSheet = () => {
  const context = useContext(BottomSheetContext);
  if (!context) {
    throw new Error('useBottomSheet must be used within a BottomSheetProvider');
  }
  return context;
};