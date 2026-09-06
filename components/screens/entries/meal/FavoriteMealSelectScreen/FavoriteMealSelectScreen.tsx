import {FC, useState} from 'react';
import {AppScreenContainer} from '../../../../blocks/AppScreenContainer/AppScreenContainer';
import {FlatList, Pressable, View} from 'react-native';
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
import {ThemedSearchInput} from '../../../../blocks/ThemedSearchInput/ThemedSearchInput';
import {IconSymbol} from '../../../../blocks/IconSymbol/IconSymbol';
import {useAppTheme} from '../../../../../hooks/useAppTheme';
import {MealType} from '../../../../../openapi-client';
import {FavoriteMealFilterModal} from './components/FavoriteMealFilterModal/FavoriteMealFilterModal';
import {FavoriteMealFilterModalProps} from './components/FavoriteMealFilterModal/types/FavoriteMealFilterModalProps';

export const FavoriteMealSelectScreen: FC = () => {
  const [searchName, setSearchName] = useState<string|null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [types, setTypes] = useState<MealType[] | null>(null);
  const setSelectedFavoriteMeal = useSetAtom(selectedFavoriteMealAtom);
  const {mealService} = useServices();
  const user = useUser();
  const router = useRouter();
  const theme = useAppTheme();
  const response = useQuery({
    queryFn: () => mealService.getFavoriteMeals(user.id, searchName ?? undefined, types ?? undefined),
    queryKey: ['favoriteMeals', user.id, searchName, types],
    throwOnError: true,
  });
  const items = response.data;

  const onPress = (item: MealAppEntry) => {
    setSelectedFavoriteMeal(item);
    router.back();
  };

  const onFilterChange: FavoriteMealFilterModalProps['onChange'] = (e) => {
    setTypes(e.types);
  };

  return (
    <AppScreenContainer>
      <Stack.Screen options={{title: 'Favorite Meals', headerShown: true, headerLeft: () => <BackHeaderButton />}} />
      <View className="h-full">
        <View className="p-m flex-row items-center gap-s">
          <View className="flex-1">
            <ThemedSearchInput
              autoFocus
              returnKeyType="done"
              onSearch={setSearchName}
              className="bg-surface"
              placeholder="Search by food"
              debounce={1000}
            />
          </View>
          <Pressable onPress={() => setShowFilterModal(true)}>
            <IconSymbol
              name={'line.3.horizontal.decrease'}
              color={theme.accent}
              size={20}
            />
          </Pressable>
        </View>
        <View className="flex-1">
          {response.isFetching && <LoadingBlock/>}
          {!response.isFetching && items && items.length === 0 && (
            <View className="p-m">
              <ThemedText>{searchName || types ? 'No meals with matching foods' : 'No favorite meals yet'}</ThemedText>
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
      <FavoriteMealFilterModal
        onChange={onFilterChange}
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
      />
    </AppScreenContainer>
  );
};
