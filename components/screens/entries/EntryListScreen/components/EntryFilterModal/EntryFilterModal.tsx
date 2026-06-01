import {FC, useState} from 'react';
import {View, Pressable, Switch, Button} from 'react-native';
import {EntryType} from '../../../../../../openapi-client';
import {AppModal} from '../../../../../blocks/AppModal/AppModal';
import {ThemedText} from '../../../../../blocks/ThemedText/ThemedText';
import {useAppTheme} from '../../../../../../hooks/useAppTheme';
import {EntryFilterModalProps} from './types/EntryFilterModalProps';
import {DateTimePicker} from 'react-native-ui-lib';

export const EntryFilterModal: FC<EntryFilterModalProps> = (props) => {
  const [types, setTypes] = useState<EntryType[]| null>([]);
  const [date, setDate] = useState<Date | null>(null);
  const theme = useAppTheme();
  const onTypeChange = (type: EntryType, value: boolean) => {
    const existingTypes = types ?? [];
    const newTypes = value ? [...existingTypes, type] : existingTypes.filter((t) => t !== type);
    const final = newTypes.length > 0 ? newTypes : null;
    setTypes(final);
    props.onChange({
      types: final,
      date,
    });
  };
  const onDateChange = (date: Date) => {
    setDate(date);
    props.onChange({
      types,
      date,
    });
  };
  const onClear = () => {
    setDate(null);
    setTypes(null);
    props.onChange({
      types: null,
      date: null,
    });
  };
  return (
    <AppModal visible={props.visible} onClose={props.onClose}>
      <View style={{flexDirection: 'column', height: 500, gap: theme.marginM}}>
        <View style={{flexDirection: 'row', alignItems: 'center', flexGrow: 0, gap: theme.marginM}}>
          <ThemedText style={{flexGrow: 1}}>Date from:</ThemedText>
          <Button title="Clear" color={theme.accent} onPress={onClear} />
        </View>
        <DateTimePicker placeholder={'Latest entries'} value={date ?? undefined} mode={'date'} onChange={(date) => onDateChange(date)}/>
        <View style={{flexDirection: 'row', alignItems: 'center', flexGrow: 0, gap: theme.marginM}}>
          <ThemedText style={{}}>By Type</ThemedText>
        </View>
        {Object.values(EntryType).map((type) => (
          <View key={type} style={{flexDirection: 'row', alignItems: 'center', flexGrow: 0, gap: theme.marginS}}>
            <Pressable
              onPress={() => onTypeChange(type, !(types ?? []).includes(type))}
              style={{flexDirection: 'row', alignItems: 'center', flexGrow: 0, gap: theme.marginS}}
            >
              <Switch
              value={(types ?? []).includes(type)}
              style={{transform: [{scaleX: 0.7}, {scaleY: 0.7}], marginLeft: -10}}
              trackColor={{true: theme.accent}}
              />
              <ThemedText>{type}</ThemedText>
            </Pressable>
          </View>
        ))}
      </View>
    </AppModal>
  );
};
