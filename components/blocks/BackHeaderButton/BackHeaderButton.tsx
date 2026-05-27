import {Pressable} from 'react-native';
import {useAppTheme} from '../../../hooks/useAppTheme';
import {useRouter} from 'expo-router';
import {FC} from 'react';
import {ThemedIcon} from '../ThemedIcon/ThemedIcon';

export const BackHeaderButton: FC = () => {
  const router = useRouter();
  const theme = useAppTheme();
  return (
  <Pressable hitSlop={10} onPress={router.back}>
    <ThemedIcon name="chevron.left" size={24} color={theme.text} />
  </Pressable>
  );
};
