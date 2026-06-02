import {atom, PrimitiveAtom} from 'jotai';
import {ExerciseHistory} from '../../../../../../utils/WorkoutService/types/ExerciseHistory';

const initial: ExerciseHistory = {
  exercise: {
    id: '',
    name: '',
    description: '',
    muscles: {
      primary: [],
      secondary: [],
    },
    difficulty: null,
    equipment: null,
    images: [],
    params: [],
    userId: null,
    copiedFromId: null,
    parentExerciseId: null,
    isArchived: false,
    createdAt: new Date(),
    updatedAt: null,
    deletedAt: null,
    variations: [],
  },
  history: [],
};
export const exerciseHistoryAtom = atom<PrimitiveAtom<ExerciseHistory>>(atom(initial));
