import {useRouter} from 'expo-router';
import {useAtom} from 'jotai';
import {FC, useState, useEffect} from 'react';
import {KeyboardAvoidingView, Platform, View, Pressable} from 'react-native';
import {useAppTheme} from '../../../../../hooks/useAppTheme';
import {FoodAmountUnit, MealType} from '../../../../../openapi-client';
import {MealAppEntry, AppEntry} from '../../../../../types/models/AppEntry';
import {dateToString} from '../../../../../utils/dateToString';
import {FoodUtility} from '../../../../../utils/FoodUtility/FoodUtility';
import {useAppPartialTranslation} from '../../../../../utils/i18n/useAppPartialTranslation';
import {AppSeparator} from '../../../../blocks/AppSeparator/AppSeparator';
import {DateTimeUpdateModal} from '../../../../blocks/DateTimeUpdateModal/DateTimeUpdateModal';
import {IconSymbol} from '../../../../blocks/IconSymbol/IconSymbol';
import {Separator} from '../../../../blocks/Separator/Separator';
import {ThemedBlock} from '../../../../blocks/ThemedBlock/ThemedBlock';
import {ThemedLink} from '../../../../blocks/ThemedLink/ThemedLink';
import {ThemedScrollView} from '../../../../blocks/ThemedScrollView/ThemedScrollView';
import {ThemedText} from '../../../../blocks/ThemedText/ThemedText';
import {selectedFoodAtom} from '../../../food/FoodSelectScreen/selectedFoodAtom';
import {EntrySyncButton} from '../../EntryListScreen/components/EntrySyncButton/EntrySyncButton';
import {FoodComponentBlock} from './components/FoodComponentBlock';
import {wrap, Wrapped} from '../MealUpdateScreen/wrap';
import {WheelPickerItemProps} from 'react-native-ui-lib';
import {ImageUploadButton} from '../../../../blocks/ImageUploadButton/ImageUploadButton';
import {AppFoodComponent} from '../../../../../utils/FoodService/types/AppFoodComponent';
import {AppWheelPicker} from '../../../../blocks/AppWheelPicker/AppWheelPicker';
import {AppModal} from '../../../../blocks/AppModal/AppModal';

