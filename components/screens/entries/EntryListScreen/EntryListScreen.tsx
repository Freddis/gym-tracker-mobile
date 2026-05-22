import {View, Pressable, RefreshControl, Alert, ActivityIndicator, FlatList} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {Link, Stack} from 'expo-router';
import {LoadingBlock} from '@/components/blocks/LoadingBlock/LoadingBlock';
import {useDrizzle} from '@/utils/drizzle';
import {FC, useEffect, useState} from 'react';
import {IconSymbol} from '@/components/blocks/IconSymbol/IconSymbol';
import {useAppTheme} from '@/hooks/useAppTheme';
import {ScreenContainer} from '@/components/blocks/ScreenContainer/ScreenContainer';
import {ThemedButtonList} from '@/components/blocks/ThemedButtonList/ThemedButtonList';
import {EntryType} from '../../../../openapi-client';
import {EntryFilterModal} from './components/EntryFilterModal/EntryFilterModal';
import {EntryFilterModalProps} from './components/EntryFilterModal/types/EntryFilterModalProps';
import {useInfiniteQuery} from '@tanstack/react-query';
import {useAuth} from '../../../providers/AuthProvider/useAuth';
import {useAtomValue} from 'jotai';
import {MemoEntryBlock} from './components/EntryBlock/MemoEntryBlock';
import {useServices} from '../../../providers/ServiceProvider/ServiceProvider';

export const EntryListScreen: FC = () => {
  // console.log('render list'); //debug
  const theme = useAppTheme();
  const {entryListService} = useServices();
  const entryAtoms = useAtomValue(entryListService.getEntryAtoms());
  const {user} = useAuth();
  const {syncService, entryService} = useServices();
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [db] = useDrizzle();
  const [types, setTypes] = useState<EntryType[]| null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const query = useInfiniteQuery({
    queryKey: ['entries', types, date],
    queryFn: ({pageParam}) => {
      return entryService.getEntries(db, {
        types: types ?? undefined,
        date: date ?? undefined,
        includeDeleted: false,
        limit: 30,
        page: pageParam,
      });
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length > 0 ? pages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  useEffect(() => {
    entryListService.setEntries(query.data?.pages.flat() ?? []);
  }, [entryListService, query.data, query.data?.pages]);

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
      await query.refetch();
      setRefreshing(false);
    } catch (e: unknown) {
      console.log(e);
      Alert.alert('Error', 'Failed to refresh entries');
    } finally {
      setRefreshing(false);
    }
  };
  const fetchNextPage = () => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  };
  return (
    <ScreenContainer style={{paddingHorizontal: 0}}>
      <Stack.Screen options={{title: '', headerShown: false}} />
      <FlatList
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
        contentContainerStyle={{
          paddingHorizontal: theme.paddingM,
          gap: theme.marginM,
          paddingBottom: 50,
        }}
        ListHeaderComponent={
          <>
            <ThemedButtonList
              items={[
                ['Workout Types', '/app/entries/workoutTypeList'],
                ['Food', '/app/entries/food/list'],
              ]}
            />

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 20,
              }}
            >
              <Pressable
                onPress={() => setShowFilterModal(true)}
                style={{
                  flexGrow: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.marginS,
                }}
              >
                <ThemedText style={{color: theme.accent}}>
                  Entries
                </ThemedText>

                <IconSymbol
                  name={'line.3.horizontal.decrease'}
                  color={theme.accent}
                  size={20}
                />
              </Pressable>

              <Link href={'./addEntry'} asChild>
                <Pressable
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.marginS,
                  }}
                >
                  <ThemedText style={{color: theme.accent}}>
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
        ListFooterComponent={
          query.isFetchingNextPage ? (
            <ActivityIndicator size="small" />
          ) : null
        }
      />

      <EntryFilterModal
        onChange={onFilterChange}
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
      />
    </ScreenContainer>
  );
};

