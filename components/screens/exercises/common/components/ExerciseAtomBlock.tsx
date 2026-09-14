import {FC, memo} from 'react';
import {atom, PrimitiveAtom, useAtomValue} from 'jotai';
import {ExerciseBlock} from '../../../../blocks/ExerciseBlock/ExerciseBlock';
import {NestedAppExercise} from '../../../../../utils/ExerciseService/types/NestedAppExercise';

interface ExerciseAtomBlockProps {
  exerciseAtom: PrimitiveAtom<NestedAppExercise>;
  onPress?: (item: NestedAppExercise, itemAtom: PrimitiveAtom<NestedAppExercise>) => void;
}

const Block: FC<ExerciseAtomBlockProps> = (props) => {
  const exercise = useAtomValue(props.exerciseAtom);
  const onPress = (item: NestedAppExercise) => {
    // variations are rendered nested, they have no atom of their own in the list
    props.onPress?.(item, item.id === exercise.id ? props.exerciseAtom : atom(item));
  };
  return <ExerciseBlock item={exercise} onPress={onPress} />;
};

export const ExerciseAtomBlock = memo(Block);