interface MealUpdateFormProps {
  entry: MealAppEntry;
  onChange: (entry: MealAppEntry, image?: string | null) => void;
  onDelete?: () => void;
  onCopy?: () => void;
}
const mealTypes: WheelPickerItemProps<MealType>[] = Object.values(MealType).map((type) => ({label: type, value: type}));
export const MealUpdateForm: FC<MealUpdateFormProps> = (props) => {
  const t = useAppPartialTranslation((x) => x.pages.meals);
  const theme = useAppTheme();
  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [mealType, setMealType] = useState(props.entry.meal.type);
  let imageSrc = props.entry.image?.image ? `data:image/jpeg;base64,${props.entry.image.image}` : null;
  const [image, setImage] = useState<string | null>(imageSrc ?? props.entry.image?.url ?? null);
  const [selectedFood, setSelectedFood] = useAtom(selectedFoodAtom);
  const [entry, setEntry] = useState(props.entry);
  const ingredients = entry.meal.food.map(wrap);
  const router = useRouter();
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [dateValue, setDate] = useState(entry.time);
  const foodUtility = new FoodUtility();
  const nutritionFacts = foodUtility.getNutritionFacts(entry.meal.food);
  const totalCalories = nutritionFacts.calories;
  const totalProtein = nutritionFacts.protein;
  const totalCarbs = nutritionFacts.carbs;
  const totalFat = nutritionFacts.fat;
  useEffect(() => {
    if (selectedFood) {
      const component: AppFoodComponent = {
        food: selectedFood,
        amount: selectedFood.isMeal ? 1 : selectedFood.servingSize ?? 100,
        unit: selectedFood.isMeal ? FoodAmountUnit.SERVING : FoodAmountUnit.GRAM,
      };
      const updatedEntry: MealAppEntry = {
        ...entry,
        meal: {
          ...entry.meal,
          food: [...entry.meal.food, component],
        },
      };
      setSelectedFood(null);
      setEntry(updatedEntry);
      props.onChange(updatedEntry);
      // entryService.saveEntry(updatedEntry).then((result) => setEntry(result));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFood]);

  const updateMealType = (type: MealType) => {
    setMealType(type);
    const updatedEntry: MealAppEntry = {
      ...entry,
      updatedAt: new Date(),
      meal: {...entry.meal, type: type},
    };
    setEntry(updatedEntry);
    props.onChange(updatedEntry);
  };
  const updateDate = async (date: Date) => {
    setDate(date);
    // await entryAtomService.updateTime(entry, date);
    setEntry({...entry, time: date});
    props.onChange({...entry, time: date});
  };
  const updateImage = async (image: string | null) => {
    setImage(image);
    const updatedEntry: MealAppEntry = {
      ...entry,
      updatedAt: new Date(),
    };
    setEntry(updatedEntry);
    props.onChange(updatedEntry, image);
  };
  const onRemoveFoodComponent = async (food: Wrapped<AppFoodComponent>) => {
    const updatedEntry: MealAppEntry = {
      ...entry,
      updatedAt: new Date(),
      meal: {
        ...entry.meal,
        food: entry.meal.food.filter((f) => f.food.id !== food.item.food.id),
      },
    };
    setEntry(updatedEntry);
    props.onChange(updatedEntry);
    // const result = await entryService.saveEntry(updatedEntry);
    // setEntry(result);
  };
  const onUpdateFoodComponent = async (food: Wrapped<AppFoodComponent>) => {
    const updatedEntry: MealAppEntry = {
      ...entry,
      updatedAt: new Date(),
      meal: {
        ...entry.meal,
        food: entry.meal.food.map((f) => f.food.id === food.item.food.id ? food.item : f),
      },
    };
    setEntry(updatedEntry);
    props.onChange(updatedEntry);
    // const result = await entryService.saveEntry(updatedEntry);
    // setEntry(result);
  };
  const onSync = (e: AppEntry) => {
    const updatedEntry: MealAppEntry = {
      ...entry,
      updatedAt: e.updatedAt,
    };
    setEntry(updatedEntry);
    props.onChange(updatedEntry);
  };
  const onAddFoodPress = () => {
    router.navigate('/app/entries/food/foodSelect');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ThemedScrollView className="h-full">
      <View className="gap-m p-m">
        <ThemedBlock>
          <View className="py-1">
            <View className="flex-row items-center justify-between">
              <ThemedText>Date</ThemedText>
              <ThemedText onPress={() => setDateModalVisible(true)}>{dateToString(dateValue)}</ThemedText>
            </View>
            <AppSeparator/>
            <View className="flex-row items-center justify-between">
              <ThemedText>Type</ThemedText>
              <ThemedText onPress={() => setTypeModalVisible(true)}>{mealType}</ThemedText>
            </View>
            <AppSeparator />
            <View className="flex-row items-center justify-between">
              <ThemedText>Image</ThemedText>
              <ImageUploadButton value={image} onChange={updateImage} className="w-20 h-20" />
            </View>
            <AppSeparator />
            <View className="flex-row items-center justify-between">
              <ThemedText>Synced</ThemedText>
              <EntrySyncButton entry={entry} onUpdate={onSync} />
            </View>
            {(props.onDelete || props.onCopy) && (
              <>
                <AppSeparator />
                <View className="flex-row justify-center gap-30">
                    {props.onDelete && <ThemedLink accented onPress={props.onDelete}>Delete</ThemedLink>}
                    {props.onCopy && <ThemedLink onPress={props.onCopy}>Copy</ThemedLink>}
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
      <DateTimeUpdateModal onClose={() => setDateModalVisible(false)} date={dateValue} visible={dateModalVisible} onUpdate={updateDate} />
    </ThemedScrollView>
    <AppModal visible={typeModalVisible} onClose={() => setTypeModalVisible(false)}>
      <View className="pb-20 w-full overflow-hidden">
        <AppWheelPicker data={mealTypes} value={mealType} onValueChanged={(item) => updateMealType(item.item.value)} />
      </View>
    </AppModal>
  </KeyboardAvoidingView>
  );
};
