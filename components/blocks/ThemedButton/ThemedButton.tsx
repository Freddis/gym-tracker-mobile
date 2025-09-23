import {useAppTheme} from '@/hooks/useAppTheme';
import {createStyleFunc} from '@/utils/createStyleFunc';
import {FC} from 'react';
import {Text, View, Pressable, PressableProps, ViewStyle, TextStyle, StyleProp, PressableStateCallbackType} from 'react-native';

const getStyles = createStyleFunc((theme, create) => ({
  container: create<ViewStyle>({
    backgroundColor: theme.accent,
    alignSelf: 'center',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 120,
    alignItems: 'center',
  }),
  text: create<TextStyle>({
    color: 'white',
    fontSize: 16,
    fontWeight: 600,
  }),
}));

export const ThemedButton: FC<PressableProps & {children: string}> = (props) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);

  const pressableStyle = (state: PressableStateCallbackType): StyleProp<ViewStyle> => {
    const parentStyle = typeof props.style === 'function' ? props.style(state) : props.style;
    const obj = typeof parentStyle === 'object' ? parentStyle : {};
    return {
      ...obj,
      opacity: state.pressed ? 0.75 : 1,
    };
  };
  return (
    <Pressable {...props} style={pressableStyle}>
      <View style={styles.container}>
        <Text style={styles.text}>{props.children}</Text>
      </View>
    </Pressable>
  );
};
