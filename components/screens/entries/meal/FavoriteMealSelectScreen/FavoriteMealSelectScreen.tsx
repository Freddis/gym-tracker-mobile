import {FC} from 'react';
import {AppScreenContainer} from '../../../../blocks/AppScreenContainer/AppScreenContainer';
import {FlatList, View} from 'react-native';
import {Stack, useRouter} from 'expo-router';
import {BackHeaderButton} from '../../../../blocks/BackHeaderButton/BackHeaderButton';
import {useQuery} from '@tanstack/react-query';
import {useServices} from '../../../../providers/ServiceProvider/ServiceProvider';
import {LoadingBlock} from '../../../../blocks/LoadingBlock/LoadingBlock';
import {useSetAtom} from 'jotai';
import {selectedFavoriteMealAtom} from './selectedFavoriteMealAtom';
import {FavoriteMealListItem} from './components/FavoriteMealListItem';
import {useUser} from '../../../../providers/AuthProvider/useUser';
import {ThemedText} from '../../../../blocks/ThemedText/ThemedText';
import {MealAppEntry} from '../../../../../types/models/AppEntry';

export const FavoriteMealSelectScreen: FC = () => {
  const setSelectedFavoriteMeal = useSetAtom(selectedFavoriteMealAtom);
  const {mealService} = useServices();
  const user = useUser();
  const router = useRouter();
  const response = useQuery({
    queryFn: () => mealService.getFavoriteMeals(user.id),
    queryKey: ['favoriteMeals', user.id],
    throwOnError: true,
  });
  const items = response.data;

  const onPress = (item: MealAppEntry) => {
    setSelectedFavoriteMeal(item);
    router.back();
  };

  return (
    <AppScreenContainer>
      <Stack.Screen options={{title: 'Favorite Meals', headerShown: true, headerLeft: () => <BackHeaderButton />}} />
      <View className="h-full">
        <View className="flex-1">
          {response.isFetching && <LoadingBlock/>}
          {!response.isFetching && items && items.length === 0 && (
            <View className="p-m">
              <ThemedText>No favorite meals yet</ThemedText>
            </View>
          )}
          {!response.isFetching && items && items.length > 0 && (
            <FlatList
              removeClippedSubviews={true}
              keyExtractor={(x) => x.id}
              data={items}
              renderItem={(ctx) => <FavoriteMealListItem entry={ctx.item} onPress={onPress} />}
              contentContainerClassName="px-m pt-l gap-m"
            />
          )}
        </View>
      </View>
    </AppScreenContainer>
  );
};
