import {useThemeColor} from '@/hooks/useThemeColor';
import {IconSymbol, IconSymbolProps} from './ui/IconSymbol';
import {OpaqueColorValue} from 'react-native';

export type ThemedIconProps = Omit<IconSymbolProps, 'color'> & {
  color?: string | OpaqueColorValue;
};

export function ThemedIcon({color, ...rest}: ThemedIconProps) {
  const themeColor = useThemeColor({}, 'text');
  const newColor = color ?? themeColor;

  return (
    <IconSymbol color={newColor} {...rest}></IconSymbol>
  );
}
