import {FC, useEffect, useState} from 'react';
import {KeyboardAvoidingView, Platform, View} from 'react-native';
import {useRouter} from 'expo-router';
import {useAtom} from 'jotai';
import Slider from '@react-native-community/slider';
import {PickerItemProps, PickerModes, PickerValue} from 'react-native-ui-lib';
import {nativeEnum} from 'zod';
import {Equipment, Exercise, Muscle} from '../../../../openapi-client';
import {useAppTheme} from '../../../../hooks/useAppTheme';
import {StringHelper} from '../../../../utils/StringHelper/StringHelper';
import {AppSeparator} from '../../../blocks/AppSeparator/AppSeparator';
import {ImageUploadButton} from '../../../blocks/ImageUploadButton/ImageUploadButton';
import {ThemedBlock} from '../../../blocks/ThemedBlock/ThemedBlock';
import {ThemedTextInput} from '../../../blocks/ThemedInput/ThemedInput';
import {ThemedLink} from '../../../blocks/ThemedLink/ThemedLink';
import {ThemedPicker} from '../../../blocks/ThemedPicker/ThemedPicker';
import {ThemedPickerButton} from '../../../blocks/ThemedPickerButton/ThemedPickerButton';
import {ThemedScrollView} from '../../../blocks/ThemedScrollView/ThemedScrollView';
import {ThemedText} from '../../../blocks/ThemedText/ThemedText';
import {ExerciseUpdateFormProps} from './types/ExerciseUpdateFormProps';
import {copiedExerciseAtom} from '../copiedExerciseAtom';

const equipmentValues: PickerItemProps[] = Object.values(Equipment).map((value) => ({
  label: StringHelper.capitalize(value),
  value: value,
})).sort((a, b) => a.label > b.label ? 1 : -1);

const muscleValues: PickerItemProps[] = Object.values(Muscle).map((value) => ({
  label: StringHelper.capitalize(value),
  value: value,
})).sort((a, b) => a.label > b.label ? 1 : -1);

const minDifficulty = 1;
const maxDifficulty = 10;

