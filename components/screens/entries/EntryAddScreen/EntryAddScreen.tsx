import {KeyboardAvoidingView, Platform} from 'react-native';
import {Stack, useRouter} from 'expo-router';
import {ThemedScrollView} from '../../../blocks/ThemedScrollView/ThemedScrollView';
import {ThemedButtonList} from '../../../blocks/ThemedButtonList/ThemedButtonList';
import {RoutePath} from '../../../../types/RoutePath';
import {useSetAtom} from 'jotai';
import {workoutAtom} from '../workouts/WorkoutScreen/utils/workoutAtom';
import {useServices} from '../../../providers/ServiceProvider/ServiceProvider';
import {AppScreenContainer} from '../../../blocks/AppScreenContainer/AppScreenContainer';
import {entryLens} from '../EntryListScreen/components/EntryBlock/EntryBlock';
import {weightAtom} from '../weight/WeightUpdateScreen/utils/weightAtom';
import {useUser} from '../../../providers/AuthProvider/useUser';

export const EntryAddScreen = () => {
  const setWeightEntry = useSetAtom(weightAtom);
  const setWorkoutEntry = useSetAtom(workoutAtom);
  const router = useRouter();
  const {entryService, entryListService} = useServices();
  const user = useUser();

  const addWeight = async () => {
    const weightEntry = await entryService.addWeightEntry(user.id);
    const entryAtom = entryListService.addEntry(weightEntry);
    const weightAtom = entryLens(weightEntry, entryAtom);
    setWeightEntry(weightAtom);
    router.replace({
      pathname: '/app/entries/weight/weightUpdate',
    });
  };

  const addWorkout = async () => {
    const workoutEntry = await entryService.addWorkoutEntry(user.id);
    const entryAtom = entryListService.addEntry(workoutEntry);
    const workoutAtom = entryLens(workoutEntry, entryAtom);
    setWorkoutEntry(workoutAtom);
    router.replace({
      pathname: '/app/entries/workout/workoutUpdate',
    });
  };

  const items: [string, RoutePath | (() => void)][] = [
    ['Workout', addWorkout],
    ['Weight', addWeight],
    ['Post', '/app/entries/post/postCreate'],
    ['Meal', '/app/entries/meal/mealCreate'],
    ['Walk', '/app/entries/outdoorWalk/outdoorWalkCreate'],
    ['Run', '/app/entries/outdoorRun/outdoorRunCreate'],
  ];
  return (
    <AppScreenContainer>
      <Stack.Screen options={{title: 'Add Entry', headerShown: true}} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ThemedScrollView className="h-full p-m">
          <ThemedButtonList items={items} replace={true} />
        </ThemedScrollView>
      </KeyboardAvoidingView>
    </AppScreenContainer>
  );
};

