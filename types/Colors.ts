/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app.
 * For example, [Nativewind](https://www.nativewind.dev/),
 * [Tamagui](https://tamagui.dev/),
 * [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

interface SharedThemeConfig {
  marginHorizontal: number,
  margnVertical: number,
  marginS: number;
  paddingS: number;
  borderRadiusS: number;
  paddingM: number;
  borderRadiusM: number;
  marginM: number;
  marginL: number;

}

export interface Theme extends SharedThemeConfig {
    dangerText: string ;
    danger: string ;
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
const shared: SharedThemeConfig = {
  marginHorizontal: 10,
  margnVertical: 10,
  borderRadiusM: 10,
  marginM: 15,
  paddingM: 15,
  marginS: 5,
  paddingS: 5,
  borderRadiusS: 5,
  marginL: 20,
};

export const Colors: Record<'light' | 'dark', Theme> = {
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
};
