/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import {Colors, Theme} from '@/types/Colors';
import {useColorScheme} from 'react-native';

export function useAppTheme(): Theme {
  const theme = useColorScheme() === 'light' ? 'light' : 'dark';
  return Colors[theme];
}
