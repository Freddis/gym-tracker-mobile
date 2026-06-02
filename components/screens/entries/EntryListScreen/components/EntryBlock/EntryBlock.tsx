import {atom, PrimitiveAtom, SetStateAction, useAtomValue, useSetAtom} from 'jotai';
import {FC} from 'react';
import {AppEntry, PostAppEntry, WeightAppEntry, WorkoutAppEntry} from '../../../../../../types/models/AppEntry';
import {EntryType} from '../../../../../../openapi-client';
import {OutdoorRunBlock} from '../OutdoorRunBlock/OutdoorRunBlock';
import {UknownEntryBlock} from '../UknownEntryBlock/UknownEntryBlock';
import {OutdoorWalkBlock} from '../OutdoorWalkBlock/OutdoorWalkBlock';
import {PostBlock} from '../PostBlock/PostBlock';
import {WeightBlock} from '../WeightBlock/WeightBlock';
import {WorkoutBlock} from '../WorkoutBlock/WorkoutBlock';
import {useRouter} from 'expo-router';
import {weightAtom} from '../../../weight/WeightUpdateScreen/utils/weightAtom';
import {workoutAtom} from '../../../workouts/WorkoutScreen/utils/workoutAtom';
import {MealBlock} from '../MealBlock/MealBlock';
import {defaultEntryAtom} from '../../../DefaultEntryUpdateScreen/utils/defaultEntryAtom';
import {postAtom} from '../../../post/PostUpdateScreen/utils/postAtom';

/**
 * Creates an specific entry atom that updates the original entry atom when mutated.
 * @param value Any specific type of entry
 * @param entryAtom Entry atom
 * @returns
 */
export const entryLens = <T extends AppEntry>(
  value: T,
  entryAtom: PrimitiveAtom<AppEntry>
): PrimitiveAtom<T> => {
  // console.log('render entry'); //debug
  const valueAtom = atom(value);
  const lens = atom<T, [SetStateAction<T>], void>(
    (get): T => {
      return get(valueAtom);
    },
    (_, set, update) => {
      set(valueAtom, update);
      set(entryAtom, (prev) => ({
        ...prev,
        ...update,
      }));
    }
  );
  return lens;
};

export const EntryBlock: FC<{entry: PrimitiveAtom<AppEntry>}> = (props) => {
  const entry = useAtomValue(props.entry);
  const router = useRouter();
  const setWeightEntry = useSetAtom(weightAtom);
  const setPostEntry = useSetAtom(postAtom);
  const setWorkoutEntry = useSetAtom(workoutAtom);
  const setDefaultEntry = useSetAtom(defaultEntryAtom);

  const openDefaultEntry = () => {
    setDefaultEntry(props.entry);
    router.navigate({
      pathname: '/app/entries/entryUpdate',
    });
  };
  const openWorkout = (workout: WorkoutAppEntry) => {
    const entryAtom = entryLens(workout, props.entry);
    setWorkoutEntry(entryAtom);
    router.navigate({
      pathname: '/app/entries/workout/workoutUpdate',
      params: {
        workoutId: workout.id,
      },
    });
  };
  const openWeight = (entry: WeightAppEntry) => {
    const entryAtom = entryLens(entry, props.entry);
    setWeightEntry(entryAtom);

    router.navigate({
      pathname: '/app/entries/weight/weightUpdate',
      params: {
        entryId: entry.id,
      },
    });
  };
  const openPost = (entry: PostAppEntry) => {
    const entryAtom = entryLens(entry, props.entry);
    setPostEntry(entryAtom);
    router.navigate({
      pathname: '/app/entries/post/postUpdate',
      params: {
        entryId: entry.id,
      },
    });
  };
  switch (entry.type) {
    case EntryType.WORKOUT:
      return <WorkoutBlock onPress={openWorkout} entryAtom={entryLens(entry, props.entry)} />;
    case EntryType.WEIGHT:
      return <WeightBlock onPress={openWeight} entryAtom={entryLens(entry, props.entry)} />;
    case EntryType.POST:
      return <PostBlock onPress={openPost} entryAtom={entryLens(entry, props.entry)} />;
    case EntryType.OUTDOOR_RUN:
      return <OutdoorRunBlock onPress={openDefaultEntry} entryAtom={entryLens(entry, props.entry)} />;
    case EntryType.OUTDOOR_WALK:
      return <OutdoorWalkBlock entryAtom={entryLens(entry, props.entry)} />;
    case EntryType.MEAL:
      return <MealBlock entryAtom={entryLens(entry, props.entry)} />;
    default:
      return <UknownEntryBlock entry={props.entry} />;
  }
};

