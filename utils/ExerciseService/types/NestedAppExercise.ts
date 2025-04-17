import {AppExercise} from '@/types/models/AppExercise';

export interface NestedAppExercise extends AppExercise {
  variations?: AppExercise[]
}
