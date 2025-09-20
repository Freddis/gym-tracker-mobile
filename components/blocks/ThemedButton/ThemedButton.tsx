import {useAppTheme} from '@/hooks/useAppTheme';
import {createStyleFunc} from '@/utils/createStyleFunc';
import {FC} from 'react';
import {Text, View, Pressable, PressableProps, ViewStyle, TextStyle} from 'react-native';

const getStyles = createStyleFunc((theme, create) => ({
  container: create<ViewStyle>({
    backgroundColor: theme.accent,
    alignSelf: 'center',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 120,
    alignItems: 'center',
  }),
  text: create<TextStyle>({
    color: 'white',
    fontSize: 20,
    fontWeight: 500,
  }),
}));

export const ThemedButton: FC<PressableProps & {children: string}> = (props) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  return (
    <Pressable {...props}>
      <View style={styles.container}>
        <Text style={styles.text}>{props.children}</Text>
      </View>
    </Pressable>
  );
};
