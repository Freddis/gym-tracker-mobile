import { StyleSheet, Button, View, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {useDrizzle} from '@/utils/drizzle';
import {AppWorkout} from '@/types/models/AppWorkout';
import {NewModel} from '@/types/NewModel';
import {LoadingBlock} from '@/components/LoadingBlock/LoadingBlock';
import {useAuth} from '@/components/AuthProvider/useAuth';
import {useLiveQuery} from 'drizzle-orm/expo-sqlite';
import {ZodHelper} from '@/utils/ZodHelper/ZodHelper';
import {eq} from 'drizzle-orm';
import {AppWorkoutExercise, CompleteAppWorkoutExercise} from '@/types/models/AppWorkoutExercise';
import {TimerBlock} from '@/components/TimerBlock/TimerBlock';
import {EditableWorkoutExerciseBlock} from '@/components/EditableWorkoutExerciseBlock/EditableWorkoutExerciseBlock';
import {ThemedScrollView} from '@/components/ThemedScrollView';

export default function AddWorkoutScreen() {
  const [refreshCounter, setRefreshCounter] = useState(0)
  const auth = useAuth();
  const user = auth.user;
  if(!user){
    throw new Error("No user")
  }
  const params = useLocalSearchParams()
  const router = useRouter()
  const [db,schema] = useDrizzle()
  useEffect(() => {
    if(params.workoutId){
      return
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
      deletedAt: null
    }
    db.insert(schema.workouts)
      .values(newWorkout)
      .then( workout => {
        router.setParams({
          workoutId: workout.lastInsertRowId
        })
      })    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[params.workoutId]);
  const validated = ZodHelper.validators.numberOrStringNumber.safeParse(params.workoutId)
  const workoutId = validated.success ? validated.data : 0
  const query = db.query.workouts.findFirst({
    where: (t,op) => op.eq(t.id,workoutId),
    with: {
      exercises: {
        with: {
          exercise: true,
          sets: true,
        }
      }, 
      sets: {
        with: {
          exercise: true
        }
      },
    },
  })
  const queryResult = useLiveQuery(query,[workoutId,params.exerciseId,refreshCounter])
  const workout = queryResult.data
  useEffect(()=> {
    const validatedExerciseId = ZodHelper.validators.numberOrStringNumber.safeParse(params.exerciseId)
    if(!workout || !validatedExerciseId.success){
      return
    }
    const workoutExercise: NewModel<AppWorkoutExercise> = {
      workoutId: workout.id,
      externalId: null,
      userId: user.id,
      createdAt: new Date(),
      updatedAt: null,
      exerciseId: validatedExerciseId.data,
    }
    db.insert(schema.workoutExercises).values(workoutExercise).then(() => {
      router.setParams({
        ...params,
        exerciseId: undefined,
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[params.exerciseId,workout])

  if(!workout){
    return <LoadingBlock />
  }

  const addExercise = async () => {
    router.push({
      pathname: './selectExercise',
      params,
    })
  }
  const deleteWorkout = async () => {
    const now =  new Date();
    await db.update(schema.workouts).set({
      deletedAt: now,
      updatedAt: now,
    })
    .where(
      eq(schema.workouts.id,workout.id)
    )
    router.back()
  }
  const deleteExercise = async (exercise: CompleteAppWorkoutExercise) => {
    await db.delete(schema.workoutExerciseSets).where(
      eq(schema.workoutExerciseSets.workoutExerciseId,exercise.id)
    )
    await db.delete(schema.workoutExercises).where(
      eq(schema.workoutExercises.id,exercise.id)
    ) 
    setRefreshCounter(refreshCounter + 1)
  }
  const finishWorkout  = async () => {
    await db.update(schema.workouts).set({
      end: new Date(),
    }).where(
      eq(schema.workouts.id,workout.id)
    )
    router.back()
  }
  const workoutFinished = workout.end !== null;
  return (   
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ThemedScrollView>
        <ThemedView style={styles.titleContainer}>
          <Stack.Screen options={{ title: `Workout ${workout.id}`, headerShown: true }} />
          <View style={{flexDirection: 'row'}}>
            <ThemedText>Time: </ThemedText>
            <TimerBlock start={workout.start} end={workout.end ?? undefined}/>
          </View>
          {workout.exercises.map( x => <EditableWorkoutExerciseBlock onDelete={deleteExercise} key={x.exercise.id} exercise={x} />)}
          <Button onPress={addExercise} title='Add Exercise'/>
          {!workoutFinished && (
            <View style={{marginTop: 20}}>
            <Button onPress={finishWorkout} title='Finish Workout'/>
          </View>
          )}
          {workoutFinished && (
            <View style={{marginTop: 20}}>
            <Button color={'red'} onPress={deleteWorkout} title='Delete Workout'/>
          </View>
          )}
        </ThemedView>
      </ThemedScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'column',
    padding: 20,
    marginBottom: 80,
    gap: 8,
    flex: 1,
    flexGrow: 1,
  }
});
