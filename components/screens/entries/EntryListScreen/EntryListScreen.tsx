import {View, Pressable, RefreshControl, FlatList} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {Link, Stack} from 'expo-router';
import {LoadingBlock} from '@/components/blocks/LoadingBlock/LoadingBlock';
import {useDrizzle} from '@/utils/drizzle';
import {FC, useEffect, useRef, useState} from 'react';
import {IconSymbol} from '@/components/blocks/IconSymbol/IconSymbol';
import {useAppTheme} from '@/hooks/useAppTheme';
import {AppScreenContainer} from '@/components/blocks/AppScreenContainer/AppScreenContainer';
import {ThemedButtonList} from '@/components/blocks/ThemedButtonList/ThemedButtonList';
import {EntryType} from '../../../../openapi-client';
import {EntryFilterModal} from './components/EntryFilterModal/EntryFilterModal';
import {EntryFilterModalProps} from './components/EntryFilterModal/types/EntryFilterModalProps';
import {useInfiniteQuery} from '@tanstack/react-query';
import {useAtomValue} from 'jotai';
import {MemoEntryBlock} from './components/EntryBlock/MemoEntryBlock';
import {useServices} from '../../../providers/ServiceProvider/ServiceProvider';
import {safeListRefresh} from '../../../../utils/safeListRefresh';
import {useUser} from '../../../providers/AuthProvider/useUser';

export const EntryListScreen: FC = () => {
  const theme = useAppTheme();
  const {entryListService, healthKitService} = useServices();
  const lastAddedEntryAtom = useAtomValue(entryListService.getLastAddedEntryAtom());
  const entryAtoms = useAtomValue(entryListService.getEntryAtoms());
  const listRef = useRef<FlatList>(null);
  const user = useUser();
  const {syncService, entryService} = useServices();
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [db] = useDrizzle();
  const [types, setTypes] = useState<EntryType[]| null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const query = useInfiniteQuery({
    queryKey: ['entries', types, date],
    retry: false,
    queryFn: ({pageParam}) => {
      return entryService.getEntries(db, user.id, {
        types: types ?? undefined,
        date: date ?? undefined,
        includeDeleted: false,
        limit: 30,
        page: pageParam,
      });
    },
    throwOnError: true,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length > 0 ? pages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
  useEffect(() => {
    entryListService.setEntries(query.data?.pages.flat() ?? []);
  }, [entryListService, query.data, query.data?.pages]);
  useEffect(() => {
    if (lastAddedEntryAtom) {
      listRef.current?.scrollToOffset({
        offset: 0,
        animated: false,
      });
    }
  }, [lastAddedEntryAtom]);

  const onFilterChange: EntryFilterModalProps['onChange'] = (e) => {
    setTypes(e.types);
    setDate(e.date);
  };
  const onRefresh = async () => {
    if (!user) {
      return;
    }
    await safeListRefresh(setRefreshing, 'Failed to refresh entries', async () => {
      await healthKitService.importFromHealhkitIfPossible(user);
      await query.refetch(); //todo: remove this when in prod
      await syncService.syncWithServerOrThrow(db, user.id);
      await query.refetch();
    });
  };

  const fetchNextPage = () => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  };
  return (
    <AppScreenContainer safeTop={true}>
      <Stack.Screen options={{headerShown: false}} />
      <FlatList
        ref={listRef}
        removeClippedSubviews
        // maxToRenderPerBatch={3}
        // windowSize={5}
        // initialNumToRender={3}
        // updateCellsBatchingPeriod={50}
        data={entryAtoms}
        keyExtractor={(item) => item.toString()}
        renderItem={({item}) => <MemoEntryBlock entry={item} />}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        contentContainerClassName="px-m pt-l gap-m min-h-full"
        ListHeaderComponent={
          <>
            <ThemedButtonList
              items={[
                ['Workout Types', '/app/entries/workoutTypeList'],
                ['Food', '/app/entries/food/foodList'],
              ]}
            />

            <View
             className="flex-row items-center mt-5"
            >
              <Pressable
                onPress={() => setShowFilterModal(true)}
                className="grow flex-row items-center gap-s"
              >
                <ThemedText className="text-accent">
                  Entries
                </ThemedText>

                <IconSymbol
                  name={'line.3.horizontal.decrease'}
                  color={theme.accent}
                  size={20}
                />
              </Pressable>

              <Link href={'/app/entries/entryAdd'} asChild>
                <Pressable className="flex-row items-center gap-s">
                  <ThemedText className="text-accent">
                    Add
                  </ThemedText>
                  <IconSymbol
                    name={'plus'}
                    color={theme.accent}
                    size={20}
                  />
                </Pressable>
              </Link>
            </View>
            {query.isFetching && !query.data && <LoadingBlock />}
          </>
        }
      />
      <EntryFilterModal
        onChange={onFilterChange}
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
      />
    </AppScreenContainer>
  );
};

