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
import {ScreenContainer} from '@/components/blocks/ScrenContainer/ScreenContainer';
import {ThemedButtonList} from '@/components/blocks/ThemedButtonList/ThemedButtonList';
import {WeightBlock} from './components/WeightBlock/WeightBlock';
import {AppEntry, WeightAppEntry} from '../../../../types/models/AppEntry';
import {EntryType} from '../../../../openapi-client';

export const EntryListScreen: FC = () => {
  const navigation = useNavigation();
  const theme = useAppTheme();
  navigation.addListener('focus', () => {
    setfocusedCounter(focusedCounter + 1);
  });
  const router = useRouter();
  const [focusedCounter, setfocusedCounter] = useState(0);
  const [db] = useDrizzle();
  const sqlQuery = db.query.entries.findMany({
    with: {
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
    },
    where: (t, op) => op.and(
      op.isNull(t.deletedAt),
      // op.not(op.isNull(t.weightId))
    ),
    orderBy: (t, op) => op.desc(t.createdAt),
    limit: 50,
  });

  const query = useLiveQuery(sqlQuery, [focusedCounter]);

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
  return (
    <ScreenContainer style={{paddingHorizontal: 0}}>
      <Stack.Screen options={{title: '', headerShown: false}} />
      <ScrollView style={{paddingHorizontal: theme.paddingM}}>
        <ThemedButtonList items={[['Workout Types', '/app/entries/workoutTypeList']]} />
        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20}}>
          <ThemedText style={{flexGrow: 1}}>Entries:</ThemedText>
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
            </Fragment>
          ))}
        </View>
     </ScrollView>
    </ScreenContainer>
  );
};

