import {FC, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {EditableWorkoutExerciseBlockProps} from './types/EditableWorkoutExerciseBlockProps';
import {useDrizzle} from '@/utils/drizzle';
import {NewModel} from '@/types/NewModel';
import {AppWorkoutExerciseSet} from '@/types/models/AppWorkoutExerciseSet';
import {EditableWorkoutExerciseSetBlock} from './components/EditableWorkoutExerciseSetBlock';
import {eq} from 'drizzle-orm';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {useAuth} from '@/components/providers/AuthProvider/useAuth';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {ThemedImage} from '@/components/blocks/ThemedImage/ThemedImage';
import {Separator} from '@/components/blocks/Separator/Separator';
import {ThemedLink} from '@/components/blocks/ThemedLink/ThemedLink';
import {atom, useAtom, useAtomValue} from 'jotai';
import {splitAtom} from 'jotai/utils';

export const EditableWorkoutExerciseBlock: FC<EditableWorkoutExerciseBlockProps> = (props) => {
  const [workoutExercise, setExercise] = useAtom(props.exercise);
  // const workoutExercise = props.exercise;
  const exercise = workoutExercise.exercise;
  const auth = useAuth();
  const setsAtom = useMemo(() => {
    const setsAtom = atom(
        (get) => get(props.exercise).sets,
        (get, set, sets: AppWorkoutExerciseSet[]) => set(
          props.exercise,
          {
            ...get(props.exercise),
            sets,
          }
        )
      );
    const setSplit = splitAtom(setsAtom, (x) => x.id);
    return setSplit;

  }, [props.exercise]);

  const sets = workoutExercise.sets;
  const setsAtoms = useAtomValue(setsAtom);

  // const [sets, setSets] = useState(workoutExercise.sets);
  const [db, schema] = useDrizzle();
  const [prevSets, setPrevSets] = useState<AppWorkoutExerciseSet[]>([]);
  useEffect(() => {
    loadSets();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const loadSets = async () => {
    const prevSet = await db.query.workoutExerciseSets.findFirst({
      where: (t, op) => op.and(
        op.eq(t.exerciseId, exercise.id),
        op.eq(t.userId, auth.user?.id ?? 0),
        op.not(
          op.eq(t.workoutExerciseId, workoutExercise.id),
        ),
      ),
      orderBy: (t, op) => op.desc(t.createdAt),
    });
    if (!prevSet) {
      return;
    }
    const prevSets = await db.query.workoutExerciseSets.findMany({
      where: (t, op) => op.and(
        op.eq(t.exerciseId, exercise.id),
        op.eq(t.userId, auth.user?.id ?? 0),
        op.eq(t.workoutExerciseId, prevSet.workoutExerciseId)
      ),
      orderBy: (t, op) => op.asc(t.createdAt),
    });
    setPrevSets(prevSets);
  };
  const addSet = async () => {
    const reps = [prevSets[sets.length]?.reps, sets[sets.length - 1]?.reps].find((x) => !!x) ?? 0;
    const weight = [prevSets[sets.length]?.weight, sets[sets.length - 1]?.weight].find((x) => !!x) ?? 0;
    const newSet: NewModel<AppWorkoutExerciseSet> = {
      // externalId: null,
      workoutId: workoutExercise.workoutId,
      exerciseId: workoutExercise.exerciseId,
      userId: workoutExercise.userId,
      createdAt: new Date(),
      updatedAt: null,
      workoutExerciseId: workoutExercise.id,
      start: new Date(),
      end: new Date(),
      finished: false,
      weight: weight,
      reps: reps,
    };
    const result = await db.insert(schema.workoutExerciseSets).values(newSet);
    const set: AppWorkoutExerciseSet = {
      ...newSet,
      id: result.lastInsertRowId,
    };
    // setSets([...sets, set]);
    setExercise({
      ...workoutExercise,
      sets: [...sets, set],
    });
  };
  const deleteSet = async (set: AppWorkoutExerciseSet) => {
    await db.delete(schema.workoutExerciseSets).where(
      eq(schema.workoutExerciseSets.id, set.id)
    );
    const now = new Date();
    await db.update(schema.workouts).set({
      updatedAt: now,
    })
    .where(
      eq(schema.workouts.id, set.workoutId)
    );
    const newsets = sets.filter((x) => x.id !== set.id);
    // setSets(newsets);
    setExercise({
      ...workoutExercise,
      sets: newsets,
    });
  };
  return (
     <ThemedBlock>
      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
        <ThemedText>{exercise.name}</ThemedText>
        <ThemedLink iconName="xmark" iconSize={18} onPress={() => props.onDelete(workoutExercise)}/>
      </View>
      <Separator/>
      <View style={{flexDirection: 'row', alignItems: 'flex-start', marginTop: 10}}>
        <ThemedImage src={exercise.images[0]}/>
        <View style={{marginLeft: 10, flexGrow: 1}}>
          {setsAtoms.map((set, i) => (
            <EditableWorkoutExerciseSetBlock onDelete={deleteSet} key={set.toString()} set={set} index={i} />
          ))}
        </View>
      </View>
      <Separator/>
      <View style={{flexDirection: 'row', justifyContent: 'center'}}>
        <ThemedLink iconName="plus" onPress={addSet}>Add</ThemedLink>
      </View>
    </ThemedBlock>
  );
};
