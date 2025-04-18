import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {IconSymbolName} from '@/components/blocks/IconSymbol/IconSymbol';
import {useDrizzle} from '@/utils/drizzle';
import {ZodHelper} from '@/utils/ZodHelper/ZodHelper';
import {eq} from 'drizzle-orm';
import {FC, useState} from 'react';
import {Button, Pressable, StyleProp, TextStyle, View, ViewStyle} from 'react-native';
import {EditableWorkoutExerciseSetBlockProps} from './types/EditableWorkoutExerciseSetBlockProps';
import {ThemedIcon} from '@/components/blocks/ThemedIcon/ThemedIcon';
import {ThemedTextInput} from '@/components/blocks/ThemedInput/ThemedInput';

export const EditableWorkoutExerciseSetBlock: FC<EditableWorkoutExerciseSetBlockProps> = (props) => {
  const set = props.set;
  const [db, schema] = useDrizzle();
  const [weight, setWeight] = useState(set.weight?.toString() ?? '');
  const [weightError, setWeightError] = useState(false);
  const [reps, setReps] = useState(set.reps?.toString() ?? '');
  const [repsError, setRepsError] = useState(false);
  const [finished, setFinished] = useState(set.finished);
  const checkMarkIcon: IconSymbolName = finished ? 'checkmark.rectangle' : 'rectangle';
  const inputStyle: StyleProp<TextStyle> = {
    width: 50,
    textAlign: 'center',
    height: 30,
    borderWidth: 2,
  };
  const errorStyle: StyleProp<TextStyle> = {
    borderColor: 'red',
    color: 'red',
  };
  const weightStyle = {
    ...inputStyle,
    ...(weightError ? errorStyle : {}),
  };
  const repsStyle = {
    ...inputStyle,
    ...(repsError ? errorStyle : {}),
  };
  const iconColor = (repsError || weightError) ? 'red' : undefined;
  const toggleCheckmark = async () => {
    const validatedWeight = ZodHelper.validators.numberOrStringNumber.safeParse(weight);
    const validatedReps = ZodHelper.validators.numberOrStringNumber.safeParse(reps);
    if (!finished) {
      if (!validatedReps.success || !validatedWeight.success) {
        setWeightError(!validatedWeight.success);
        setRepsError(!validatedReps.success);
        return;
      }
    }
    set.weight = validatedWeight.data ?? null;
    set.reps = validatedReps.data ?? null;
    set.finished = true;
    await db.update(schema.workoutExerciseSets).set({
      updatedAt: new Date(),
      weight: validatedWeight.data,
      reps: validatedReps.data,
      finished: true,
    }).where(
      eq(schema.workoutExerciseSets.id, set.id)
    );
    await db.update(schema.workouts).set({
      updatedAt: new Date(),
    }).where(
      eq(schema.workouts.id, set.workoutId)
    );
    setWeightError(false);
    setRepsError(false);
    setFinished(!finished);

  };
  const deleteSet = async () => {
    props.onDelete(set);
  };
  const updateWeight = (value: string) => {
    setWeight(value);
  };
  const updateReps = (value: string) => {
    setReps(value);
  };
  const viewStyle: StyleProp<ViewStyle> = {
    flexDirection: 'row',
    backgroundColor: '', gap: 10, marginBottom: 5, alignItems: 'center', alignContent: 'space-evenly'};
  return (
    <View style={viewStyle}>
      <ThemedText style={{fontSize: 13}}>{props.index + 1}:</ThemedText>
      <ThemedTextInput
        returnKeyType="done"
        keyboardType="numeric"
        selectTextOnFocus
        type="background"
        style={weightStyle}
        onChangeText={updateWeight}
        value={weight.toString()}
      />
      <ThemedText style={{fontSize: 13}}>x</ThemedText>
      <ThemedTextInput
        returnKeyType="done"
        keyboardType="numeric"
        selectTextOnFocus type="background"
        style={repsStyle}
        onChangeText={updateReps}
        value={reps.toString()}
      />
      <Pressable onPress={toggleCheckmark}>
        <ThemedIcon color={iconColor} size={40} name={checkMarkIcon} />
      </Pressable>
      <Button onPress={deleteSet} color="red" title="Delete" />
    </View>
  );
};
