
import {FC} from 'react';
import {vars} from 'nativewind';
import {useColorScheme, View, ViewProps} from 'react-native';
import {cn} from '../../../cn';

/* export const Colors: Record<'light' | 'dark', Theme> = {
  light: {
    text: '#222222',
    background: '#f8f8f8',
    surface: '#ffffff',
    surfaceText: '#444444',
    cavity: '#e5e5e5',
    cavityText: '#000000',
    accent: '#e7000b',
    danger: '#ffe2e2',
    dangerText: '#ff6467',
    backgroundSecondary: '#ddd',
    backgroundDeepest: '#ededed',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    ...shared,
  },
  dark: {
    background: '#262626',
    text: '#f5f5f5',
    surface: '#171717',
    surfaceText: '#e5e5e5',
    cavity: '#171717',
    cavityText: '#f5f5f5',
    accent: '#e7000b',
    danger: '#ffe2e2',
    dangerText: '#ff6467',

    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    backgroundSecondary: '#282828',
    backgroundDeepest: '#000000',
    ...shared,
  },
}; */
const themes = {
  light: vars({
    '--color-main': '#f8f8f8',
    '--color-on-main': '#222222',
    '--color-cavity': '#e5e5e5',
    '--color-on-cavity': 'black',
  }),
  dark: vars({
    '--color-main': '#262626',
    '--color-on-main': '#f5f5f5',
    '--color-cavity': '#262626',
    '--color-on-cavity': '#f5f5f5',
  }),
};

interface ScreenContainerProps extends ViewProps {
  className?: string;
  safeTop?: boolean;
}

export const ScreenContainer: FC<ScreenContainerProps> = (props) => {
  const colorScheme = useColorScheme();
  const ptSafe = props.safeTop ? 'pt-safe' : '';
  return (
    <View style={themes[colorScheme === 'dark' ? 'dark' : 'light']} className={cn('bg-main text-on-main', ptSafe, props.className)}>
      {props.children}
    </View>
  );
};
