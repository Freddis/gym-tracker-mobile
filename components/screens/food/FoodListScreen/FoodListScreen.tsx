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
import {ScreenContainer} from '../../../blocks/ScreenContainer/ScreenContainer';
import {BackHeaderButton} from '../../../blocks/BackHeaderButton/BackHeaderButton';
import {ThemedLink} from '../../../blocks/ThemedLink/ThemedLink';
import {atom, useAtomValue, useSetAtom} from 'jotai';
import {splitAtom} from 'jotai/utils';
import {AppFood} from '../../../../utils/FoodService/types/AppFood';
import {useQuery} from '@tanstack/react-query';

const foodListAtom = atom<AppFood[]>([]);
const foodSplitAtom = splitAtom(foodListAtom, (x) => x.id);

export const FoodListScreen = () => {
  const setFoodList = useSetAtom(foodListAtom);
  const foodAtoms = useAtomValue(foodSplitAtom);
  const [refreshing, setRefreshing] = useState(false);
  const {foodService} = useServices();
  const {user} = useAuth();
  const theme = useAppTheme();
  const onRefresh = async () => {
    if (!user) {
      return;
    }
    setRefreshing(true);
    await foodService.pullFromServer(user.id);
    await foodService.pushToServer(user.id);
    const food = await foodService.getFood();
    setFoodList(food);
    setRefreshing(false);
  };

  const query = useQuery({
    queryKey: ['food'],
    retry: false,
    queryFn: () => {
      return foodService.getFood();
    },
  });

  useEffect(() => {
    setFoodList(query.data ?? []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data]);


  const headerLeft = () => <BackHeaderButton />;
  const headerRight = () => <ThemedLink onPress={() => router.navigate('/app/entries/food/foodAdd')}>Add</ThemedLink>;
  return (
    <ScreenContainer>
      <Stack.Screen options={{title: 'Food List', headerShown: true, headerLeft, headerRight}} />
      <ThemedView className="h-full">
        <ThemedScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
          <ThemedView className="p-m h-full">
            {query.isLoading && <ActivityIndicator size="large" color={theme.accent} />}
            {!query.isLoading && (
              <ThemedView className="gap-m">
                {foodAtoms.map((x) => <FoodBlock key={x.toString()} foodAtom={x} />)}
              </ThemedView>
            )}
            {!query.isLoading && query.data?.length === 0 && (
              <ThemedText>No food found</ThemedText>
            )}
          </ThemedView>
        </ThemedScrollView>
      </ThemedView>
    </ScreenContainer>
  );
};

