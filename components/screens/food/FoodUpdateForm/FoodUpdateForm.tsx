import {FC, useState} from 'react';
import {KeyboardAvoidingView, Platform, Switch, View} from 'react-native';
import {FoodUtility} from '../../../../utils/FoodUtility/FoodUtility';
import {useAppPartialTranslation} from '../../../../utils/i18n/useAppPartialTranslation';
import {AppSeparator} from '../../../blocks/AppSeparator/AppSeparator';
import {ImageUploadButton} from '../../../blocks/ImageUploadButton/ImageUploadButton';
import {ThemedBlock} from '../../../blocks/ThemedBlock/ThemedBlock';
import {ThemedTextInput} from '../../../blocks/ThemedInput/ThemedInput';
import {ThemedLink} from '../../../blocks/ThemedLink/ThemedLink';
import {ThemedScrollView} from '../../../blocks/ThemedScrollView/ThemedScrollView';
import {ThemedText} from '../../../blocks/ThemedText/ThemedText';
import {FoodUpdateFormProps} from './types/FoodUpdateFormProps';
import {AppFood} from '../../../../utils/FoodService/types/AppFood';
import {useAppTheme} from '../../../../hooks/useAppTheme';
import {useResponseErrors} from '../../../../hooks/useResponseErrors';
import {avoidLet} from '../../../../utils/avoidLet';


export const FoodUpdateForm: FC<FoodUpdateFormProps> = (props) => {
  const foodUtility = new FoodUtility();
  const t = useAppPartialTranslation((x) => x.pages.food);
  const [food, setFood] = useState(props.food);
  const [name, setName] = useState(props.food.name ?? '');
  const {setSmartError, clearSmartError, hasSmartError} = useResponseErrors<AppFood>();
  const [protein, setProtein] = useState(props.food.protein.toString() ?? '');
  const [carbs, setCarbs] = useState(props.food.carbs.toString() ?? '');
  const [fat, setFat] = useState(props.food.fat.toString() ?? '');
  const [servingSize, setServingSize] = useState(props.food.servingSize?.toString() ?? '100');
  const [hasServingSize, setHasServingSize] = useState(props.food.servingSize !== null);
  let imageSrc = food.image?.image ? `data:image/jpeg;base64,${food.image.image}` : null;
  const [image, setImage] = useState<string | null>(imageSrc ?? food.image?.url ?? null);
  const theme = useAppTheme();
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
  const onHasServingSizeChange = () => {
    setHasServingSize(!hasServingSize);
    const updatedFood: AppFood = {
      ...food,
      servingSize: hasServingSize ? null : 100,
      updatedAt: new Date(),
    };
    setFood(updatedFood);
    props.onChange(updatedFood);
  };
  const onServingSizeChange = (servingSize: string) => {
    setServingSize(servingSize);
    const value = parseFloat(servingSize);
    if (isNaN(value)) {
      setSmartError((x) => x.servingSize, 'Not a valid number');
      return;
    }
    clearSmartError((x) => x.servingSize);
    const updatedFood: AppFood = {
      ...food,
      servingSize: value,
      updatedAt: new Date(),
    };
    setFood(updatedFood);
    props.onChange(updatedFood);
  };
  const onProteinChange = (protein: string) => {
    setProtein(protein);
    const value = parseFloat(protein);
    if (isNaN(value)) {
      setSmartError((x) => x.protein, 'Not a valid number');
      return;
    }
    clearSmartError((x) => x.protein);
    const updatedFood: AppFood = {
      ...food,
      protein: value,
      updatedAt: new Date(),
    };
    setFood(updatedFood);
    props.onChange(updatedFood);
  };
  const onFatChange = (fat: string) => {
    setFat(fat);
    const value = parseFloat(fat);
    if (isNaN(value)) {
      setSmartError((x) => x.fat, 'Not a valid number');
      return;
    }
    const updatedFood: AppFood = {
      ...food,
      fat: value,
      updatedAt: new Date(),
    };
    setFood(updatedFood);
    props.onChange(updatedFood);
  };
  const onCarbsChange = (carbs: string) => {
    setCarbs(carbs);
    const value = parseFloat(carbs);
    if (isNaN(value)) {
      setSmartError((x) => x.carbs, 'Not a valid number');
      return;
    }
    clearSmartError((x) => x.carbs);
    const updatedFood: AppFood = {
      ...food,
      carbs: value,
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

  const nutritionFacts = foodUtility.getNutritionFacts(food);
  const totalCalories = nutritionFacts.calories;
  // const totalProtein = nutritionFacts.protein;
  // const totalCarbs = nutritionFacts.carbs;
  // const totalFat = nutritionFacts.fat;
  const calories = avoidLet(() => {
    if (food.servingSize === 0) {
      return 0;
    }
    return totalCalories / (food.servingSize ?? 100) * 100;
  });
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
            <AppSeparator />
            <View className="flex-row items-center justify-between">
              <ThemedText>Protein</ThemedText>
              <ThemedTextInput
                selectTextOnFocus
                keyboardType="decimal-pad"
                returnKeyType="done"
                hasError={hasSmartError((x) => x.protein)}
                value={protein} onChangeText={onProteinChange} className="w-20" variant="on-surface" />
            </View>
            <AppSeparator />
            <View className="flex-row items-center justify-between">
              <ThemedText>Fat</ThemedText>
              <ThemedTextInput
                selectTextOnFocus
                keyboardType="decimal-pad"
                returnKeyType="done"
                hasError={hasSmartError((x) => x.fat)}
              value={fat} onChangeText={onFatChange} className="w-20" variant="on-surface" />
            </View>
            <AppSeparator />
            <View className="flex-row items-center justify-between">
              <ThemedText>Carbs</ThemedText>
              <ThemedTextInput
              selectTextOnFocus
              keyboardType="decimal-pad"
              returnKeyType="done"
              hasError={hasSmartError((x) => x.carbs)}
              value={carbs} onChangeText={onCarbsChange} className="w-20" variant="on-surface" />
            </View>
            <AppSeparator />
            <View className="flex-row items-center justify-between">
              <ThemedText>Has Serving Size</ThemedText>
              <Switch trackColor={{true: theme.accent}} value={hasServingSize} onChange={onHasServingSizeChange} />
            </View>
            {hasServingSize && (
              <>
              <AppSeparator />
              <View className="flex-row items-center justify-between">
              <ThemedText>Serving Size</ThemedText>
              <ThemedTextInput
                 selectTextOnFocus
                 keyboardType="decimal-pad"
                 returnKeyType="done"
                 hasError={hasSmartError((x) => x.servingSize)}
              value={servingSize} onChangeText={onServingSizeChange} className="w-20" variant="on-surface" />
              </View>
              </>
            )}
            <AppSeparator />
            {/* <View className="flex-row gap-s items-start">
              <ThemedText>{t.f((x) => x.pages.food.list.labels.protein)}: {totalProtein.toFixed(1)}</ThemedText>
              <ThemedText>{t.f((x) => x.pages.food.list.labels.carbs)}: {totalCarbs.toFixed(1)}</ThemedText>
              <ThemedText>{t.f((x) => x.pages.food.list.labels.fat)}: {totalFat.toFixed(1)}</ThemedText>
            </View> */}
            <View className="flex-row gap-s items-start">
              <ThemedText>{t.f((x) => x.pages.food.list.labels.calories)}: {calories.toFixed(0)}</ThemedText>
            </View>
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
      </View>
    </ThemedScrollView>
  </KeyboardAvoidingView>
  );
};
