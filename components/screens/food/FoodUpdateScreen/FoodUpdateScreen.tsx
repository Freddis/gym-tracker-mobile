import {Stack, useRouter} from 'expo-router';
import {BackHeaderButton} from '../../../blocks/BackHeaderButton/BackHeaderButton';
import {AppScreenContainer} from '../../../blocks/AppScreenContainer/AppScreenContainer';
import {useAtom} from 'jotai';
import {foodAtom} from '../foodAtom';
import {useServices} from '../../../providers/ServiceProvider/ServiceProvider';
import {useAuth} from '../../../providers/AuthProvider/useAuth';
import {AppFood} from '../../../../utils/FoodService/types/AppFood';
import {FoodUpdateForm} from '../FoodUpdateForm/FoodUpdateForm';
import {DishUpdateForm} from '../DishUpdateForm/DishUpdateForm';
import {queryClient} from '../../../../routes/_layout';

export const FoodUpdateScreen = () => {
  const [atom] = useAtom(foodAtom);
  const [food, setFood] = useAtom(atom);
  const {foodService} = useServices();
  const {user} = useAuth();
  if (!user) {
    throw new Error('No user');
  }
  const router = useRouter();

  const onChange = async (food: AppFood, image?: string | null) => {
    const result = await foodService.updateFood(user.id, food, image);
    setFood(result);
  };

  const onDelete = async () => {
    await foodService.deleteFood(food.id);
    await queryClient.invalidateQueries({queryKey: ['food']});
    router.back();
  };

  return (
    <AppScreenContainer>
      <Stack.Screen options={{title: 'Food Update', headerShown: true, headerLeft: () => <BackHeaderButton />}} />
      {food.isMeal && <DishUpdateForm food={food} onChange={onChange} onDelete={onDelete} />}
      {!food.isMeal && <FoodUpdateForm food={food} onChange={onChange} onDelete={onDelete} />}
    </AppScreenContainer>
  );
};
