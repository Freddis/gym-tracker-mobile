import {FC, useState} from "react";
import {StyleProp, ImageStyle, ViewStyle, View, Image, Button} from "react-native";
import {ThemedText} from "../ThemedText";
import {ThemedView} from "../ThemedView";
import {EditableWorkoutExerciseBlockProps} from "./types/EditableWorkoutExerciseBlockProps";
import {useDrizzle} from "@/utils/drizzle";
import {NewModel} from "@/types/NewModel";
import {AppWorkoutExerciseSet} from "@/types/models/AppWorkoutExerciseSet";
import {EditableWorkoutExerciseSetBlock} from "./components/EditableWorkoutExerciseSetBlock";
import {eq} from "drizzle-orm";

export const  EditableWorkoutExerciseBlock: FC<EditableWorkoutExerciseBlockProps> = (props) => {
  const exercise = props.exercise.exercise;
  const [sets, setSets] = useState(props.exercise.sets);
  console.log(props.exercise)
  const [db,schema] = useDrizzle();
  const imgStyle: StyleProp<ImageStyle> = {
    width: 30, 
    height: 30,
    borderWidth: 3,
    borderColor: 'white',
    borderRadius: 50
  }
  const exerciseStyle: StyleProp<ViewStyle> = {
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
    display: 'flex',
    flexDirection: 'row',
  }
  const addSet = async () => {
    const lastSet = sets[sets.length -1];
    const reps = lastSet?.reps ?? 0;
    const weight = lastSet?.weight ?? 0;
    const newSet: NewModel<AppWorkoutExerciseSet> = {
      externalId: null,
      workoutId: props.exercise.workoutId,
      exerciseId: props.exercise.exerciseId,
      userId: props.exercise.userId,
      createdAt: new Date(),
      updatedAt: null,
      workoutExerciseId: props.exercise.id,
      start: new Date(),
      end: new Date(),
      finished: false,
      weight: weight,
      reps: reps,
    }
    const result = await db.insert(schema.workoutExerciseSets).values(newSet);
    const set: AppWorkoutExerciseSet = {
      ...newSet,
      id: result.lastInsertRowId
    }
    setSets([...sets,set]);
  }
  const deleteSet = async (set: AppWorkoutExerciseSet) => {
    await db.delete(schema.workoutExerciseSets).where(
      eq(schema.workoutExerciseSets.id,set.id)
    )
    const newsets = sets.filter(x => x.id !== set.id)
    setSets(newsets)
  }
  return (
     <ThemedView style={exerciseStyle} type='backgroundSecondary'>
      <Image src={exercise.images[0]} style={imgStyle} />
      <View style={{marginLeft: 10, flexGrow: 1}}>
        <View style={{ flexDirection: 'row', alignItems: 'center'}}>
          <ThemedText style={{fontSize: 13}}>{exercise.name}</ThemedText>
          <View style={{flexGrow: 1, flexDirection: 'row-reverse'}}>
            <Button color={'red'} onPress={() => props.onDelete(props.exercise)} title="Delete"/>
          </View>
        </View>
        {sets.map((set,i) => <EditableWorkoutExerciseSetBlock onDelete={deleteSet} key={set.id} set={set} index={i} />)}
        <View>
          <Button onPress={addSet} title="Add Set"/>
        </View>
      </View>
    </ThemedView>
  )
}