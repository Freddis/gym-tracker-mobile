import {FC} from 'react';
import {ThemedView} from '../ThemedView/ThemedView';
import {ActivityIndicator} from 'react-native';
import {useAppTheme} from '../../../hooks/useAppTheme';

export const LoadingBlock: FC = () => {
  const theme = useAppTheme();
  return (
    <ThemedView className="w-full flex-col items-center justify-center">
      <ActivityIndicator size="large" color={theme.accent} />
    </ThemedView>
  );
};
