import {atom} from 'jotai';
import {Exercise} from '../../../openapi-client';

export const copiedExerciseAtom = atom<Exercise | null>(null);
