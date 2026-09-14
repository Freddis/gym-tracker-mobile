import {useState} from 'react';
import {Alert} from 'react-native';
import {Stack, useRouter} from 'expo-router';
import uuid from 'react-native-uuid';
import {Equipment, Exercise} from '../../../../openapi-client';
import {queryClient} from '../../../../routes/_layout';
import {AppScreenContainer} from '../../../blocks/AppScreenContainer/AppScreenContainer';
import {BackHeaderButton} from '../../../blocks/BackHeaderButton/BackHeaderButton';
import {ThemedLink} from '../../../blocks/ThemedLink/ThemedLink';
import {useAuth} from '../../../providers/AuthProvider/useAuth';
import {useServices} from '../../../providers/ServiceProvider/ServiceProvider';
import {ExerciseUpdateForm} from '../ExerciseUpdateForm/ExerciseUpdateForm';

const createEmptyExercise = (userId: number): Exercise => ({
  id: uuid.v4(),
  name: '',
  description: '',
  difficulty: 5,
  equipment: Equipment.BODYWEIGHT,
  images: [],
  params: [],
  userId,
  copiedFromId: null,
  parentExerciseId: null,
  createdAt: new Date(),
  updatedAt: null,
  deletedAt: null,
  isArchived: false,
  variations: [],
  muscles: {
    primary: [],
    secondary: [],
  },
});

export const CreateExerciseScreen = () => {
  const {exerciseService} = useServices();
  const {user} = useAuth();
  const router = useRouter();
  const [exercise, setExercise] = useState<Exercise>(() => createEmptyExercise(user?.id ?? 0));
  const [image, setImage] = useState<string | null | undefined>(undefined);

  if (!user) {
    throw new Error('No user');
  }

  const onSavePress = async () => {
    if (exercise.name.trim() === '') {
      Alert.alert('Invalid name');
      return;
    }
    await exerciseService.createExercise(exercise, image);
    await queryClient.invalidateQueries({queryKey: ['exercises']});
    router.back();
  };

  const onChange = (nextExercise: Exercise, nextImage?: string | null) => {
    setExercise(nextExercise);
    if (nextImage !== undefined) {
      setImage(nextImage);
    }
  };

  return (
    <AppScreenContainer>
      <Stack.Screen
        options={{
          title: 'Exercise',
          headerShown: true,
          headerLeft: () => <BackHeaderButton />,
          headerRight: () => <ThemedLink onPress={onSavePress}>Save</ThemedLink>,
        }}
      />
      <ExerciseUpdateForm key={exercise.id} exercise={exercise} onChange={onChange} />
    </AppScreenContainer>
  );
};
