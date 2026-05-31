import {FC, useEffect, useState} from 'react';
import {KeyboardAvoidingView, Platform, View, Pressable, Alert} from 'react-native';
import {useAppTheme} from '../../../../hooks/useAppTheme';
import {AppFoodComponent} from '../../../../utils/FoodService/types/AppFoodComponent';
import {FoodUtility} from '../../../../utils/FoodUtility/FoodUtility';
import {useAppPartialTranslation} from '../../../../utils/i18n/useAppPartialTranslation';
import {AppSeparator} from '../../../blocks/AppSeparator/AppSeparator';
import {IconSymbol} from '../../../blocks/IconSymbol/IconSymbol';
import {ImageUploadButton} from '../../../blocks/ImageUploadButton/ImageUploadButton';
import {Separator} from '../../../blocks/Separator/Separator';
import {ThemedBlock} from '../../../blocks/ThemedBlock/ThemedBlock';
import {ThemedLink} from '../../../blocks/ThemedLink/ThemedLink';
import {ThemedScrollView} from '../../../blocks/ThemedScrollView/ThemedScrollView';
import {ThemedText} from '../../../blocks/ThemedText/ThemedText';
import {wrap, Wrapped} from '../../entries/meal/MealUpdateScreen/wrap';
import {FoodUpdateFormProps} from '../FoodUpdateForm/types/FoodUpdateFormProps';
import {useRouter} from 'expo-router';
import {selectedFoodAtom} from '../FoodSelectScreen/selectedFoodAtom';
import {useAtom} from 'jotai';
import {FoodAmountUnit} from '../../../../openapi-client';
import {AppFood} from '../../../../utils/FoodService/types/AppFood';
import {ThemedTextInput} from '../../../blocks/ThemedInput/ThemedInput';
import {FoodComponentBlock} from '../../entries/meal/MealUpdateForm/components/FoodComponentBlock';

export const DishUpdateForm: FC<FoodUpdateFormProps> = (props) => {
  const foodUtility = new FoodUtility();
  const t = useAppPartialTranslation((x) => x.pages.food);
  const [food, setFood] = useState(props.food);
  const [name, setName] = useState(props.food.name ?? '');
  const [selectedFood, setSelectedFood] = useAtom(selectedFoodAtom);
  const ingredients = food.components.map(wrap);
  const theme = useAppTheme();
  let imageSrc = food.image?.image ? `data:image/jpeg;base64,${food.image.image}` : null;
  const [image, setImage] = useState<string | null>(imageSrc ?? food.image?.url ?? null);
  const router = useRouter();
  useEffect(() => {
    if (selectedFood) {
      const component: AppFoodComponent = {
        food: selectedFood,
        amount: selectedFood.isMeal ? 1 : selectedFood.servingSize ?? 100,
        unit: selectedFood.isMeal ? FoodAmountUnit.SERVING : FoodAmountUnit.GRAM,
      };
      const updatedEntry: AppFood = {
        ...food,
        components: [
          ...food.components,
          component,
        ],
      };
      setSelectedFood(null);
      setFood(updatedEntry);
      props.onChange(updatedEntry);
      // entryService.saveEntry(updatedEntry).then((result) => setEntry(result));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFood]);
  const onNameChange = (name: string) => {
    setName(name);
    const updatedFood: AppFood = {
      ...food,
      name: name,
      updatedAt: new Date(),
    };
    setFood(updatedFood);
    props.onChange(updatedFood);
  };
  const updateImage = async (image: string | null) => {
    setImage(image);
    const updatedFood: AppFood = {
      ...food,
      updatedAt: new Date(),
    };
    setFood(updatedFood);
    props.onChange(updatedFood, image);
  };
  const onRemoveFoodComponent = (component: Wrapped<AppFoodComponent>) => {
    const updatedFood: AppFood = {
      ...food,
      components: food.components.filter((f) => f.food.id !== component.item.food.id),
      updatedAt: new Date(),
    };
    if (updatedFood.components.length === 0) {
      Alert.alert('Cannot delete last component of the dish');
      return;
    }
    setFood(updatedFood);
    props.onChange(updatedFood);
  };
  const onUpdateFoodComponent = (component: Wrapped<AppFoodComponent>) => {
    const updatedFood: AppFood = {
      ...food,
      components: food.components.map((f) => f.food.id === component.item.food.id ? component.item : f),
      updatedAt: new Date(),
    };
    setFood(updatedFood);
    props.onChange(updatedFood);
  };
  const onAddFoodPress = () => {
    router.navigate('/app/entries/food/foodSelect');
  };

  const nutritionFacts = foodUtility.getNutritionFacts(food);
  const totalCalories = nutritionFacts.calories;
  const totalProtein = nutritionFacts.protein;
  const totalCarbs = nutritionFacts.carbs;
  const totalFat = nutritionFacts.fat;
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ThemedScrollView className="h-full">
      <View className="gap-m p-m">
        <ThemedBlock>
          <View className="py-1">
          <View className="flex-row items-center justify-between gap-s">
              <ThemedText>Name</ThemedText>
              <ThemedTextInput value={name} onChangeText={onNameChange} className="grow" style={{textAlign: 'right'}}/>
            </View>
            <AppSeparator />
            <View className="flex-row items-center justify-between">
              <ThemedText>Image</ThemedText>
              <ImageUploadButton value={image} onChange={updateImage} className="w-20 h-20" />
            </View>
            {/* <AppSeparator /> */}
            {/* <View className="flex-row items-center justify-between">
              <ThemedText>Synced</ThemedText>
              <EntrySyncButton entry={entry} onUpdate={onSync} />
            </View> */}
            {props.onDelete && (
              <>
                <AppSeparator />
                <View className="flex-row justify-center">
                  <ThemedLink accented onPress={props.onDelete}>Delete</ThemedLink>
                </View>
              </>
            )}
          </View>
        </ThemedBlock>
        <ThemedBlock>
          <View className="gap-m">
            {ingredients.map((food) => (
              <FoodComponentBlock key={food.item.food.id} item={food} onRemove={onRemoveFoodComponent} onUpdate={onUpdateFoodComponent} />
            ))}
            <View className="flex-row justify-center">
              <Pressable className="flex-row items-center gap-s" onPress={onAddFoodPress}>
                <ThemedText className="text-accent">
                  Add
                </ThemedText>
                <IconSymbol name={'plus'} color={theme.accent} size={20}/>
              </Pressable>
            </View>
            <Separator />
            <View className="flex-row gap-s items-start">
              <ThemedText>{t.f((x) => x.pages.food.list.labels.protein)}: {totalProtein.toFixed(1)}</ThemedText>
              <ThemedText>{t.f((x) => x.pages.food.list.labels.carbs)}: {totalCarbs.toFixed(1)}</ThemedText>
              <ThemedText>{t.f((x) => x.pages.food.list.labels.fat)}: {totalFat.toFixed(1)}</ThemedText>
            </View>
            <View className="flex-row gap-s items-start">
              <ThemedText>{t.f((x) => x.pages.food.list.labels.calories)}: {totalCalories.toFixed(0)}</ThemedText>
            </View>
          </View>
        </ThemedBlock>
      </View>
    </ThemedScrollView>
  </KeyboardAvoidingView>
  );
};
