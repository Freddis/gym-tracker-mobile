import {atom, PrimitiveAtom} from 'jotai';
import uuid from 'react-native-uuid';
import {Equipment} from '../../../openapi-client';
import {NestedAppExercise} from '../../../utils/ExerciseService/types/NestedAppExercise';

const initialExercise: NestedAppExercise = {
  id: uuid.v4(),
  name: '',
  description: '',
  difficulty: 5,
  equipment: Equipment.BODYWEIGHT,
  images: [],
  params: [],
  userId: null,
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
  lastPulledAt: null,
  lastPushedAt: null,
};

export const exerciseAtom = atom<PrimitiveAtom<NestedAppExercise>>(atom(initialExercise));
