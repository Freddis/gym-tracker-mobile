import {useAppTheme} from '@/hooks/useAppTheme';
import {FC} from 'react';
import {View} from 'react-native';

export const Separator: FC = () => {
  const theme = useAppTheme();
  return (
    <View style={{borderBottomColor: theme.surfaceText, opacity: 0.1, marginVertical: theme.marginS, borderBottomWidth: 1}} />
  );
};
