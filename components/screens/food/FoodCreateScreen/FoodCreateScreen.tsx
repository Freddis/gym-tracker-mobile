import {AppScreenContainer} from '../../../blocks/AppScreenContainer/AppScreenContainer';
import {BackHeaderButton} from '../../../blocks/BackHeaderButton/BackHeaderButton';
import {Stack, useRouter} from 'expo-router';
import {useEffect, useState} from 'react';
import {EntryVisibility, ServingSizeUnit} from '../../../../openapi-client';
import {ThemedLink} from '../../../blocks/ThemedLink/ThemedLink';
import {useAuth} from '../../../providers/AuthProvider/useAuth';
import {useServices} from '../../../providers/ServiceProvider/ServiceProvider';
import {FoodUpdateForm} from '../FoodUpdateForm/FoodUpdateForm';
import uuid from 'react-native-uuid';
import {AppFood} from '../../../../utils/FoodService/types/AppFood';
import {queryClient} from '../../../../routes/_layout';
import {useAtom} from 'jotai';
import {avoidLet} from '../../../../utils/avoidLet';
import {scannedFoodAtom} from '../FoodAddScreen/utils/scannedFoodAtom';

export const FoodCreateScreen = () => {
  const {foodService} = useServices();
  const [scannedFood, setScannedFood] = useAtom(scannedFoodAtom);
  const {user} = useAuth();
  if (!user) {
    throw new Error('No user');
  }
  const router = useRouter();
  const initialFood: AppFood = avoidLet(() => {
    if (scannedFood) {
      const food: AppFood = {
        ...scannedFood,
        id: uuid.v4(),
        copiedFromId: scannedFood.id,
        lastPushedAt: null,
        lastPulledAt: null,
        image: null,
        components: [],
      };
      return food;
    }
    const food: AppFood = {
      id: uuid.v4(),
      name: '',
      description: '',
      image: null,
      protein: 0,
      carbs: 0,
      fat: 0,
      calories: 0,
      servingSize: null,
      servingSizeUnit: ServingSizeUnit.GRAM,
      createdAt: new Date(),
      updatedAt: null,
      deletedAt: null,
      isMeal: false,
      components: [],
      lastPushedAt: null,
      lastPulledAt: null,
      copiedFromId: null,
      visibility: EntryVisibility.PUBLIC,
      barcode: null,
    };
    return food;
  });
  const [food, setFood] = useState<AppFood>(initialFood);
  useEffect(() => {
    if (!scannedFood) {
      return;
    }
    setScannedFood(null);
  }, [scannedFood, setScannedFood]);

  const [image, setImage] = useState<string | null>(null);
  const onSavePress = async () => {
    await foodService.createFood(user.id, food, image);
    await queryClient.invalidateQueries({queryKey: ['food']});
    router.back();
  };
  const headerRight = () => <ThemedLink onPress={onSavePress}>Save</ThemedLink>;
  const headerLeft = () => <BackHeaderButton />;
  const onChange = (food: AppFood, image?: string | null) => {
    setFood(food);
    if (image !== undefined) {
      setImage(image);
    }
  };
  return (
    <AppScreenContainer>
      <Stack.Screen options={{title: 'Food', headerShown: true, headerLeft, headerRight}} />
      <FoodUpdateForm food={food} onChange={onChange} />
    </AppScreenContainer>
  );
};
