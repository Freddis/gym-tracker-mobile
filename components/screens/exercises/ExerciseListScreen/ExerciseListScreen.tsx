import {StyleSheet} from 'react-native';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {useNavigation} from '@react-navigation/native';
import {FC, useState} from 'react';
import {Stack} from 'expo-router';
import {SelectExercisePresenter} from '../common/SelectExercisePresenter';

const styles = StyleSheet.create({
  titleContainer: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 70,
    paddingHorizontal: 0,
    flex: 1,
  },
});

export const ExerciseListScreen: FC = () => {
  const navigation = useNavigation();
  navigation.addListener('focus', () => {
    setfocusedCounter(focusedCounter + 1);
  });
  const [focusedCounter, setfocusedCounter] = useState(0);

  return (
      <ThemedView style={styles.titleContainer}>
          <Stack.Screen options={{title: 'Exercise Library', headerShown: false}} />
          <SelectExercisePresenter />
      </ThemedView>
  );
};
