import {useAppTheme} from '@/hooks/useAppTheme';
import {useRouter} from 'expo-router';
import {FC} from 'react';
import {GestureResponderEvent, Pressable} from 'react-native';
import {IconSymbol, IconSymbolProps} from '../IconSymbol/IconSymbol';
import {ThemedText} from '../ThemedText/ThemedText';

interface ThemedLnkProps {
  iconName?: IconSymbolProps['name'];
  iconSize?: number;
  children?:string;
  href?: Parameters<ReturnType<typeof useRouter>['push']>[0];
  onPress?: (event: GestureResponderEvent) => void
}
export const ThemedLink: FC<ThemedLnkProps> = (props) => {
  const theme = useAppTheme();
  const router = useRouter();
  const {children, iconName, iconSize = 20} = props;
  const href = props.href;
  let onPress: (event: GestureResponderEvent) => void = href ? () => router.push(href) : () => {};
  if (props.onPress) {
    onPress = props.onPress;
  }

  return (
      <Pressable
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
        >
          <ThemedText style={{color: theme.accent}}>{children}</ThemedText>
          {iconName && <IconSymbol name={iconName} color={theme.accent} size={iconSize} />}
        </Pressable>
  );
};
