import {FC} from 'react';
import {View, Pressable, Switch, Button} from 'react-native';
import {EntryType} from '../../../../../../openapi-client';
import {AppModal} from '../../../../../blocks/AppModal/AppModal';
import {ThemedText} from '../../../../../blocks/ThemedText/ThemedText';
import {useAppTheme} from '../../../../../../hooks/useAppTheme';
import {EntryFilterModalProps} from './types/EntryFilterModalProps';
import {DateTimePicker} from 'react-native-ui-lib';

export const EntryFilterModal: FC<EntryFilterModalProps> = (props) => {
  const {filter} = props;
  const theme = useAppTheme();
  const types = filter.types ?? [];
  const onTypeChange = (type: EntryType, value: boolean) => {
    const newTypes = value ? [...types, type] : types.filter((t) => t !== type);
    props.onChange({...filter, types: newTypes.length > 0 ? newTypes : undefined});
  };
  const onDateChange = (date: Date) => {
    props.onChange({...filter, date});
  };
  const onClear = () => {
    props.onChange({...filter, types: undefined, date: undefined});
  };
  return (
    <AppModal visible={props.visible} onClose={props.onClose}>
      <View style={{flexDirection: 'column', height: 500, gap: theme.marginM}}>
        <View style={{flexDirection: 'row', alignItems: 'center', flexGrow: 0, gap: theme.marginM}}>
          <ThemedText style={{flexGrow: 1}}>Date from:</ThemedText>
          <Button title="Clear" color={theme.accent} onPress={onClear} />
        </View>
        <DateTimePicker placeholder={'Latest entries'} value={filter.date} mode={'date'} onChange={(date) => onDateChange(date)}/>
        <View style={{flexDirection: 'row', alignItems: 'center', flexGrow: 0, gap: theme.marginM}}>
          <ThemedText style={{}}>By Type</ThemedText>
        </View>
        {Object.values(EntryType).map((type) => (
          <View key={type} style={{flexDirection: 'row', alignItems: 'center', flexGrow: 0, gap: theme.marginS}}>
            <Pressable
              onPress={() => onTypeChange(type, !types.includes(type))}
              style={{flexDirection: 'row', alignItems: 'center', flexGrow: 0, gap: theme.marginS}}
            >
              <Switch
              value={types.includes(type)}
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
