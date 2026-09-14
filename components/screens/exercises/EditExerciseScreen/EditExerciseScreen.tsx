import {StyleSheet, Button} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {Stack, useLocalSearchParams, useNavigation, useRouter} from 'expo-router';
import {FC, useContext, useEffect, useState} from 'react';
import {AuthContext} from '@/components/providers/AuthProvider/AuthContext';
import {ThemedTextInput} from '@/components/blocks/ThemedInput/ThemedInput';
import {string} from 'zod';
import uuid from 'react-native-uuid';
import {ThemedImage} from '../../../blocks/ThemedImage/ThemedImage';
import {Exercise} from '../../../../openapi-client';
import {useServices} from '../../../providers/ServiceProvider/ServiceProvider';

export const EditExerciseScreen: FC = () => {
  const navigation = useNavigation();
  const auth = useContext(AuthContext);
  const params = useLocalSearchParams();
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const placeHolderImage = require('@/assets/images/icon.png');
  const [baseExercise, setBaseExercise] = useState<Exercise | null>(null);
  const {exerciseService} = useServices();
  const router = useRouter();
  const [name, setName] = useState('');
  const exerciseId = params.exerciseId as string;
  useEffect(() => {
    const validated = string().safeParse(exerciseId);
    if (!validated.success) {
      return;
    }
    exerciseService.getExercise(validated.data).then((item) => {
      if (!item) {
        return;
      }
      setBaseExercise(item);
      setName(item.name);
      setImage(item.images[0]?.url ?? null);
      setDescription(item.description ?? description);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exerciseId]);
  const user = auth.user;
  if (!user) {
    return null;
  }

  const addExercise = async () => {
    if (name.trim() === '') {
      alert('Invalid name');
      return;
    }
    const newValue: Exercise = {
      id: uuid.v4(),
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
      deletedAt: null,
      isArchived: false,
      variations: [],
      muscles: baseExercise?.muscles ?? {
        primary: [],
        secondary: [],
      },
    };
    await exerciseService.createExercise(newValue);
    navigation.goBack();
  };

  const copy = () => {
    router.navigate({
      pathname: '/app/exercises/selectExercise',
      params: {
        value: 1,
      },
    });
  };

  return (
    <ThemedView style={{flex: 1}}>
      <Stack.Screen options={{title: 'Add Exercise', headerShown: true}} />
      <ThemedView style={styles.titleContainer}>
        <Button onPress={copy} title="Copy From Existing" />
        <ThemedText>Name</ThemedText>
        <ThemedTextInput onChangeText={setName} value={name} style={styles.input}/>
        <ThemedText>Description</ThemedText>
        <ThemedTextInput onChangeText={setDescription} value={description} style={styles.textArea} multiline />
        <ThemedText>Image</ThemedText>
        <ThemedImage source={{uri: image ?? placeHolderImage}} />
        <Button onPress={addExercise} title="Add"/>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'column',
    padding: 20,
    gap: 8,
  },
  input: {
    marginBottom: 20,
  },
  textArea: {
    marginBottom: 20,
    height: 100,
  },
});
