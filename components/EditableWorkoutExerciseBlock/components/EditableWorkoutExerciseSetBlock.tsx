import {ThemedIcon} from "@/components/ThemedIcon";
import {ThemedTextInput} from "@/components/ThemedInput";
import {ThemedText} from "@/components/ThemedText";
import {IconSymbolName} from "@/components/ui/IconSymbol";
import {AppWorkoutExerciseSet} from "@/types/models/AppWorkoutExerciseSet";
import {useDrizzle} from "@/utils/drizzle";
import {ZodHelper} from "@/utils/ZodHelper/ZodHelper";
import {eq} from "drizzle-orm";
import {FC, useState} from "react";
import {Button, Pressable, StyleProp, TextStyle, View} from "react-native";

export const EditableWorkoutExerciseSetBlock: FC<{index: number, set: AppWorkoutExerciseSet, onDelete: (set: AppWorkoutExerciseSet)=> void}> = (props) => {
  const set = props.set
  const [db,schema] = useDrizzle();
  const [weight,setWeight] = useState(set.weight?.toString() ?? '')
  const [weightError, setWeightError] = useState(false);
  const [reps,setReps] = useState(set.reps?.toString() ?? '')
  const [repsError, setRepsError] = useState(false);
  const [finished, setFinished] = useState(set.finished)
  const checkMarkIcon: IconSymbolName = finished ? 'checkmark.rectangle' : 'rectangle'
  const inputStyle: StyleProp<TextStyle> = {
    width: 50,
    textAlign: 'center',
    height: 30,
    borderWidth: 2,
  }
  const errorStyle: StyleProp<TextStyle>  = {
    borderColor: 'red',
    color: 'red'
  }
  const weightStyle = {
    ...inputStyle,
    ...(weightError ? errorStyle : {})
  }
  const repsStyle = {
    ...inputStyle,
    ...(repsError ? errorStyle : {})
  }
  const iconColor = (repsError || weightError) ? 'red' : undefined
  const toggleCheckmark= async () => {
    const validatedWeight = ZodHelper.validators.numberOrStringNumber.safeParse(weight)
    const validatedReps = ZodHelper.validators.numberOrStringNumber.safeParse(reps)
    if(!finished){
      console.log(finished)
      if(!validatedReps.success || !validatedWeight.success){
        setWeightError(!validatedWeight.success)
        setRepsError(!validatedReps.success)
        return;
      }
    }
    console.log("Updating")
    set.weight = validatedWeight.data ?? null
    set.reps = validatedReps.data ?? null
    set.finished = true;
    await db.update(schema.workoutExerciseSets).set({
      updatedAt: new Date(),
      weight: validatedWeight.data,
      reps: validatedReps.data,
      finished: true,
    }).where(
      eq(schema.workoutExerciseSets.id,set.id)
    )
    console.log("here")
    setWeightError(false)
    setRepsError(false)
    setFinished(!finished)

  }
  const deleteSet = async () => {
    props.onDelete(set)
  }
  const updateWeight = (value: string) => {
    setWeight(value);
    setFinished(false);
  }
  const updateReps = (value: string) => {
    setReps(value);
    setFinished(false);
  }
  return (
    <View style={{flexDirection: 'row', backgroundColor: '', gap: 10, marginBottom: 5, alignItems: 'center', alignContent: 'space-evenly'}}>
      {/* <ThemedText style={{fontSize: 13}}>{props.index+1}: {set.weight} x {set.reps}</ThemedText> */}
      <ThemedText style={{fontSize: 13}}>{props.index+1}:</ThemedText>
      <ThemedTextInput type="background"   style={weightStyle} onChangeText={updateWeight} value={weight.toString()} />
      <ThemedText style={{fontSize: 13}}>x</ThemedText>
      <ThemedTextInput type="background" style={repsStyle}  onChangeText={updateReps} value={reps.toString()} />
      <Pressable onPress={toggleCheckmark}>
        <ThemedIcon  color={iconColor} size={40} name={checkMarkIcon} />
      </Pressable>
      <Button onPress={deleteSet} color='red' title="Delete" />
    </View>
  )
}