import {KeyboardAvoidingView, Platform} from 'react-native';
import {Stack, useRouter} from 'expo-router';
import {ThemedScrollView} from '../../../blocks/ThemedScrollView/ThemedScrollView';
import {ThemedButtonList} from '../../../blocks/ThemedButtonList/ThemedButtonList';
import {RoutePath} from '../../../../types/RoutePath';
import {useAuth} from '../../../providers/AuthProvider/useAuth';
import {atom, useSetAtom} from 'jotai';
import {weightAtom} from '../WeightEditScreen/utils/weightAtom';
import {useQueryClient} from '@tanstack/react-query';
import {workoutAtom} from '../WorkoutScreen/utils/workoutAtom';
import {useServices} from '../../../providers/ServiceProvider/ServiceProvider';
import {ScreenContainer} from '../../../blocks/ScreenContainer/ScreenContainer';

export const EntryAddScreen = () => {
  const setWeightEntry = useSetAtom(weightAtom);
  const setWorkoutEntry = useSetAtom(workoutAtom);
  const router = useRouter();
  const queryClient = useQueryClient();
  const {entryService} = useServices();
  const auth = useAuth();
  const user = auth.user;
  if (!user) {
    throw new Error('No user');
  }
  const addWeight = async () => {
    const entry = await entryService.addWeightEntry(user.id);
    setWeightEntry(atom(entry));
    queryClient.invalidateQueries({queryKey: ['entries']});
    router.replace({
      pathname: '/app/entries/editWeight',
    });
  };
  const addWorkout = async () => {
    const entry = await entryService.addWorkoutEntry(user.id);
    setWorkoutEntry(atom(entry));
    queryClient.invalidateQueries({queryKey: ['entries']});
    router.replace({
      pathname: '/app/entries/editWorkout',
    });
  };
  const addWalk = () => {
    router.replace({
      pathname: '/app/entries/walk/createWalk',
    });
  };
  const items: [string, RoutePath | (() => void)][] = [
    ['Workout', addWorkout],
    ['Weight', addWeight],
    ['Post', '/app/entries/createPost'],
    ['Meal', '/app/entries/meal/createMeal'],
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

