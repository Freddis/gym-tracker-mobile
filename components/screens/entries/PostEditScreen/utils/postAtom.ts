import {atom, PrimitiveAtom} from 'jotai';
import {PostAppEntry} from '../../../../../types/models/AppEntry';
import {EntryType, EntryVisibility} from '../../../../../openapi-client';
import uuid from 'react-native-uuid';

const initialEntry: PostAppEntry = {
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
  type: EntryType.POST,
  time: new Date(),
  mealId: null,
  calorieGoalId: null,
};


export const postAtom = atom<PrimitiveAtom<PostAppEntry>>(atom(initialEntry));
