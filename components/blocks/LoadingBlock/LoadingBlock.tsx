import {FC} from 'react';
import {ThemedView} from '../ThemedView/ThemedView';
import {ActivityIndicator} from 'react-native';
import {useAppTheme} from '../../../hooks/useAppTheme';

export const LoadingBlock: FC = () => {
  const theme = useAppTheme();
  return (
    <ThemedView style={{paddingTop: 70, flexDirection: 'column', height: '100%', width: '100%'}}>
      <ActivityIndicator size="large" color={theme.accent} />
    </ThemedView>
  );
};
