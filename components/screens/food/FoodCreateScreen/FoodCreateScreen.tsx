import {ScreenContainer} from '../../../blocks/ScreenContainer/ScreenContainer';
import {BackHeaderButton} from '../../../blocks/BackHeaderButton/BackHeaderButton';
import {Stack, useRouter} from 'expo-router';
import {useState} from 'react';
import {ServingSizeUnit} from '../../../../openapi-client';
import {ThemedLink} from '../../../blocks/ThemedLink/ThemedLink';
import {useAuth} from '../../../providers/AuthProvider/useAuth';
import {useServices} from '../../../providers/ServiceProvider/ServiceProvider';
import {FoodUpdateForm} from '../FoodUpdateForm/FoodUpdateForm';
import uuid from 'react-native-uuid';
import {AppFood} from '../../../../utils/FoodService/types/AppFood';
import {queryClient} from '../../../../routes/_layout';

export const FoodCreateScreen = () => {
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
    isMeal: false,
    components: [],
    lastPushedAt: null,
    lastPulledAt: null,
  });
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
    <ScreenContainer>
      <Stack.Screen options={{title: 'Food', headerShown: true, headerLeft, headerRight}} />
      <FoodUpdateForm food={food} onChange={onChange} />
    </ScreenContainer>
  );
};
