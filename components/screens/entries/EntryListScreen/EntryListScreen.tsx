import {View, Pressable, ScrollView} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {Link, Stack, useNavigation, useRouter} from 'expo-router';
import {LoadingBlock} from '@/components/blocks/LoadingBlock/LoadingBlock';
import {useLiveQuery} from 'drizzle-orm/expo-sqlite';
import {useDrizzle} from '@/utils/drizzle';
import {FC, Fragment, useState} from 'react';
import {AppWorkout} from '@/types/models/AppWorkout';
import {WorkoutBlock} from './components/WorkoutBlock/WorkoutBlock';
import {IconSymbol} from '@/components/blocks/IconSymbol/IconSymbol';
import {useAppTheme} from '@/hooks/useAppTheme';
import {ScreenContainer} from '@/components/blocks/ScreenContainer/ScreenContainer';
import {ThemedButtonList} from '@/components/blocks/ThemedButtonList/ThemedButtonList';
import {WeightBlock} from './components/WeightBlock/WeightBlock';
import {AppEntry, PostAppEntry, WeightAppEntry} from '../../../../types/models/AppEntry';
import {EntryType} from '../../../../openapi-client';
import {UknownEntryBlock} from './components/UknownEntryBlock/UknownEntryBlock';
import {PostBlock} from './components/PostBlock/PostBlock';
import {EntryFilterModal} from './components/EntryFilterModal/EntryFilterModal';
import {OutdoorRunBlock} from './components/OutdoorRunBlock/OutdoorRunBlock';
import {EntryFilterModalProps} from './components/EntryFilterModal/types/EntryFilterModalProps';
import {OutdoorWalkBlock} from './components/OutdoorWalkBlock/OutdoorWalkBlock';

export const EntryListScreen: FC = () => {
  const navigation = useNavigation();
  const theme = useAppTheme();
  navigation.addListener('focus', () => {
    setfocusedCounter(focusedCounter + 1);
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const router = useRouter();
  const [focusedCounter, setfocusedCounter] = useState(0);
  const [db] = useDrizzle();
  const [types, setTypes] = useState<EntryType[]| null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const sqlQuery = db.query.entries.findMany({
    with: {
      image: true,
      workout: {
        with: {
          exercises: {
            with: {
              exercise: true,
              sets: {
                orderBy: (t, op) => [
                  op.asc(t.createdAt),
                ],
              },
            },
            orderBy: (t, op) => [
              op.asc(t.createdAt),
            ],
          },
        },
      },
      weight: true,
      outdoorRun: {
        with: {
          geoData: true,
        },
      },
      outdoorWalk: {
        with: {
          geoData: true,
          heartRateData: true,
        },
      },
    },
    where: (t, op) => op.and(
      op.isNull(t.deletedAt),
      types ? op.inArray(t.type, types) : undefined,
      date ? op.gte(t.time, date) : undefined,
      // op.not(op.isNull(t.weightId))
    ),
    orderBy: (t, op) => date ? op.asc(t.time) : op.desc(t.time),
    limit: 50,
  });

  const query = useLiveQuery(sqlQuery, [focusedCounter, types, date]);

  if (!query.data) {
    return <LoadingBlock />;
  }
  const entries: AppEntry[] = query.data as any;
  const openWorkout = (workout: AppWorkout) => {
    router.navigate({
      pathname: './editWorkout',
      params: {
        workoutId: workout.id,
      },
    });
  };
  const openWeight = (entry: WeightAppEntry) => {
    router.navigate({
      pathname: './editWeight',
      params: {
        entryId: entry.id,
      },
    });
  };
  const openPost = (entry: PostAppEntry) => {
    router.navigate({
      pathname: './editPost',
      params: {
        entryId: entry.id,
      },
    });
  };
  const onFilterChange: EntryFilterModalProps['onChange'] = (e) => {
    setTypes(e.types);
    setDate(e.date);
  };
  return (
    <ScreenContainer style={{paddingHorizontal: 0}}>
      <Stack.Screen options={{title: '', headerShown: false}} />
      <ScrollView style={{paddingHorizontal: theme.paddingM}}>
        <ThemedButtonList items={[['Workout Types', '/app/entries/workoutTypeList'], ['Food', '/app/entries/food/list']]} />
        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20}}>
          <Pressable onPress={() => setShowFilterModal(true)} style={{flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: theme.marginS}}>
            <ThemedText style={{color: theme.accent}}>Entries</ThemedText>
            <IconSymbol name={'line.3.horizontal.decrease'} color={theme.accent} size={20}/>
          </Pressable>
          <Link href={'./addEntry'} asChild>
            <Pressable style={{flexDirection: 'row', alignItems: 'center', gap: theme.marginS}}>
              <ThemedText style={{color: theme.accent}}>Add</ThemedText>
              <IconSymbol name={'plus'} color={theme.accent} size={20}/>
            </Pressable>
          </Link>
        </View>
        <View style={{flexDirection: 'column', gap: theme.marginM, marginTop: theme.marginS, marginBottom: 50}}>
          {entries.map((entry) => (
            <Fragment key={entry.id}>
            {entry.type === EntryType.WORKOUT && <WorkoutBlock key={entry.id} onPress={openWorkout} entry={entry}/>}
            {entry.type === EntryType.WEIGHT && <WeightBlock key={entry.id} onPress={openWeight} entry={entry}/>}
            {entry.type === EntryType.POST && <PostBlock key={entry.id} onPress={openPost} entry={entry}/>}
            {entry.type === EntryType.OUTDOOR_RUN && <OutdoorRunBlock key={entry.id} onPress={() => {}} entry={entry}/>}
            {entry.type === EntryType.OUTDOOR_WALK && <OutdoorWalkBlock key={entry.id} onPress={() => {}} entry={entry}/>}
            {!Object.values(EntryType).includes(entry.type) && <UknownEntryBlock key={entry.id} entry={entry}/>}
            </Fragment>
          ))}
        </View>
        <EntryFilterModal onChange={onFilterChange} visible={showFilterModal} onClose={() => setShowFilterModal(false)}/>
     </ScrollView>
    </ScreenContainer>
  );
};

