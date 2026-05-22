import {useEffect, useState} from 'react';
import {ThemedScrollView} from '../../../blocks/ThemedScrollView/ThemedScrollView';
import {ThemedText} from '../../../blocks/ThemedText/ThemedText';
import {Stack} from 'expo-router';
import {ActivityIndicator, RefreshControl} from 'react-native';
import {Food} from '../../../../openapi-client';
import {useAuth} from '../../../providers/AuthProvider/useAuth';
import {FoodBlock} from './components/FoodBlock';
import {ThemedView} from '../../../blocks/ThemedView/ThemedView';
import {useAppTheme} from '../../../../hooks/useAppTheme';
import {useServices} from '../../../providers/ServiceProvider/ServiceProvider';

export const FoodListScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [food, setFood] = useState<Food[]>([]);
  const {foodService} = useServices();
  const {user} = useAuth();
  const theme = useAppTheme();
  const onRefresh = async () => {
    if (!user) {
      return;
    }
    setRefreshing(true);
    await foodService.pullFromServer(user.id);
    const food = await foodService.getFood();
    setFood(food);
    setRefreshing(false);
  };
  useEffect(() => {
    loadFood();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadFood = async () => {
    const food = await foodService.getFood();
    setFood(food);
    setLoading(false);
  };

  return (
      <ThemedScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <Stack.Screen options={{title: 'Food List', headerShown: true}} />
        <ThemedView style={{flexDirection: 'column', padding: theme.paddingM}}>
          {loading && <ActivityIndicator size="large" color={theme.accent} />}
          {!loading && (
            <ThemedView style={{flexDirection: 'column', gap: theme.paddingM}}>
              {food.map((x) => <FoodBlock key={x.id} food={x} />)}
            </ThemedView>
          )}
          {food.length === 0 && (
            <ThemedText>No food found</ThemedText>
          )}
        </ThemedView>
      </ThemedScrollView>
  );
};

