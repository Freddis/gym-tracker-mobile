import {StyleSheet, View} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {
  Stack,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from 'expo-router';
import {FC, useContext, useEffect, useState} from 'react';
import {AppExercise} from '@/types/models/AppExercise';
import {useDrizzle} from '@/utils/drizzle';
import {AuthContext} from '@/components/providers/AuthProvider/AuthContext';
import {ThemedTextInput} from '@/components/blocks/ThemedInput/ThemedInput';
import {ThemedLink} from '@/components/blocks/ThemedLink/ThemedLink';
import {ImageUploadButton} from '../../../blocks/ImageUploadButton/ImageUploadButton';
import Slider from '@react-native-community/slider';
import {PickerItemProps, PickerModes, PickerValue} from 'react-native-ui-lib';
import {Equipment, Exercise, Muscle} from '../../../../openapi-client';
import {nativeEnum, string} from 'zod';
import {ThemedPicker} from '../../../blocks/ThemedPicker/ThemedPicker';
import {StringHelper} from '../../../../utils/StringHelper/StringHelper';
import {ThemedPickerButton} from '../../../blocks/ThemedPickerButton/ThemedPickerButton';
import {ThemedScrollView} from '../../../blocks/ThemedScrollView/ThemedScrollView';
import {ScreenContainer} from '../../../blocks/ScreenContainer/ScreenContainer';
import {useExerciseService} from '../../../../utils/ExerciseService/useExerciseService';
import {v4} from 'uuid';

export const CreateExerciseScreen: FC = () => {
  const navigation = useNavigation();
  const auth = useContext(AuthContext);
  const params = useLocalSearchParams();
  const [db, schema] = useDrizzle();
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [baseExercise, setBaseExercise] = useState<Exercise | null>(null);
  const router = useRouter();
  const [name, setName] = useState('');
  const exerciseId = params.exerciseId;
  const [equipment, setEquipment] = useState<Equipment>(Equipment.BODYWEIGHT);
  const [primaryMuscles, setPrimaryMuscles] = useState<Muscle[]>([]);
  const [secondaryMuscles, setSecondaryMuscles] = useState<Muscle[]>([]);
  const [difficulty, setDifficulty] = useState(5);
  const minDifficulty = 1;
  const maxDifficulty = 10;
  const [service] = useExerciseService();
  useEffect(() => {
    const validated = string().safeParse(exerciseId);
    if (!validated.success) {
      return;
    }
    service.getExercise(validated.data).then((item) => {
      setBaseExercise(item);
      setName(item.name);
      setImage(item.images[0] ?? null);
      setDescription(item.description ?? '');
      setEquipment(item.equipment ?? Equipment.BODYWEIGHT);
      setPrimaryMuscles(item.muscles.primary);
      setSecondaryMuscles(item.muscles.secondary);
    });

  }, [exerciseId, service]);
  const user = auth.user;
  if (!user) {
    return null;
  }

  const addExercise = async () => {
    if (name.trim() === '') {
      alert('Invalid name');
      return;
    }
    const newValue: AppExercise = {
      // externalId: null,
      id: v4(),
      name: name,
      description: description,
      difficulty: baseExercise?.difficulty ?? null,
      equipment: null,
      images: baseExercise?.images ?? [],
      params: baseExercise?.params ?? [],
      userId: user.id,
      copiedFromId: baseExercise?.id ?? null,
      parentExerciseId: null,
      createdAt: new Date(),
      updatedAt: null,
      lastPulledAt: null,
      lastPushedAt: null,
      deletedAt: null,
    };
    await db.insert(schema.exercises).values(newValue);
    navigation.goBack();
  };

  const copy = () => {
    router.push({
      pathname: '/app/exercises/selectExercise',
      params: {
        value: 1,
      },
    });
  };

  const equipmentValues: PickerItemProps[] = Object.values(Equipment).map(
    (value) => ({
      label: StringHelper.capitalize(value),
      value: value,
    }),
  );

  const onEquipmentChange = (value: PickerValue) => {
    const parsed = nativeEnum(Equipment).parse(value);
    setEquipment(parsed);
  };
  const onPrimaryMusclesChange = (value: PickerValue) => {
    const parsed = nativeEnum(Muscle).array().parse(value);
    setPrimaryMuscles(parsed);
  };
  const onSecondaryMusclesChange = (value: PickerValue) => {
    const parsed = nativeEnum(Muscle).array().parse(value);
    setSecondaryMuscles(parsed);
  };
  const primaryMusclesValues: PickerItemProps[] = Object.values(Muscle).map(
    (value) => ({
      label: StringHelper.capitalize(value),
      value: value,
    }),
  );
  const secondaryMusclesValues: PickerItemProps[] = Object.values(Muscle).map(
    (value) => ({
      label: StringHelper.capitalize(value),
      value: value,
    }),
  );

  return (
    <ThemedScrollView style={{minHeight: '100%'}}>
      <ScreenContainer style={{paddingTop: 20, paddingBottom: 100}}>
        <Stack.Screen
          options={{
            title: 'Add CustomExercise',
            headerShown: true,
            headerRight: () => (
              <ThemedLink onPress={addExercise}>Save</ThemedLink>
            ),
          }}
        />
        <ThemedView style={styles.titleContainer}>
          <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          <ImageUploadButton
            value={image ?? null}
            style={{
              borderRadius: 20,
              height: 200,
              width: '100%',
            }}
          />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ThemedLink onPress={copy}>Copy From Existing</ThemedLink>
          </View>
          <ThemedText>Name*</ThemedText>
          <ThemedTextInput
            onChangeText={setName}
            value={name}
            style={styles.input}
          />
          <ThemedText>Description</ThemedText>
          <ThemedTextInput
            onChangeText={setDescription}
            value={description}
            style={styles.input}
          />
          <ThemedText>Equipment</ThemedText>
          <ThemedPicker
            value={equipment}
            items={equipmentValues}
            onChange={onEquipmentChange}
          />
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
            <ThemedText style={{flexGrow: 1}}>Difficulty</ThemedText>
            <ThemedText style={{fontWeight: 'bold'}}>{difficulty}</ThemedText>
          </View>
          <Slider
            style={{width: '100%', height: 20, marginBottom: 5}}
            minimumValue={minDifficulty}
            maximumValue={maxDifficulty}
            value={difficulty}
            onValueChange={setDifficulty}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            step={1}
          />
          <View
            style={{flexDirection: 'row', justifyContent: 'space-between'}}
          >
            <ThemedText style={{flexGrow: 1}}>Primary Muscles</ThemedText>
            <ThemedPickerButton
              mode={PickerModes.MULTI}
              onChange={onPrimaryMusclesChange}
              items={primaryMusclesValues}
              value={primaryMuscles}
            >
              Edit
            </ThemedPickerButton>
          </View>
          {primaryMuscles.length === 0 && (
            <ThemedText style={{fontSize: 14, color: 'gray'}}>
              No primary muscles selected
            </ThemedText>
          )}
          {primaryMuscles.length > 0 && (
            <ThemedText style={{fontSize: 14, color: 'gray'}}>
              {primaryMuscles.join(', ')}
            </ThemedText>
          )}
          <View
            style={{flexDirection: 'row', justifyContent: 'space-between'}}
          >
            <ThemedText>Secondary Muscles</ThemedText>
            <ThemedPickerButton
              mode={PickerModes.MULTI}
              onChange={onSecondaryMusclesChange}
              items={secondaryMusclesValues}
              value={secondaryMuscles}
            >
              Edit
            </ThemedPickerButton>
          </View>
          {secondaryMuscles.length === 0 && (
            <ThemedText style={{fontSize: 14, color: 'gray'}}>
              No secondary muscles selected
            </ThemedText>
          )}
          {secondaryMuscles.length > 0 && (
            <ThemedText style={{fontSize: 14, color: 'gray'}}>
              {secondaryMuscles.join(', ')}
            </ThemedText>
          )}
        </ThemedView>
      </ScreenContainer>
    </ThemedScrollView>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  input: {
    marginBottom: 20,
  },
});
