import {View, RefreshControl, FlatList} from 'react-native';
import {Stack} from 'expo-router';
import {LoadingBlock} from '@/components/blocks/LoadingBlock/LoadingBlock';
import {useDrizzle} from '@/utils/drizzle';
import {FC, useEffect, useRef, useState} from 'react';
import {AppScreenContainer} from '@/components/blocks/AppScreenContainer/AppScreenContainer';
import {ThemedSearchInput, ThemedSearchInputHandle} from '@/components/blocks/ThemedSearchInput/ThemedSearchInput';
import {ThemedLink} from '@/components/blocks/ThemedLink/ThemedLink';
import {EntryFilterModal} from './components/EntryFilterModal/EntryFilterModal';
import {useInfiniteQuery} from '@tanstack/react-query';
import {useAtom, useAtomValue} from 'jotai';
import {MemoEntryBlock} from './components/EntryBlock/MemoEntryBlock';
import {useServices} from '../../../providers/ServiceProvider/ServiceProvider';
import {safeListRefresh} from '../../../../utils/safeListRefresh';
import {useUser} from '../../../providers/AuthProvider/useUser';

export const EntryListScreen: FC = () => {
  const {entryListService, healthKitService} = useServices();
  const lastAddedEntryAtom = useAtomValue(entryListService.getLastAddedEntryAtom());
  const entryAtoms = useAtomValue(entryListService.getEntryAtoms());
  const listRef = useRef<FlatList>(null);
  const user = useUser();
  const {syncService, entryService} = useServices();
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [db] = useDrizzle();
  const [filter, setFilter] = useAtom(entryListService.getFilterAtom());
  const searchRef = useRef<ThemedSearchInputHandle>(null);
  const query = useInfiniteQuery({
    queryKey: ['entries', filter.types, filter.date, filter.search],
    retry: false,
    queryFn: ({pageParam}) => {
      return entryService.getEntries(db, user.id, {
        types: filter.types,
        date: filter.date,
        search: filter.search,
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
    if (!query.data) {
      return;
    }
    entryListService.setEntries(query.data.pages.flat());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data?.pages]);
  useEffect(() => {
    return entryListService.onFilterReset(() => searchRef.current?.clear());
  }, [entryListService]);
  useEffect(() => {
    if (lastAddedEntryAtom) {
      listRef.current?.scrollToOffset({
        offset: 0,
        animated: false,
      });
    }
  }, [lastAddedEntryAtom]);

  const onSearch = (search: string | null) => {
    setFilter((prev) => ({...prev, search: search ?? undefined}));
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
  const headerRight = () => <ThemedLink href="/app/entries/entryAdd">Add</ThemedLink>;
  return (
    <AppScreenContainer>
      <Stack.Screen options={{title: 'Entries', headerShown: true, headerRight}} />
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
        contentContainerClassName="px-m pt-m gap-m min-h-full"
        ListHeaderComponent={
          <>
            <View className="flex-row items-center gap-xs">
              <ThemedSearchInput
              ref={searchRef}
              returnKeyType="done"
              onSearch={onSearch}
              className="bg-surface grow"
              placeholder="Search"
            />
              <ThemedLink
                iconName="line.3.horizontal.decrease"
                onPress={() => setShowFilterModal(true)}
              >
              </ThemedLink>
            </View>
            {query.isFetching && !query.data && <LoadingBlock />}
          </>
        }
      />
      <EntryFilterModal
        filter={filter}
        onChange={setFilter}
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
      />
    </AppScreenContainer>
  );
};

