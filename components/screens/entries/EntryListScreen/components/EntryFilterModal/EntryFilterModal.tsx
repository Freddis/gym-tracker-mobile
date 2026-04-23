import {FC, useState} from 'react';
import {View, Pressable, Switch} from 'react-native';
import {EntryType} from '../../../../../../openapi-client';
import {AppModal} from '../../../../../blocks/AppModal/AppModel';
import {ThemedText} from '../../../../../blocks/ThemedText/ThemedText';
import {useAppTheme} from '../../../../../../hooks/useAppTheme';
import {EntryFilterModalProps} from './types/EntryFilterModalProps';

export const EntryFilterModal: FC<EntryFilterModalProps> = (props) => {
  const [types, setTypes] = useState<EntryType[]>(Object.values(EntryType));
  const theme = useAppTheme();
  const onTypeChange = (type: EntryType, value: boolean) => {
    const newTypes = value ? [...types, type] : types.filter((t) => t !== type);
    setTypes(newTypes);
    props.onChange(newTypes);
  };
  return (
    <AppModal visible={props.visible} onClose={props.onClose}>
      <View style={{flexDirection: 'column', height: 200, gap: theme.marginM}}>
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
