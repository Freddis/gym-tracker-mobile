import {useAppTheme} from '@/hooks/useAppTheme';
import {usePathname, useRouter} from 'expo-router';
import {FC} from 'react';
import {GestureResponderEvent, Pressable, TextStyle} from 'react-native';
import {IconSymbol, IconSymbolProps} from '../IconSymbol/IconSymbol';
import {ThemedText} from '../ThemedText/ThemedText';

interface ThemedLnkProps {
  iconName?: IconSymbolProps['name'];
  iconSize?: number;
  children?:string;
  href?: Parameters<ReturnType<typeof useRouter>['push']>[0];
  onPress?: (event: GestureResponderEvent) => void
  style?: TextStyle
  accented?: boolean
  className?: string;
}
export const ThemedLink: FC<ThemedLnkProps> = (props) => {
  const theme = useAppTheme();
  const router = useRouter();
  const {children, iconName, iconSize = 20} = props;
  const href = props.href;
  const pathname = usePathname();
  const hrefHandler = (href: Exclude<ThemedLnkProps['href'], undefined>) => {
    if (href && pathname !== href) {
      router.navigate(href);
    }
  };

  let onPress: (event: GestureResponderEvent) => void = href ? () => hrefHandler(href) : () => {};
  if (props.onPress) {
    onPress = props.onPress;
  }

  return (
      <Pressable
          hitSlop={10}
          onPress={onPress}
          style={({pressed}) => [
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              opacity: pressed ? 0.75 : 1,
              flexShrink: 1,
            },
          ]}
          className={props.className}
        >
          <ThemedText style={{color: props.accented ? theme.accent : theme.text, ...props.style}}>{children}</ThemedText>
          {iconName && <IconSymbol name={iconName} color={theme.accent} size={iconSize} />}
        </Pressable>
  );
};
