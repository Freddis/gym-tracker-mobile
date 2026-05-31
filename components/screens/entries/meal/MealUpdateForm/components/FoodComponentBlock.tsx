import {FC, useState} from 'react';
import {View} from 'react-native';
import {cn} from '../../../../../../cn';
import {useResponseErrors} from '../../../../../../hooks/useResponseErrors';
import {FoodAmountUnit} from '../../../../../../openapi-client';
import {avoidLet} from '../../../../../../utils/avoidLet';
import {floorToMax3Decimals} from '../../../../../../utils/floorToMax3Decimals';
import {AppFoodComponent} from '../../../../../../utils/FoodService/types/AppFoodComponent';
import {FoodUtility} from '../../../../../../utils/FoodUtility/FoodUtility';
import {FoodMacros} from '../../../../../../utils/FoodUtility/types/FoodMacros';
import {useAppPartialTranslation} from '../../../../../../utils/i18n/useAppPartialTranslation';
import {useImagePlaceHolder} from '../../../../../../utils/useImagePlaceHolder';
import {ThemedImage} from '../../../../../blocks/ThemedImage/ThemedImage';
import {ThemedTextInput} from '../../../../../blocks/ThemedInput/ThemedInput';
import {ThemedLink} from '../../../../../blocks/ThemedLink/ThemedLink';
import {ThemedText} from '../../../../../blocks/ThemedText/ThemedText';
import {useServices} from '../../../../../providers/ServiceProvider/ServiceProvider';
import {Wrapped} from '../../MealUpdateScreen/wrap';

interface FoodComponentBlockProps {
  item: Wrapped<AppFoodComponent>;
  onRemove: (ingredient: Wrapped<AppFoodComponent>) => void;
  onUpdate: (ingredient: Wrapped<AppFoodComponent>) => void;
}

