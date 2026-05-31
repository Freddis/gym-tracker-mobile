import {atom, PrimitiveAtom} from 'jotai';
import {AppEntry} from '../../../../../types/models/AppEntry';
import {EntryType, EntryVisibility} from '../../../../../openapi-client';
import uuid from 'react-native-uuid';

const initialEntry: AppEntry = {
  id: uuid.v4(),
  userId: 0,
  type: EntryType.POST,
  time: new Date(),
  createdAt: new Date(),
  updatedAt: null,
  deletedAt: null,
  lastPulledAt: null,
  lastPushedAt: null,
  image: null,
  title: null,
  note: null,
  externalId: null,
  externalSource: null,
  visibility: EntryVisibility.PUBLIC,
  workoutId: null,
  weightId: null,
  imageId: null,
  mealId: null,
  calorieGoalId: null,
  healthkitId: null,
  healthkitAnchor: null,
  healthkitAnchors_3_0: null,
  healthkitSource: null,
  healthkitSourceName: null,
  healthkitDevice: null,
  healthkitDeviceName: null,
  outdoorRunId: null,
  outdoorWalkId: null,
};

export const defaultEntryAtom = atom<PrimitiveAtom<AppEntry>>(atom<AppEntry>(initialEntry));
