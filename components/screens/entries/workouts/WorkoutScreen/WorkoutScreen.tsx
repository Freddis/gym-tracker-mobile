import {View, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {Stack, useLocalSearchParams, useRouter} from 'expo-router';
import {FC, useEffect, useMemo, useRef, useState} from 'react';
import {useDrizzle} from '@/utils/drizzle';
import {CompleteAppWorkout} from '@/types/models/AppWorkout';
import {NewModel} from '@/types/NewModel';
import {useAuth} from '@/components/providers/AuthProvider/useAuth';
import {eq} from 'drizzle-orm';
import {AppWorkoutExercise, CompleteAppWorkoutExercise} from '@/types/models/AppWorkoutExercise';
import {TimerBlock} from '@/components/blocks/TimerBlock/TimerBlock';
import {ThemedScrollView} from '@/components/blocks/ThemedScrollView/ThemedScrollView';
import {EditableWorkoutExerciseBlock} from './components/EditableWorkoutExerciseBlock/EditableWorkoutExerciseBlock';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {Separator} from '@/components/blocks/Separator/Separator';
import {ThemedLink} from '@/components/blocks/ThemedLink/ThemedLink';
import {EntrySyncButton} from '../../EntryListScreen/components/EntrySyncButton/EntrySyncButton';
import {DateTimeUpdateModal} from '../../../../blocks/DateTimeUpdateModal/DateTimeUpdateModal';
import {string} from 'zod';
import {workoutAtom} from './utils/workoutAtom';
import {atom, useAtom, useAtomValue} from 'jotai';
import {splitAtom} from 'jotai/utils';
import {EntryType} from '../../../../../openapi-client';
import {WorkoutAppEntry} from '../../../../../types/models/AppEntry';
import {useServices} from '../../../../providers/ServiceProvider/ServiceProvider';
import {ScreenContainer} from '../../../../blocks/ScreenContainer/ScreenContainer';
import {dateToString} from '../../../../../utils/dateToString';

export const WorkoutScreen: FC = () => {
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [entryAtom, setEntryAtom] = useAtom(workoutAtom);
  const [entry, setEntry] = useAtom(entryAtom);
  const {entryAtomService, entryService} = useServices();
  const exercisesSplitAtom = useMemo(() => {
    const exercisesAtom = atom(
      (get) => get(entryAtom).workout.exercises,
      (get, set, exercises: CompleteAppWorkoutExercise[]) => set(
        entryAtom,
        {
          ...get(entryAtom),
          workout: {
            ...get(entryAtom).workout,
            exercises,
          },
        }
      )
    );
    return splitAtom(exercisesAtom, (x) => x.id);
  }, [entryAtom]);
  const exercisesAtoms = useAtomValue(exercisesSplitAtom);

  const scrollViewRef = useRef<ScrollView>(null);
  const auth = useAuth();
  const user = auth.user;
  if (!user) {
    throw new Error('No user');
  }
  const params = useLocalSearchParams();
  const router = useRouter();
  const [db, schema] = useDrizzle();
  const workout = entry.workout;
  useEffect(() => {
    const validatedExerciseId = string().safeParse(params.exerciseId);
    if (!workout || !validatedExerciseId.success) {
      return;
    }
    addExerciseToWorkout(workout, validatedExerciseId.data);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.exerciseId, workout]);

  const addExerciseToWorkout = async (workout: CompleteAppWorkout, exerciseId: string) => {
    const workoutExercise: NewModel<AppWorkoutExercise> = {
      workoutId: workout.id,
      // externalId: null,
      userId: user.id,
      createdAt: new Date(),
      updatedAt: null,
      exerciseId,
    };
    await db.insert(schema.workoutExercises).values(workoutExercise).then(() => {
      router.setParams({
        ...params,
        exerciseId: undefined,
      });
    });
    await db.update(schema.workouts).set({
      updatedAt: new Date(),
    }).where(eq(schema.workouts.id, workout.id));
    const updated: WorkoutAppEntry = await entryService.getEntry(entry.id, EntryType.WORKOUT);
    setEntry(updated);
  };

  const addExercise = async () => {
    router.navigate({
      pathname: './selectExercise',
      params,
    });
  };
  const deleteWorkout = async () => {
    await entryAtomService.deleteEntry(entry);
    router.back();
  };

  const deleteExercise = async (exercise: CompleteAppWorkoutExercise) => {
    await db.delete(schema.workoutExerciseSets).where(
      eq(schema.workoutExerciseSets.workoutExerciseId, exercise.id)
    );
    await db.delete(schema.workoutExercises).where(
      eq(schema.workoutExercises.id, exercise.id)
    );
    const now = new Date();
    await db.update(schema.workouts).set({
      updatedAt: now,
    })
    .where(
      eq(schema.workouts.id, workout.id)
    );
    // setRefreshCounter(refreshCounter + 1);
    // const updated: WorkoutAppEntry = await entryService.getEntry(entry.id, EntryType.WORKOUT);
    // setEntry(updated);
    const newEntry: WorkoutAppEntry = {
      ...entry,
      updatedAt: now,
      workout: {
        ...entry.workout,
        exercises: entry.workout.exercises.filter((x) => x.id !== exercise.id),
      },
    };
    setEntry(newEntry);
    entryService.saveEntry(newEntry);
  };
  const finishWorkout = async () => {
    const now = new Date();
    await db.update(schema.workouts).set({
      end: now,
      updatedAt: now,
    }).where(
      eq(schema.workouts.id, workout.id)
    );
    router.back();
    const updated: WorkoutAppEntry = {
      ...entry,
      updatedAt: now,
      workout: {
        ...entry.workout,
        end: now,
      },
    };
    setEntry(updated);
  };
  const copyWorkout = async () => {
    const workoutEntry = await entryService.copyWorkout(workout);
    const workoutAtom = entryAtomService.addEntry(workoutEntry);
    setEntryAtom(workoutAtom);
  };

  const updateDate = async (date: Date) => {
    await entryAtomService.updateTime(entry, date);
    setEntry({...entry, time: date});
  };
  const workoutFinished = workout.end !== null;
  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ThemedScrollView ref={scrollViewRef}>
          <ThemedView className="h-full gap-m p-m">
            <Stack.Screen options={{title: 'Workout', headerShown: true}} />
            <ThemedBlock>
              <View className="flex-row">
                <ThemedText className="grow">Time:</ThemedText>
                <TimerBlock key={workout.id} start={workout.start} end={workout.end ?? undefined}/>
              </View>
              <Separator />
              <View className="flex-row">
                <ThemedText className="grow">Date:</ThemedText>
                <ThemedText onPress={() => setDateModalVisible(true)}>{dateToString(entry.time)}</ThemedText>
              </View>
              <Separator />
              <View className="flex-row">
                <ThemedText className="grow">Synced:</ThemedText>
                <EntrySyncButton entry={entry} onUpdate={(e) => setEntry({...entry, updatedAt: e.updatedAt})} />
              </View>
              {!!workoutFinished && (
                <>
                  <Separator />
                  <View className="flex-row justify-center gap-30">
                    <ThemedLink onPress={copyWorkout}>Copy</ThemedLink>
                    <ThemedLink onPress={deleteWorkout}>Delete</ThemedLink>
                  </View>
                </>
              )}
            </ThemedBlock>
            {exercisesAtoms.map((x) => (
              <EditableWorkoutExerciseBlock onDelete={deleteExercise} key={x.toString()} exercise={x} />
            ))}
            <View className="flex-col items-center mt-s gap-30">
              <ThemedLink onPress={addExercise}>Add Exercise</ThemedLink>
              {!workoutFinished && (
                <ThemedLink onPress={finishWorkout}>Finish Workout</ThemedLink>
              )}
            </View>
          </ThemedView>
          <DateTimeUpdateModal onClose={() => setDateModalVisible(false)} date={entry.time} visible={dateModalVisible} onUpdate={updateDate} />
        </ThemedScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};
