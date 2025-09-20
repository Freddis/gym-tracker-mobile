import {Theme} from '@/types/Colors';
import {ImageStyle, StyleProp, TextStyle, ViewStyle} from 'react-native';

type StyleCreator = <T extends ViewStyle | TextStyle | ImageStyle>(
  style: T
) => StyleProp<T>;

export function createStyleFunc<
  T extends Record<string, StyleProp<any>>
>(
  fn: (theme: Theme, create: StyleCreator) => T
) {
  return (theme: Theme) => fn(theme, (s) => s);
}
