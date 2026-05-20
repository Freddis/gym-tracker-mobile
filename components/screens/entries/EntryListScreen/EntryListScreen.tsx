import {View, Pressable, RefreshControl, Alert} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {Link, Stack, useFocusEffect, useRouter} from 'expo-router';
import {LoadingBlock} from '@/components/blocks/LoadingBlock/LoadingBlock';
import {useDrizzle} from '@/utils/drizzle';
import {FC, Fragment, useCallback, useState} from 'react';
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
import {useQuery} from '@tanstack/react-query';
import {useEntryService} from '../../../../utils/EntryService/useEntryService';
import {ThemedScrollView} from '../../../blocks/ThemedScrollView/ThemedScrollView';
import {useSyncService} from '../../../../utils/SyncService/useSyncService';
import {useAuth} from '../../../providers/AuthProvider/useAuth';

export const EntryListScreen: FC = () => {
  const theme = useAppTheme();
  useFocusEffect(
    useCallback(() => {
      query.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );
  const {user} = useAuth();
  const [syncService] = useSyncService();
  const [refreshing, setRefreshing] = useState(false);
  const [entryService] = useEntryService();
  const [showFilterModal, setShowFilterModal] = useState(false);
  const router = useRouter();
  const [db] = useDrizzle();
  const [types, setTypes] = useState<EntryType[]| null>(null);
  const [date, setDate] = useState<Date | null>(null);

  const query = useQuery({
    queryKey: ['entries'],
    queryFn: () => {
      return entryService.getEntries(db, {
        types: types ?? undefined,
        date: date ?? undefined,
        includeDeleted: false,
        limit: 50,
      });
    },
  });

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
  const onRefresh = async () => {
    if (!user) {
      return;
    }
    try {
      setRefreshing(true);
      await syncService.syncWithServer(db, user.id);
      query.refetch();
      setRefreshing(false);
    } catch (e: unknown) {
      console.log(e);
      Alert.alert('Error', 'Failed to refresh entries');
    } finally {
      setRefreshing(false);
    }
  };
  return (
    <ScreenContainer style={{paddingHorizontal: 0}}>
      <Stack.Screen options={{title: '', headerShown: false}} />
      <ThemedScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>} style={{paddingHorizontal: theme.paddingM}}>
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
     </ThemedScrollView>
    </ScreenContainer>
  );
};

