//@ts-nocheck
import React from 'react';
import {useTheme, Text as RNText} from 'react-native-paper';

import {ERROR_COLOR} from "../../utils/constant";


const TextComponent: React.FC = ({children, style, error, ...props}) => {
  const theme = useTheme();
  const textColor = theme.dark ? 'white' : 'black';

  return <RNText {...props} style={[{color: error ? ERROR_COLOR : textColor}, style]}>{children}</RNText>;
};

export default TextComponent
