import {StyleSheet} from 'react-native';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {FC} from 'react';
import {Exercise} from '../../../../openapi-client';
import {Stack} from 'expo-router';
import {SelectExercisePresenter} from '../common/SelectExercisePresenter';

const styles = StyleSheet.create({
  titleContainer: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 0,
    paddingHorizontal: 0,
    flex: 1,
  },
});

export const SelectExerciseScreen: FC<{onSelect: (item: Exercise)=>void}> = (props) => {

  return (
    <ThemedView style={styles.titleContainer}>
        <Stack.Screen options={{title: 'Add Exercise', headerShown: true}} />
        <SelectExercisePresenter onPress={props.onSelect} />
    </ThemedView>
  );
};
