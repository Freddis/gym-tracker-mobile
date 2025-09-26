
import {FC} from 'react';
import {StyleSheet, ViewProps} from 'react-native';
import {ThemedView} from '../ThemedView/ThemedView';
import {useAppTheme} from '../../../hooks/useAppTheme';
import {Theme} from '../../../types/Colors';

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 70,
    paddingBottom: 80,
    paddingHorizontal: theme.paddingM,
    flex: 1,
  },
});

export const ScreenContainer: FC<ViewProps> = (props) => {
  const theme = useAppTheme();
  const styles = getStyles(theme);
  return (
  <ThemedView style={[styles.container, props.style]}>
    {props.children}
  </ThemedView>
  );
};
