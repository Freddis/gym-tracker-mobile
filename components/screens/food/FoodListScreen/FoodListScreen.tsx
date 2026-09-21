import {useEffect, useState} from 'react';
import {ThemedScrollView} from '../../../blocks/ThemedScrollView/ThemedScrollView';
import {ThemedText} from '../../../blocks/ThemedText/ThemedText';
import {router, Stack} from 'expo-router';
import {ActivityIndicator, RefreshControl} from 'react-native';
import {useAuth} from '../../../providers/AuthProvider/useAuth';
import {FoodBlock} from './components/FoodBlock';
import {ThemedView} from '../../../blocks/ThemedView/ThemedView';
import {useAppTheme} from '../../../../hooks/useAppTheme';
import {useServices} from '../../../providers/ServiceProvider/ServiceProvider';
import {AppScreenContainer} from '../../../blocks/AppScreenContainer/AppScreenContainer';
import {BackHeaderButton} from '../../../blocks/BackHeaderButton/BackHeaderButton';
import {ThemedLink} from '../../../blocks/ThemedLink/ThemedLink';
import {ThemedSearchInput} from '../../../blocks/ThemedSearchInput/ThemedSearchInput';
import {atom, useAtomValue, useSetAtom} from 'jotai';
import {splitAtom} from 'jotai/utils';
import {AppFood} from '../../../../utils/FoodService/types/AppFood';
import {useQuery} from '@tanstack/react-query';
import {safeListRefresh} from '../../../../utils/safeListRefresh';

const foodListAtom = atom<AppFood[]>([]);
const foodSplitAtom = splitAtom(foodListAtom, (x) => x.id);

export const FoodListScreen = () => {
  const setFoodList = useSetAtom(foodListAtom);
  const foodAtoms = useAtomValue(foodSplitAtom);
  const [searchName, setSearchName] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const {foodService} = useServices();
  const {user} = useAuth();
  const theme = useAppTheme();
  const onRefresh = async () => {
    if (!user) {
      return;
    }
    await safeListRefresh(setRefreshing, 'Failed to refresh food', async () => {
      if (!await foodService.pullFromServer(user.id)) {
        throw new Error('Failed to pull food');
      }
      if (!await foodService.pushToServer(user.id)) {
        throw new Error('Failed to push food');
      }
      const food = await foodService.getFood({search: searchName ?? undefined});
      setFoodList(food);
    });
  };

  const query = useQuery({
    queryKey: ['food', searchName],
    retry: false,
    queryFn: () => {
      return foodService.getFood({search: searchName ?? undefined});
    },
  });

  useEffect(() => {
    setFoodList(query.data ?? []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data]);


  const headerLeft = () => <BackHeaderButton />;
  // the food screens are mounted in both the entries and the dashboard tab, navigate within the current one
  const headerRight = () => <ThemedLink onPress={() => router.navigate('./foodAdd')}>Add</ThemedLink>;
  return (
    <AppScreenContainer>
      <Stack.Screen options={{title: 'Food List', headerShown: true, headerLeft, headerRight}} />
      <ThemedView className="h-full">
        <ThemedScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          <ThemedView className="p-m h-full">
            <ThemedSearchInput
              returnKeyType="done"
              onSearch={setSearchName}
              className="bg-surface"
              placeholder="Search"
            />
            {query.isLoading && <ActivityIndicator size="large" color={theme.accent} className="mt-m" />}
            {!query.isLoading && (
              <ThemedView className="gap-m mt-m">
                {foodAtoms.map((x) => <FoodBlock key={x.toString()} foodAtom={x} />)}
              </ThemedView>
            )}
            {!query.isLoading && query.data?.length === 0 && (
              <ThemedText className="mt-m">No food found</ThemedText>
            )}
          </ThemedView>
        </ThemedScrollView>
      </ThemedView>
    </AppScreenContainer>
  );
};

