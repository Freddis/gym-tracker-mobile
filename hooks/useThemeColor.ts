/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import {Colors} from '@/types/Colors';
import {useColorScheme} from 'react-native';

export type ColorType = 'background' | 'text' | 'surface' | 'backgroundSecondary' | 'dangerText'

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ColorType
) {
  const theme = useColorScheme() === 'light' ? 'light' : 'dark';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
