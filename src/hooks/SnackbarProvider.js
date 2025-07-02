// SnackbarProvider.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, useTheme } from 'react-native-paper';

const SnackbarContext = createContext();

export const SnackbarProvider = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('default'); // 'success' | 'error' | 'default'
  const theme = useTheme();

  const showSnackbar = useCallback((msg, type = 'default') => {
    setMessage(msg);
    setType(type);
    setVisible(true);
  }, []);

  const onDismiss = () => setVisible(false);

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return theme.colors.primary; // or custom green
      case 'error':
        return theme.colors.error;
      case 'default':
      default:
        return theme.colors.backdrop;
    }
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={onDismiss}
        duration={3000}
        style={{ backgroundColor: getBackgroundColor() }}
      >
        {message}
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => useContext(SnackbarContext);
