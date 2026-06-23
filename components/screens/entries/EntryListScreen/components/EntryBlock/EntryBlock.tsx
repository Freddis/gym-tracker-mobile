import {PrimitiveAtom, useAtomValue, useSetAtom} from 'jotai';
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
import {postAtom} from '../../../post/PostUpdateScreen/utils/postAtom';
import {entryLens} from '../../../../../../utils/entryLens';


export const EntryBlock: FC<{entry: PrimitiveAtom<AppEntry>}> = (props) => {
  const entry = useAtomValue(props.entry);
  const router = useRouter();
  const setWeightEntry = useSetAtom(weightAtom);
  const setPostEntry = useSetAtom(postAtom);
  const setWorkoutEntry = useSetAtom(workoutAtom);

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
      return <OutdoorRunBlock entryAtom={entryLens(entry, props.entry)} />;
    case EntryType.OUTDOOR_WALK:
      return <OutdoorWalkBlock entryAtom={entryLens(entry, props.entry)} />;
    case EntryType.MEAL:
      return <MealBlock entryAtom={entryLens(entry, props.entry)} />;
    default:
      return <UknownEntryBlock entry={props.entry} />;
  }
};

