import {AppScreenContainer} from '../../../blocks/AppScreenContainer/AppScreenContainer';
import {BackHeaderButton} from '../../../blocks/BackHeaderButton/BackHeaderButton';
import {Stack, useRouter} from 'expo-router';
import {ThemedButtonList} from '../../../blocks/ThemedButtonList/ThemedButtonList';
import {ThemedScrollView} from '../../../blocks/ThemedScrollView/ThemedScrollView';
import {RoutePath} from '../../../../types/RoutePath';
import {useSetAtom} from 'jotai';
import {useState} from 'react';
import {Alert, Modal, View, ActivityIndicator} from 'react-native';
import {DataScanner} from 'react-native-data-scanner';
import {useCameraPermission} from 'react-native-vision-camera';
import {Food} from '../../../../openapi-client';
import {api} from '../../../../utils/api';
import {ThemedBlock} from '../../../blocks/ThemedBlock/ThemedBlock';
import {ThemedText} from '../../../blocks/ThemedText/ThemedText';
import {scannedFoodAtom} from './utils/scannedFoodAtom';

export const FoodAddScreen = () => {
  const {hasPermission, requestPermission} = useCameraPermission();
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const setScannedFood = useSetAtom(scannedFoodAtom);
  const router = useRouter();
  const scanBarcode = async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        return;
      }
    }
    const result = await DataScanner.scanBarcode({
      targetFormats: ['ean-13', 'ean-8'],
      enableAutoZoom: true,
    });

    await fetchFood(result.value);
  };
  const fetchFood = async (barcode: string | undefined) => {
    const value = Number(barcode);
    console.log('Getting food for barcode', value);
    if (isNaN(value)) {
      Alert.alert('Error', 'Invalid barcode');
      router.back();
      return;
    }
    setShowProcessingModal(true);
    const response = await api.scanBarcode({
      body: {
        barcode: value,
      },
    });
    if (!response.data) {
      Alert.alert('Error', 'Food not found');
      setShowProcessingModal(false);
      router.back();
      return;
    }
    console.log('Food found', response.data);
    const food: Food = response.data;
    setScannedFood(food);
    router.dismissTo({
      pathname: '/app/entries/food/foodCreate',
    });
  };

  const items: [string, RoutePath | (() => void)][] = [
    ['Add Food', '/app/entries/food/foodCreate'],
    ['Add A Dish', '/app/entries/food/dishCreate'],
    ['Scan Barcode', scanBarcode],
  ];
  return (
    <AppScreenContainer>
      <Stack.Screen options={{title: 'Food Create', headerShown: true, headerLeft: () => <BackHeaderButton />}} />
      <ThemedScrollView className="h-full p-m">
        <ThemedButtonList items={items} replace={true} />
      </ThemedScrollView>
      <Modal visible={showProcessingModal} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black-90">
          <ThemedBlock className="w-2/3 gap-m">
            <ThemedText className="text-center">Processing barcode</ThemedText>
            <ActivityIndicator size="large"/>
          </ThemedBlock>
        </View>
      </Modal>
    </AppScreenContainer>
  );
};
