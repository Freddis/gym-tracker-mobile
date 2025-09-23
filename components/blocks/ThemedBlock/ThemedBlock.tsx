import {View, type ViewProps, StyleSheet} from 'react-native';
import {FC} from 'react';
import {useAppTheme} from '@/hooks/useAppTheme';
import {Theme} from '@/types/Colors';

const styled = (theme: Theme) => StyleSheet.create({
  container: {
    backgroundColor: theme.surface,
    padding: 10,
    borderRadius: 5,
    boxShadow: '0px 4px 4px -2px rgba(0,0,0, 0.1)',
  },
});

export const ThemedBlock: FC<ViewProps> = (props) => {
  const {style, children, ...rest} = props;
  const theme = useAppTheme();
  const styles = styled(theme);

  return <View style={[styles.container, style]} {...rest}>{children}</View>;
};
