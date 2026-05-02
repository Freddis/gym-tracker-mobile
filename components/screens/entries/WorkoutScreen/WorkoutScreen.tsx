import {StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {Stack, useLocalSearchParams, useRouter} from 'expo-router';
import {FC, useEffect, useRef, useState} from 'react';
import {useDrizzle} from '@/utils/drizzle';
import {CompleteAppWorkout} from '@/types/models/AppWorkout';
import {NewModel} from '@/types/NewModel';
import {LoadingBlock} from '@/components/blocks/LoadingBlock/LoadingBlock';
import {useAuth} from '@/components/providers/AuthProvider/useAuth';
import {ZodHelper} from '@/utils/ZodHelper/ZodHelper';
import {eq} from 'drizzle-orm';
import {AppWorkoutExercise, CompleteAppWorkoutExercise} from '@/types/models/AppWorkoutExercise';
import {TimerBlock} from '@/components/blocks/TimerBlock/TimerBlock';
import {ThemedScrollView} from '@/components/blocks/ThemedScrollView/ThemedScrollView';
import {EditableWorkoutExerciseBlock} from './components/EditableWorkoutExerciseBlock/EditableWorkoutExerciseBlock';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {Separator} from '@/components/blocks/Separator/Separator';
import {ThemedLink} from '@/components/blocks/ThemedLink/ThemedLink';
import {useAppTheme} from '@/hooks/useAppTheme';
import {Theme} from '@/types/Colors';
import {useEntryService} from '../../../../utils/EntryService/useEntryService';
import {EntrySyncButton} from '../EntryListScreen/components/EntrySyncButton/EntrySyncButton';
import {DateTimeUpdateModal} from '../../../blocks/DateTimeUpdateModal/DateTimeUpdateModal';
import {string} from 'zod';

export const WorkoutScreen: FC = () => {
  const theme = useAppTheme();
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [entryService] = useEntryService();
  const styles = getStyles(theme);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const auth = useAuth();
  const user = auth.user;
  if (!user) {
    throw new Error('No user');
  }
  const params = useLocalSearchParams();
  const router = useRouter();
  const [db, schema] = useDrizzle();
  useEffect(() => {
    if (params.workoutId) {
      return;
    }
    entryService.addWorkoutEntry(user.id).then((result) => {
      router.setParams({
        workoutId: result.workout.id,
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.workoutId]);
  const validated = ZodHelper.validators.numberOrStringNumber.safeParse(params.workoutId);
  const workoutId = validated.success ? validated.data : 0;

  const queryResult = entryService.useWorkoutEntry(workoutId, [workoutId, params.exerciseId, refreshCounter]);
  // const query = db.query.workouts.findFirst({
  //   where: (t, op) => op.eq(t.id, workoutId),
  //   with: {
  //     exercises: {
  //       with: {
  //         exercise: true,
  //         sets: true,
  //       },
  //     },
  //     sets: {
  //       with: {
  //         exercise: true,
  //       },
  //     },
  //   },
  // });
  // const queryResult = useLiveQuery(query, [workoutId, params.exerciseId, refreshCounter]);
  const entry = queryResult.data;
  const workout = entry?.workout;
  useEffect(() => {
    const validatedExerciseId = string().safeParse(params.exerciseId);
    if (!workout || !validatedExerciseId.success) {
      return;
    }
    addExerciseToWorkout(workout, validatedExerciseId.data);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.exerciseId, workout]);

  if (!queryResult.data || !workout) {
    return <LoadingBlock />;
  }
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
    setRefreshCounter(refreshCounter + 1);
  };

  const addExercise = async () => {
    router.push({
      pathname: './selectExercise',
      params,
    });
  };
  const deleteWorkout = async () => {
    const now = new Date();
    await db.update(schema.entries).set({
      deletedAt: now,
      updatedAt: now,
    })
    .where(
      eq(schema.entries.workoutId, workout.id)
    );
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
    setRefreshCounter(refreshCounter + 1);
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
  };
  const copyWorkout = async () => {
    const workoutEntry = await entryService.copyWorkout(workout);

    scrollViewRef.current?.scrollTo(0, 0);
    router.setParams({
      workoutId: workoutEntry.workout.id,
    });
  };
  const updateDate = (date: Date) => {
    entryService.saveEntry({
      ...entry,
      time: date,
    });
    setRefreshCounter(refreshCounter + 1);
  };
  const dateToString = (date: Date):string => {
    return [
      date.toLocaleDateString(),
      [
        date.getHours().toString().padStart(2, '0'),
        date.getMinutes().toString().padStart(2, '0'),
      ].join(':'),
    ].join(' ');
  };
  const workoutFinished = workout.end !== null;
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ThemedScrollView ref={scrollViewRef} style={{minHeight: '100%'}}>
        <ThemedView style={styles.container}>
          <Stack.Screen options={{title: `Workout ${workout.id}`, headerShown: true}} />
          <ThemedBlock>
            <View style={{flexDirection: 'row'}}>
              <ThemedText style={{flexGrow: 1}}>Time:</ThemedText>
              <TimerBlock key={workout.id} start={workout.start} end={workout.end ?? undefined}/>
            </View>
            <Separator />
            <View style={{flexDirection: 'row'}}>
              <ThemedText style={{flexGrow: 1}}>Date:</ThemedText>
              <ThemedText onPress={() => setDateModalVisible(true)}>{dateToString(entry.time)}</ThemedText>
            </View>
            <Separator />
            <View style={{flexDirection: 'row'}}>
              <ThemedText style={{flexGrow: 1}}>Synced:</ThemedText>
              <EntrySyncButton entry={queryResult.data} />
            </View>
            {!!workoutFinished && (
               <>
                <Separator />
                <View style={{flexDirection: 'row', justifyContent: 'center', gap: 40}}>
                  <ThemedLink onPress={copyWorkout}>Copy</ThemedLink>
                  <ThemedLink onPress={deleteWorkout}>Delete</ThemedLink>
                </View>
              </>
            )}
          </ThemedBlock>
          {workout.exercises.map((x) => (
            <EditableWorkoutExerciseBlock onDelete={deleteExercise} key={x.id} exercise={x} />
          ))}
          <View style={{flexDirection: 'column', alignItems: 'center', marginTop: 10, marginBottom: 30, gap: 50}}>
            <ThemedLink onPress={addExercise}>Add Exercise</ThemedLink>
            {!workoutFinished && (
              <ThemedLink onPress={finishWorkout}>Finish Workout</ThemedLink>
            )}
          </View>
        </ThemedView>
        <DateTimeUpdateModal onClose={() => setDateModalVisible(false)} date={entry.time} visible={dateModalVisible} onUpdate={updateDate} />
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
