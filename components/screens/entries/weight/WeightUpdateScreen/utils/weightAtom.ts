import {atom, PrimitiveAtom} from 'jotai';
import uuid from 'react-native-uuid';
import {EntryVisibility, EntryType} from '../../../../../../openapi-client';
import {WeightAppEntry} from '../../../../../../types/models/AppEntry';

export const createNewWeightEntryAtom = (): PrimitiveAtom<WeightAppEntry> => {
  const initialEntry: WeightAppEntry = {
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
    type: EntryType.WEIGHT,
    weight: {
      weight: 0,
      units: 'Kg',
      id: 0,
      userId: 0,
      externalId: null,
      updatedAt: null,
      createdAt: new Date(),
      deletedAt: null,
    },
    time: new Date(),
    mealId: null,
    calorieGoalId: null,
  };
  return atom(initialEntry);
};

export const weightAtom = atom<PrimitiveAtom<WeightAppEntry>>(createNewWeightEntryAtom());
