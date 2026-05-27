import {PrimitiveAtom, atom} from 'jotai';
import {MealAppEntry} from '../../../../../types/models/AppEntry';
import {EntryType, EntryVisibility, MealType} from '../../../../../openapi-client';
import uuid from 'react-native-uuid';

const initialEntry: MealAppEntry = {
  id: uuid.v4(),
  userId: 0,
  externalId: null,
  visibility: EntryVisibility.PUBLIC,
  createdAt: new Date(),
  updatedAt: null,
  deletedAt: null,
  lastPulledAt: null,
  lastPushedAt: null,
  workoutId: null,
  weightId: 0,
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
};

export const mealAtom = atom<PrimitiveAtom<MealAppEntry>>(atom(initialEntry));
