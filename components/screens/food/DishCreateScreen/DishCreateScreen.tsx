import {useState} from 'react';
import {EntryVisibility, ServingSizeUnit} from '../../../../openapi-client';
import {queryClient} from '../../../../routes/_layout';
import {AppFood} from '../../../../utils/FoodService/types/AppFood';
import {BackHeaderButton} from '../../../blocks/BackHeaderButton/BackHeaderButton';
import {ThemedLink} from '../../../blocks/ThemedLink/ThemedLink';
import {useAuth} from '../../../providers/AuthProvider/useAuth';
import {useServices} from '../../../providers/ServiceProvider/ServiceProvider';
import {DishUpdateForm} from '../DishUpdateForm/DishUpdateForm';
import uuid from 'react-native-uuid';
import {Stack, useRouter} from 'expo-router';
import {AppScreenContainer} from '../../../blocks/AppScreenContainer/AppScreenContainer';
import {Alert} from 'react-native';

export const DishCreateScreen = () => {
  const {foodService} = useServices();
  const {user} = useAuth();
  if (!user) {
    throw new Error('No user');
  }
  const router = useRouter();
  const [food, setFood] = useState<AppFood>({
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
    isMeal: true,
    components: [],
    lastPushedAt: null,
    lastPulledAt: null,
    visibility: EntryVisibility.PUBLIC,
    copiedFromId: null,
    barcode: null,
    brand: null,
  });
  const [image, setImage] = useState<string | null>(null);
  const onSavePress = async () => {
    if (food.components.length === 0) {
      Alert.alert('Please add at least one component');
      return;
    }
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
      <Stack.Screen options={{title: 'Dish', headerShown: true, headerLeft, headerRight}} />
      <DishUpdateForm food={food} onChange={onChange} />
    </AppScreenContainer>
  );
};
