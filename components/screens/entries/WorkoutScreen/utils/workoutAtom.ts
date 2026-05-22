import {atom, PrimitiveAtom} from 'jotai';
import {WorkoutAppEntry} from '../../../../../types/models/AppEntry';
import {EntryType, EntryVisibility} from '../../../../../openapi-client';
import uuid from 'react-native-uuid';

const initialEntry: WorkoutAppEntry = {
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
  type: EntryType.WORKOUT,
  time: new Date(),
  workout: {
    id: 0,
    updatedAt: null,
    userId: 0,
    externalId: null,
    createdAt: new Date(),
    deletedAt: null,
    lastPulledAt: null,
    lastPushedAt: null,
    typeId: null,
    calories: 0,
    start: new Date(),
    end: null,
    exercises: [],
  },
};


export const workoutAtom = atom<PrimitiveAtom<WorkoutAppEntry>>(atom(initialEntry));
