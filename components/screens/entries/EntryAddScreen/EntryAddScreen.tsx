import {KeyboardAvoidingView, Platform, StyleSheet} from 'react-native';
import {Stack, useRouter} from 'expo-router';
import {ThemedView} from '../../../blocks/ThemedView/ThemedView';
import {ThemedScrollView} from '../../../blocks/ThemedScrollView/ThemedScrollView';
import {Theme} from '../../../../types/Colors';
import {useAppTheme} from '../../../../hooks/useAppTheme';
import {ThemedButtonList} from '../../../blocks/ThemedButtonList/ThemedButtonList';
import {RoutePath} from '../../../../types/RoutePath';
import {useAuth} from '../../../providers/AuthProvider/useAuth';
import {atom, useSetAtom} from 'jotai';
import {weightAtom} from '../WeightEditScreen/utils/weightAtom';
import {useQueryClient} from '@tanstack/react-query';
import {workoutAtom} from '../WorkoutScreen/utils/workoutAtom';
import {useServices} from '../../../providers/ServiceProvider/ServiceProvider';

export const EntryAddScreen = () => {
  const theme = useAppTheme();
  const styles = getStyles(theme);
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

  const items: [string, RoutePath | (() => void)][] = [
    ['Workout', addWorkout],
    ['Weight', addWeight],
    ['Post', '/app/entries/createPost'],
  ];
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Stack.Screen options={{title: 'Add Entry', headerShown: true}} />
       <ThemedScrollView style={{minHeight: '100%'}}>
       <ThemedView style={styles.container}>
      <ThemedButtonList items={items} replace={true} />
      </ThemedView>
      </ThemedScrollView>
    </KeyboardAvoidingView>
  );
};

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flexDirection: 'column',
    padding: theme.paddingM,
    marginBottom: 80,
    gap: theme.marginL,
    flex: 1,
    flexGrow: 1,
  },
});
