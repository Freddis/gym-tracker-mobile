/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app.
 * For example, [Nativewind](https://www.nativewind.dev/),
 * [Tamagui](https://tamagui.dev/),
 * [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export interface Theme {
    accent: string,
    text: string,
    background: string,
    surface: string,
    surfaceText: string
    cavity: string
    cavityText: string,
    backgroundSecondary: string
    backgroundDeepest: string
    tint: string,
    icon: string
    tabIconDefault: string
    tabIconSelected: string
}

export const Colors: Record<'light' | 'dark', Theme> = {
  light: {
    text: '#222222',
    background: '#f8f8f8',
    surface: '#ffffff',
    surfaceText: '#444444',
    cavity: '#e5e5e5',
    cavityText: '#000000',
    accent: '#e7000b',

    backgroundSecondary: '#ddd',
    backgroundDeepest: '#ededed',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    cavity: 'e5e5e5',
    backgroundSecondary: '#282828',
    backgroundDeepest: '#131313',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    surface: '',
    surfaceText: '',
    cavityText: '',
    accent: '',
  },
};
