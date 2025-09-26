import {StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {Stack, useLocalSearchParams, useRouter} from 'expo-router';
import {FC, useEffect, useRef, useState} from 'react';
import {useDrizzle} from '@/utils/drizzle';
import {AppWorkout, CompleteAppWorkout} from '@/types/models/AppWorkout';
import {NewModel} from '@/types/NewModel';
import {LoadingBlock} from '@/components/blocks/LoadingBlock/LoadingBlock';
import {useAuth} from '@/components/providers/AuthProvider/useAuth';
import {useLiveQuery} from 'drizzle-orm/expo-sqlite';
import {ZodHelper} from '@/utils/ZodHelper/ZodHelper';
import {eq} from 'drizzle-orm';
import {AppWorkoutExercise, CompleteAppWorkoutExercise} from '@/types/models/AppWorkoutExercise';
import {TimerBlock} from '@/components/blocks/TimerBlock/TimerBlock';
import {ThemedScrollView} from '@/components/blocks/ThemedScrollView/ThemedScrollView';
import {EditableWorkoutExerciseBlock} from './components/EditableWorkoutExerciseBlock/EditableWorkoutExerciseBlock';
import {WorkoutSyncButton} from './components/WorkoutSyncButton/WorkoutSyncButton';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {Separator} from '@/components/blocks/Separator/Separator';
import {ThemedLink} from '@/components/blocks/ThemedLink/ThemedLink';
import {useAppTheme} from '@/hooks/useAppTheme';
import {Theme} from '@/types/Colors';

export const WorkoutScreen: FC = () => {
  const theme = useAppTheme();
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
    const newWorkout: NewModel<AppWorkout> = {
      externalId: null,
      typeId: null,
      userId: user.id,
      calories: 0,
      start: new Date(),
      end: null,
      createdAt: new Date(),
      updatedAt: null,
      lastPulledAt: null,
      lastPushedAt: null,
      deletedAt: null,
    };
    db.insert(schema.workouts)
      .values(newWorkout)
      .then((workout) => {
        router.setParams({
          workoutId: workout.lastInsertRowId,
        });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.workoutId]);
  const validated = ZodHelper.validators.numberOrStringNumber.safeParse(params.workoutId);
  const workoutId = validated.success ? validated.data : 0;
  const query = db.query.workouts.findFirst({
    where: (t, op) => op.eq(t.id, workoutId),
    with: {
      exercises: {
        with: {
          exercise: true,
          sets: true,
        },
      },
      sets: {
        with: {
          exercise: true,
        },
      },
    },
  });
  const queryResult = useLiveQuery(query, [workoutId, params.exerciseId, refreshCounter]);
  const workout = queryResult.data;
  useEffect(() => {
    const validatedExerciseId = ZodHelper.validators.numberOrStringNumber.safeParse(params.exerciseId);
    if (!workout || !validatedExerciseId.success) {
      return;
    }
    addExerciseToWorkout(workout, validatedExerciseId.data);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.exerciseId, workout]);

  if (!workout) {
    return <LoadingBlock />;
  }
  const addExerciseToWorkout = async (workout: CompleteAppWorkout, exerciseId: number) => {
    const workoutExercise: NewModel<AppWorkoutExercise> = {
      workoutId: workout.id,
      externalId: null,
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
    console.log('Updating counter');
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
    await db.update(schema.workouts).set({
      deletedAt: now,
      updatedAt: now,
    })
    .where(
      eq(schema.workouts.id, workout.id)
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
    console.log('refresh');
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
    const now = new Date();
    const newWorkout: NewModel<AppWorkout> = {
      externalId: null,
      createdAt: now,
      updatedAt: null,
      deletedAt: null,
      lastPulledAt: null,
      lastPushedAt: null,
      start: now,
      end: null,
      userId: workout.userId,
      typeId: workout.typeId,
      calories: 0,
    };
    const newWorkoutId = await db.transaction(async (db) => {
      const insertedRow = await db.insert(schema.workouts)
        .values(newWorkout);
      const newWorkoutId = insertedRow.lastInsertRowId;
      for (const exercise of workout.exercises) {
        const newExercise: NewModel<AppWorkoutExercise> = {
          externalId: null,
          userId: exercise.userId,
          createdAt: exercise.createdAt,
          updatedAt: null,
          workoutId: newWorkoutId,
          exerciseId: exercise.exerciseId,
        };
        await db.insert(schema.workoutExercises).values(newExercise);
      }
      return newWorkoutId;
    });
    scrollViewRef.current?.scrollTo(0, 0);
    router.setParams({
      workoutId: newWorkoutId,
    });
  };
  const workoutFinished = workout.end !== null;
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ThemedScrollView ref={scrollViewRef}>
        <ThemedView style={styles.container}>
          <Stack.Screen options={{title: `Workout ${workout.id}`, headerShown: true}} />
           <ThemedBlock>
            <View style={{flexDirection: 'row'}}>
              <ThemedText style={{flexGrow: 1}}>Time:</ThemedText>
              <TimerBlock key={workout.id} start={workout.start} end={workout.end ?? undefined}/>
            </View>
            <Separator />
            <View style={{flexDirection: 'row'}}>
              <ThemedText style={{flexGrow: 1}}>Synced:</ThemedText>
              <WorkoutSyncButton workout={workout} />
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
          <View style={{flexDirection: 'column', alignItems: 'center', marginTop: 10, marginBottom: 30}}>
            <ThemedLink onPress={addExercise}>Add Exercise</ThemedLink>
            {!workoutFinished && (
              <ThemedLink onPress={finishWorkout}>Finish Workout</ThemedLink>
            )}
          </View>
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
