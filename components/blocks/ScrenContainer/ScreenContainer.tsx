
import {FC} from 'react';
import {StyleSheet, ViewProps} from 'react-native';
import {ThemedView} from '../ThemedView/ThemedView';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 70,
    paddingHorizontal: 10,
    flex: 1,
  },
});

export const ScreenContainer: FC<ViewProps> = (props) => {
  return (
  <ThemedView style={[styles.container, props.style]}>
    {props.children}
  </ThemedView>
  );
};
