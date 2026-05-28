import {View, KeyboardAvoidingView, Platform} from 'react-native';
import {ThemedText} from '@/components/blocks/ThemedText/ThemedText';
import {ThemedView} from '@/components/blocks/ThemedView/ThemedView';
import {Stack, useRouter} from 'expo-router';
import React, {FC, useState} from 'react';
import {useAuth} from '@/components/providers/AuthProvider/useAuth';
import {ThemedScrollView} from '@/components/blocks/ThemedScrollView/ThemedScrollView';
import {ThemedBlock} from '@/components/blocks/ThemedBlock/ThemedBlock';
import {Separator} from '@/components/blocks/Separator/Separator';
import {useAppTheme} from '@/hooks/useAppTheme';
import {EntrySyncButton} from '../EntryListScreen/components/EntrySyncButton/EntrySyncButton';
import {ThemedLink} from '../../../blocks/ThemedLink/ThemedLink';
import {DateTimeUpdateModal} from '../../../blocks/DateTimeUpdateModal/DateTimeUpdateModal';
import {useAtom} from 'jotai';
import {weightAtom} from './utils/weightAtom';
import {WeightAppEntry} from '../../../../types/models/AppEntry';
import {useServices} from '../../../providers/ServiceProvider/ServiceProvider';
import {ScreenContainer} from '../../../blocks/ScreenContainer/ScreenContainer';
import {dateToString} from '../../../../utils/dateToString';
import {Modal} from 'react-native-reanimated-modal';
import WheelPicker from '@quidone/react-native-wheel-picker';
import {WheelPickerItemProps} from 'react-native-ui-lib';
import WheelPickerFeedback from '@quidone/react-native-wheel-picker-feedback';

const kilograms: WheelPickerItemProps<string>[] = [];
for (let i = 1; i <= 500; i++) {
  kilograms.push({label: i.toString(), value: i.toString()});
}
const grams: WheelPickerItemProps<string>[] = [];
for (let i = 0; i <= 99; i++) {
  grams.push({label: i.toString(), value: i.toString()});
}

export const WeightEditScreen: FC = () => {
  const theme = useAppTheme();
  const [entryAtom] = useAtom(weightAtom);
  const [entry, setEntry] = useAtom(entryAtom);
  const {entryService} = useServices();
  // const styles = getStyles(theme);
  const auth = useAuth();
  const user = auth.user;
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const {entryAtomService} = useServices();
  if (!user) {
    throw new Error('No user');
  }
  const [weightValue, setWeight] = useState(entry.weight.weight);
  const [dateValue, setDate] = useState(entry.time);
  const router = useRouter();
  const weight = entry.weight;
  const initialKilos = weightValue.toString().split('.')[0];
  const initalGrams = Number(weightValue.toString().split('.')[1] ?? '0').toString(); //dealing with leading zeros
  const setKilos = (value: string) => {
    const newValue = value + '.' + initalGrams;
    setWeight(Number(newValue));
    updateWeight(Number(newValue));
  };
  const setGrams = (value: string) => {
    const newValue = initialKilos + '.' + value.padStart(2, '0');
    setWeight(Number(newValue));
    updateWeight(Number(newValue));
  };
  const updateDate = async (date: Date) => {
    setDate(date);
    await entryAtomService.updateTime(entry, date);
  };
  const updateWeight = async (weight: number) => {
    const updatedEntry: WeightAppEntry = {
      ...entry,
      weight: {
        ...entry.weight,
        weight: weight,
      },
    };
    const result = await entryService.saveEntry(updatedEntry);
    setEntry(result);
  };

  const weightString = (weight: number) => {
    const parts = weight.toString().split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];
    return `${integerPart}.${(decimalPart ?? '0').padEnd(2, '0')}`;
  };

  const deleteEntry = async () => {
    await entryAtomService.deleteEntry(entry);
    router.back();
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ThemedScrollView className="h-full p-m" nestedScrollEnabled={false}>
          <ThemedView>
            <Stack.Screen options={{title: 'Weight Entry', headerShown: true}} />
            <ThemedBlock>
              <View style={{flexDirection: 'row', height: 30, alignItems: 'center'}}>
                <ThemedText style={{flexGrow: 1}}>Body Weight</ThemedText>
                <ThemedText onPress={() => setWeightModalVisible(true)}>{weightString(weightValue)} {weight.units}</ThemedText>
              </View>
              <Separator/>
              <View style={{flexDirection: 'row', height: 30, alignItems: 'center'}}>
                <ThemedText style={{flexGrow: 1}}>Date</ThemedText>
                <ThemedText onPress={() => setDateModalVisible(true)}>{dateToString(dateValue)}</ThemedText>
              </View>
              <Separator/>
              <View style={{flexDirection: 'row', height: 30, alignItems: 'center'}}>
                <ThemedText style={{flexGrow: 1}}>Synced</ThemedText>
                <EntrySyncButton entry={entry} onUpdate={(e) => setEntry({...entry, updatedAt: e.updatedAt})} />
              </View>
              <Separator />
                  <View style={{flexDirection: 'row', justifyContent: 'center', gap: 40}}>
                    <ThemedLink onPress={deleteEntry}>Delete</ThemedLink>
                  </View>
            </ThemedBlock>
          </ThemedView>
          <DateTimeUpdateModal onClose={() => setDateModalVisible(false)} date={dateValue} visible={dateModalVisible} onUpdate={updateDate} />
          <Modal visible={weightModalVisible} onBackdropPress={() => setWeightModalVisible(false)}
           animation={{type: 'slide', duration: 300}}
           backdrop={{enabled: true, color: '#000000', opacity: 0.5}}
           style={{flex: 1, justifyContent: 'flex-end'}}>
            <View style={{width: '100%'}}>
              <View style={{paddingBottom: 60, backgroundColor: theme.surface, width: '100%'}}>
                <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                  <ThemedLink style={{fontSize: 16, margin: theme.marginS}} onPress={() => setWeightModalVisible(false)}>Done</ThemedLink>
                </View>
                <View style={{paddingHorizontal: 20, flexDirection: 'row', overflow: 'hidden', justifyContent: 'space-evenly', gap: 20}}>
                  <WheelPicker data={kilograms}
                  enableScrollByTapOnItem
                  onValueChanging={() => WheelPickerFeedback.triggerSoundAndImpact()}
                   value={initialKilos ?? '50'} onValueChanged={(item) => setKilos(item.item.value)} style={{flexGrow: 1}}
                   itemTextStyle={{color: theme.text}}
                   />
                  <WheelPicker
                  enableScrollByTapOnItem
                  itemTextStyle={{color: theme.text}}
                  onValueChanging={() => WheelPickerFeedback.triggerSoundAndImpact()}
                  data={grams} value={initalGrams} onValueChanged={(item) => setGrams(item.item.value)} style={{flexGrow: 1}} />
                </View>
              </View>
            </View>
          </Modal>
        </ThemedScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};