export const FoodComponentBlock: FC<FoodComponentBlockProps> = (props) => {
  const foodUtility = new FoodUtility();
  const item = props.item;
  const food = props.item.item.food;
  const defaultAmount = props.item.item.food.servingSize ?? 100;
  const initialAmount = props.item.item.amount ?? defaultAmount;
  const servingSize = food.servingSize ?? 100;
  const initialServings = food.isMeal ? props.item.item.amount : (initialAmount / servingSize);
  const {imageService} = useServices();
  const placeholder = useImagePlaceHolder();
  const [amount, setAmount] = useState(initialAmount.toFixed(0));
  const [servings, setServings] = useState(floorToMax3Decimals(initialServings).toString());
  const {setSmartError, clearSmartError, hasSmartError} = useResponseErrors<{amount: string, servings: string}>();
  const servedInServings = item.item.food.isMeal || item.item.food.servingSize !== null;
  const multiplier = avoidLet(() => {
    if (servedInServings && !isNaN(parseFloat(servings))) {
      return parseFloat(servings);
    }
    if (props.item.item.food.servingSize === null) {
      if (!isNaN(parseFloat(amount))) {
        return parseFloat(amount) / 100;
      }
      return defaultAmount / 100;
    }
    return 1;
  });

  const protein = foodUtility.getFoodMacro(food, FoodMacros.Protein) * multiplier;
  const carbs = foodUtility.getFoodMacro(food, FoodMacros.Carbs) * multiplier;
  const fat = foodUtility.getFoodMacro(food, FoodMacros.Fat) * multiplier;
  const calories = foodUtility.getFoodCalories(food) * multiplier;
  const t = useAppPartialTranslation((x) => x.pages.food);
  const onAmountChange = (e: string) => {
    const value = parseFloat(e);
    setAmount(e);
    if (isNaN(value)) {
      setSmartError((x) => x.amount, 'Not a valid number');
      return;
    }
    clearSmartError((x) => x.amount);
    clearSmartError((x) => x.servings);
    let servings = null;
    if (props.item.item.food.servingSize !== null) {
      servings = value / props.item.item.food.servingSize;
      setServings(floorToMax3Decimals(servings).toString());
    }
    props.onUpdate({
      item: {
        ...props.item.item,
        amount: value,
      },
      key: props.item.key,
    });
  };

  const onServingsChange = (e: string) => {
    if (!servedInServings) {
      return;
    }
    setServings(e);
    const value = parseFloat(e);
    if (isNaN(value)) {
      setSmartError((x) => x.servings, 'Not a valid number');
      return;
    }
    clearSmartError((x) => x.amount);
    clearSmartError((x) => x.servings);

    const grams = value * (props.item.item.food.servingSize ?? 0);
    setAmount(grams.toFixed(0));
    props.onUpdate({
      item: {
        ...props.item.item,
        unit: food.isMeal ? FoodAmountUnit.SERVING : FoodAmountUnit.GRAM,
        amount: food.isMeal ? value : grams,
      },
      key: props.item.key,
    });
  };
  return (
    <View
    key={item.item.food.id}
    className="flex h-auto flex-row items-start p-2 rounded-md cursor-pointer gap-5 bg-cavity/50 overflow-hidden"
  >
    <View className="w-20 h-20 self-stretch">
      <ThemedImage source={{uri: imageService.getImageUrl(item.item.food.image) ?? placeholder}} className="w-full h-full  object-cover rounded-md" />
    </View>
    <View className="basis-0 grow gap-s overflow-hidde">
      <View className="flex flex-row gap-S items-center justify-between">
        <View className="grow">
          <ThemedLink
            accented={false}
            href={'/app/entries/food/foodList'}
            // params={{id: item.item.food.id}}
            >
            {item.item.food.name}
          </ThemedLink>
        </View>
        <ThemedLink iconName="xmark" iconSize={18} onPress={() => props.onRemove(item)}/>
      </View>
      <View className="flex-row gap-1 items-center flex-1 min-w-0 overflow-hidden justify-between">
        <View className="overflow-hidden">
          <ThemedText>{t.f((x) => x.utils.objects.food.fields.calories)}</ThemedText>
          <ThemedText>{calories.toFixed(0)}</ThemedText>
        </View>
        <View className="overflow-hidden">
          <ThemedText>{t.f((x) => x.utils.objects.food.fields.protein)}</ThemedText>
          <ThemedText>{protein.toFixed(1)}</ThemedText>
        </View>
        <View className="overflow-hidden">
          <ThemedText>{t.f((x) => x.utils.objects.food.fields.fat)}</ThemedText>
          <ThemedText>{fat.toFixed(1)}</ThemedText>
        </View>
        <View className="overflow-hidden">
          <ThemedText>{t.f((x) => x.utils.objects.food.fields.carbs)}</ThemedText>
          <ThemedText>{carbs.toFixed(1)}</ThemedText>
        </View>
      </View>
      <View className="flex-row gap-m items-center flex-1 min-w-0 overflow-hidden ">
        <View className={cn(food.isMeal ? 'hidden' : '', 'overflow-hidden')}>
          <ThemedText>{t.p((x) => x.create.labels.grams)}</ThemedText>
          <View>
            <ThemedTextInput
              selectTextOnFocus
              keyboardType="decimal-pad"
              returnKeyType="done"
              hasError={hasSmartError((x) => x.amount)}
              onChangeText={onAmountChange}
              value={amount}
            />
          </View>
        </View>
        <View className={cn(!servedInServings ? 'hidden' : '', 'overflow-hidden')}>
          <ThemedText>{t.p((x) => x.create.labels.servings)}</ThemedText>
          <View>
            <ThemedTextInput
              selectTextOnFocus
              keyboardType="decimal-pad"
              returnKeyType="done"
              hasError={hasSmartError((x) => x.servings)}
              onChangeText={onServingsChange}
              value={servings}
              />
          </View>
        </View>
      </View>
      <View className={cn(item.item.food.servingSize === null ? 'invisible' : '', 'flex flex-row gap-s items-center')}>
        <ThemedText>{t.f((x) => x.utils.objects.food.fields.servingSize)}</ThemedText>
        <ThemedText>{item.item.food.servingSize?.toFixed(0)} {t.f((x) => x.utils.objects.foodUnits[item.item.food.servingSizeUnit])}</ThemedText>
      </View>
    </View>
  </View>
  );
};