export const ExerciseUpdateForm: FC<ExerciseUpdateFormProps> = (props) => {
  const [exercise, setExercise] = useState(props.exercise);
  const [name, setName] = useState(props.exercise.name ?? '');
  const [description, setDescription] = useState(props.exercise.description ?? '');
  const [image, setImage] = useState<string | null>(props.exercise.images[0]?.url ?? null);
  const [copiedExercise, setCopiedExercise] = useAtom(copiedExerciseAtom);
  const router = useRouter();
  const theme = useAppTheme();

  const emitChange = (updatedExercise: Exercise, nextImage?: string | null) => {
    updatedExercise.updatedAt = new Date();
    setExercise(updatedExercise);
    props.onChange(updatedExercise, nextImage);
  };

  useEffect(() => {
    if (!copiedExercise) {
      return;
    }
    setCopiedExercise(null);
    setName(copiedExercise.name);
    setDescription(copiedExercise.description ?? '');
    setImage(copiedExercise.images[0]?.url ?? null);
    emitChange({
      ...exercise,
      name: copiedExercise.name,
      description: copiedExercise.description,
      difficulty: copiedExercise.difficulty,
      equipment: copiedExercise.equipment,
      params: copiedExercise.params,
      images: copiedExercise.images,
      muscles: {
        primary: [...copiedExercise.muscles.primary],
        secondary: [...copiedExercise.muscles.secondary],
      },
      copiedFromId: copiedExercise.id,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [copiedExercise]);

  const onCopyPress = () => {
    router.navigate('/app/exercises/selectExercise');
  };

  const onNameChange = (nextName: string) => {
    setName(nextName);
    emitChange({
      ...exercise,
      name: nextName,
    });
  };

  const onDescriptionChange = (nextDescription: string) => {
    setDescription(nextDescription);
    emitChange({
      ...exercise,
      description: nextDescription,
    });
  };

  const onEquipmentChange = (value: PickerValue) => {
    const parsed = nativeEnum(Equipment).parse(value);
    emitChange({
      ...exercise,
      equipment: parsed,
    });
  };

  const onDifficultyChange = (difficulty: number) => {
    emitChange({
      ...exercise,
      difficulty,
    });
  };

  const onPrimaryMusclesChange = (value: PickerValue) => {
    const parsed = value == null || (Array.isArray(value) && value.length === 0)
      ? []
      : nativeEnum(Muscle).array().parse(value);
    emitChange({
      ...exercise,
      muscles: {
        ...exercise.muscles,
        primary: parsed,
      },
    });
  };

  const onSecondaryMusclesChange = (value: PickerValue) => {
    const parsed = value == null || (Array.isArray(value) && value.length === 0)
      ? []
      : nativeEnum(Muscle).array().parse(value);
    emitChange({
      ...exercise,
      muscles: {
        ...exercise.muscles,
        secondary: parsed,
      },
    });
  };

  const updateImage = async (nextImage: string | null) => {
    setImage(nextImage);
    emitChange({
      ...exercise,
    }, nextImage);
  };

  const difficulty = exercise.difficulty ?? 5;
  const primaryMuscles = exercise.muscles.primary;
  const secondaryMuscles = exercise.muscles.secondary;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ThemedScrollView className="h-full">
        <View className="gap-m p-m">
          <ThemedBlock>
            <View className="py-1">
              <View className="flex-row items-center justify-between gap-s">
                <ThemedText>Name</ThemedText>
                <ThemedTextInput value={name} onChangeText={onNameChange} className="grow" style={{textAlign: 'right'}} />
              </View>
              <AppSeparator />
              <View className="flex-row items-center justify-between">
                <ThemedText>Image</ThemedText>
                <ImageUploadButton value={image} onChange={updateImage} className="w-20 h-20" />
              </View>
              <AppSeparator />
              <View className="gap-s">
                <ThemedText>Description</ThemedText>
                <ThemedTextInput
                  value={description}
                  onChangeText={onDescriptionChange}
                  multiline
                  className="min-h-24"
                  style={{textAlignVertical: 'top'}}
                  variant="on-surface"
                />
              </View>
              <AppSeparator />
              <View className="gap-s">
                <ThemedText>Equipment</ThemedText>
                <ThemedPicker
                  value={exercise.equipment ?? Equipment.BODYWEIGHT}
                  items={equipmentValues}
                  onChange={onEquipmentChange}
                  containerStyle={{marginBottom: 0}}
                />
              </View>
              <AppSeparator />
              <View className="flex-row items-center gap-s">
                <ThemedText className="grow">Difficulty</ThemedText>
                <ThemedText className="font-bold">{difficulty}</ThemedText>
              </View>
              <Slider
                style={{width: '100%', height: 20}}
                minimumValue={minDifficulty}
                maximumValue={maxDifficulty}
                value={difficulty}
                onValueChange={onDifficultyChange}
                minimumTrackTintColor={theme.accent}
                maximumTrackTintColor={theme.cavity}
                step={1}
              />
              <AppSeparator />
              <View className="flex-row items-center justify-between">
                <ThemedText>Primary Muscles</ThemedText>
                <ThemedPickerButton
                  mode={PickerModes.MULTI}
                  onChange={onPrimaryMusclesChange}
                  items={muscleValues}
                  value={primaryMuscles}
                >
                  Edit
                </ThemedPickerButton>
              </View>
              <ThemedText className="text-sm capitalize">
                {primaryMuscles.length === 0 ? 'No primary muscles selected' : primaryMuscles.join(', ')}
              </ThemedText>
              <AppSeparator />
              <View className="flex-row items-center justify-between">
                <ThemedText>Secondary Muscles</ThemedText>
                <ThemedPickerButton
                  mode={PickerModes.MULTI}
                  onChange={onSecondaryMusclesChange}
                  items={muscleValues}
                  value={secondaryMuscles}
                >
                  Edit
                </ThemedPickerButton>
              </View>
              <ThemedText className="text-sm capitalize">
                {secondaryMuscles.length === 0 ? 'No secondary muscles selected' : secondaryMuscles.join(', ')}
              </ThemedText>
              <AppSeparator />
              <View className="flex-row justify-center">
                <ThemedLink onPress={onCopyPress} accented>Copy From Existing</ThemedLink>
              </View>
              {props.onDelete && (
                <>
                  <AppSeparator />
                  <View className="flex-row justify-center">
                    <ThemedLink accented onPress={props.onDelete}>Delete</ThemedLink>
                  </View>
                </>
              )}
            </View>
          </ThemedBlock>
        </View>
      </ThemedScrollView>
    </KeyboardAvoidingView>
  );
};
