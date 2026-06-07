import {AppExercise} from './AppExercise';

export interface NestedAppExercise extends AppExercise {
  variations: AppExercise[]
}
