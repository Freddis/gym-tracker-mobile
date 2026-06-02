import {Stack, useRouter} from 'expo-router';
import {BackHeaderButton} from '../../../../blocks/BackHeaderButton/BackHeaderButton';
import {MealUpdateForm} from '../MealUpdateForm/MealUpdateForm';
import {useState} from 'react';
import {MealAppEntry} from '../../../../../types/models/AppEntry';
import {EntryType, EntryVisibility, MealType} from '../../../../../openapi-client';
import uuid from 'react-native-uuid';
import {AppScreenContainer} from '../../../../blocks/AppScreenContainer/AppScreenContainer';
import {ThemedLink} from '../../../../blocks/ThemedLink/ThemedLink';
import {useServices} from '../../../../providers/ServiceProvider/ServiceProvider';
import {useAuth} from '../../../../providers/AuthProvider/useAuth';

export const MealCreateScreen = () => {
  const {entryAtomService, entryService} = useServices();
  const {user} = useAuth();
  if (!user) {
    throw new Error('No user');
  }
  const router = useRouter();
  const [entry, setEntry] = useState<MealAppEntry>({
    id: uuid.v4(),
    userId: user.id,
    externalId: null,
    visibility: EntryVisibility.PUBLIC,
    createdAt: new Date(),
    updatedAt: null,
    deletedAt: null,
    lastPulledAt: null,
    lastPushedAt: null,
    workoutId: null,
    weightId: null,
    imageId: null,
    image: null,
    title: '',
    note: '',
    healthkitId: null,
    healthkitAnchor: null,
    healthkitAnchors_3_0: null,
    healthkitSource: null,
    healthkitSourceName: null,
    healthkitDevice: null,
    healthkitDeviceName: null,
    externalSource: null,
    outdoorRunId: null,
    outdoorWalkId: null,
    type: EntryType.MEAL,
    time: new Date(),
    meal: {
      id: 0,
      type: MealType.BREAKFAST,
      food: [],
    },
    calorieGoalId: null,
    mealId: null,
  });
  const [image, setImage] = useState<string | null>(null);
  const onSavePress = async () => {
    await entryService.createMealEntry(user.id, entry.title, entry.note, image, entry.meal);
    entryAtomService.reset();
    router.back();
  };
  const headerRight = () => <ThemedLink onPress={onSavePress}>Save</ThemedLink>;
  const headerLeft = () => <BackHeaderButton />;
  const onChange = (entry: MealAppEntry, image?: string | null) => {
    setEntry(entry);
    setImage(image ?? null);
  };
  return (
    <AppScreenContainer>
      <Stack.Screen options={{title: 'Create Meal', headerShown: true, headerLeft, headerRight}} />
      <MealUpdateForm entry={entry} onChange={onChange} />
    </AppScreenContainer>
  );
};
