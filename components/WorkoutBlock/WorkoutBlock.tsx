import {Workout} from "@/openapi-client";
import {FC} from "react";
import {StyleProp, ImageStyle, ViewStyle, View, Image} from "react-native";
import {ThemedText} from "../ThemedText";
import {ThemedView} from "../ThemedView";
import {ExerciseWithSets} from "./types/ExerciseWithSets";

export const WorkoutBlock: FC<{workout: Workout}> = (props) => {
  const workout = props.workout;
  const convertSets = (workout: Workout) : ExerciseWithSets[] => {
    const map = new Map<number, ExerciseWithSets>();
    for (const set of workout.sets) {
      const exercise: ExerciseWithSets = map.get(set.exercise.id) ?? {exercise: set.exercise, sets: []};
      exercise.sets.push(set);
      map.set(exercise.exercise.id, exercise);
    }
    const exercises = Array.from(map.values());
    return exercises;
  };
  const exercises = convertSets(workout);
  const imgStyle: StyleProp<ImageStyle> = {
    width: 50, 
    height: 50,
    borderWidth: 3,
    borderColor: 'white',
    borderRadius: 50
  }
  const exerciseStyle: StyleProp<ViewStyle> = {
    marginBottom: 10,
    display: 'flex',
    flexDirection: 'row',
  }
  return (
    <ThemedView style={{marginBottom: 20, display: 'flex', padding: 10, borderRadius: 5}} type='backgroundSecondary'>
      <View style={{ flexDirection: 'row-reverse'}}>
        <ThemedText style={{fontSize: 13}}>{workout.createdAt.toLocaleString('en-GB',{weekday:'long'})} {workout.createdAt.toLocaleDateString()}</ThemedText>
      </View>
      <View style={{marginBottom: 10}}>
        <ThemedText>Calories: {workout.calories}</ThemedText>
      </View>
      <View>
        {exercises.map( (item,i) => (
          <ThemedView key={i} style={exerciseStyle} type='backgroundSecondary'>
            <Image src={item.exercise.images[0]} style={imgStyle} />
            <View style={{marginLeft: 10, overflow: 'hidden'}}>
              <ThemedText style={{fontSize: 13, overflow: 'hidden'}}>{item.exercise.name}</ThemedText>
              {item.sets.map((set,i) => (
                <View key={i}>
                  <ThemedText style={{fontSize: 13}}>{i+1}: {set.weight} x {set.reps}</ThemedText>
                </View>
              ))}
            </View>
          </ThemedView>
        ))}
      </View>
    </ThemedView>
  )
}