import {KeyboardAvoidingView, Platform} from 'react-native';
import {Stack, useRouter} from 'expo-router';
import {ThemedScrollView} from '../../../blocks/ThemedScrollView/ThemedScrollView';
import {ThemedButtonList} from '../../../blocks/ThemedButtonList/ThemedButtonList';
import {RoutePath} from '../../../../types/RoutePath';
import {useAuth} from '../../../providers/AuthProvider/useAuth';
import {useSetAtom} from 'jotai';
import {workoutAtom} from '../workouts/WorkoutScreen/utils/workoutAtom';
import {useServices} from '../../../providers/ServiceProvider/ServiceProvider';
import {ScreenContainer} from '../../../blocks/ScreenContainer/ScreenContainer';
import {entryLens} from '../EntryListScreen/components/EntryBlock/EntryBlock';
import {weightAtom} from '../weight/WeightUpdateScreen/utils/weightAtom';

export const EntryAddScreen = () => {
  const setWeightEntry = useSetAtom(weightAtom);
  const setWorkoutEntry = useSetAtom(workoutAtom);
  const router = useRouter();
  const {entryService, entryListService} = useServices();
  const auth = useAuth();
  const user = auth.user;
  if (!user) {
    throw new Error('No user');
  }
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
  const addWalk = () => {
    router.replace({
      pathname: '/app/entries/outdoorWalk/outdoorWalkCreate',
    });
  };
  const items: [string, RoutePath | (() => void)][] = [
    ['Workout', addWorkout],
    ['Weight', addWeight],
    ['Post', '/app/entries/post/postCreate'],
    ['Meal', '/app/entries/meal/mealCreate'],
    ['Walk', addWalk],
  ];
  return (
    <ScreenContainer>
      <Stack.Screen options={{title: 'Add Entry', headerShown: true}} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ThemedScrollView className="h-full p-m">
          <ThemedButtonList items={items} replace={true} />
        </ThemedScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

