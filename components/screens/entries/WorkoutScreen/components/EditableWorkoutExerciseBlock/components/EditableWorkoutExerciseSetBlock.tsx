import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {IconSymbolName} from '@/components/blocks/IconSymbol/IconSymbol';
import {useDrizzle} from '@/utils/drizzle';
import {ZodHelper} from '@/utils/ZodHelper/ZodHelper';
import {eq} from 'drizzle-orm';
import {FC, useState} from 'react';
import {Pressable, View, StyleSheet} from 'react-native';
import {EditableWorkoutExerciseSetBlockProps} from './types/EditableWorkoutExerciseSetBlockProps';
import {ThemedIcon} from '@/components/blocks/ThemedIcon/ThemedIcon';
import {ThemedTextInput} from '@/components/blocks/ThemedInput/ThemedInput';
import {ThemedLink} from '@/components/blocks/ThemedLink/ThemedLink';
import {Theme} from '@/types/Colors';
import {useAppTheme} from '@/hooks/useAppTheme';

const getStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '',
    gap: theme.marginS,
    marginBottom: theme.marginS,
    alignItems: 'center',
    alignContent: 'space-evenly',
  },
  inputs: {
    width: 50,
    borderColor: theme.surfaceText,
    textAlign: 'center',
    height: 30,
    borderWidth: 2,
  },
  errorStyle: {
    borderColor: theme.dangerText,
    color: theme.dangerText,
  },
});

export const EditableWorkoutExerciseSetBlock: FC<EditableWorkoutExerciseSetBlockProps> = (props) => {
  const set = props.set;
  const theme = useAppTheme();
  const [db, schema] = useDrizzle();
  const [weight, setWeight] = useState(set.weight?.toString() ?? '');
  const [weightError, setWeightError] = useState(false);
  const [reps, setReps] = useState(set.reps?.toString() ?? '');
  const [repsError, setRepsError] = useState(false);
  const [finished, setFinished] = useState(set.finished);
  const checkMarkIcon: IconSymbolName = finished ? 'checkmark.rectangle' : 'rectangle';
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
  const styles = getStyles(theme);
  return (
    <View style={styles.container}>
      <ThemedText style={{fontSize: 13}}>{props.index + 1}:</ThemedText>
      <ThemedTextInput
        returnKeyType="done"
        keyboardType="numeric"
        selectTextOnFocus
        style={[styles.inputs, weightError ? styles.errorStyle : {}]}
        onChangeText={updateWeight}
        value={weight.toString()}
      />
      <ThemedText style={{fontSize: 13}}>x</ThemedText>
      <ThemedTextInput
        returnKeyType="done"
        keyboardType="numeric"
        inputMode="decimal"
        selectTextOnFocus
        style={[styles.inputs, repsError ? styles.errorStyle : {}]}
        onChangeText={updateReps}
        value={reps.toString()}
      />
      <Pressable onPress={toggleCheckmark}>
        <ThemedIcon color={iconColor} size={40} name={checkMarkIcon} />
      </Pressable>
      <View style={{flexGrow: 1, flexDirection: 'row-reverse'}}>
        <ThemedLink iconName="xmark" iconSize={14} onPress={deleteSet}/>
      </View>
    </View>
  );
};
