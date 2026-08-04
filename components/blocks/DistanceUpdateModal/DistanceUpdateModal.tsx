import {FC, useEffect, useState} from 'react';
import {View} from 'react-native';
import {AppModalCloseButton} from '../AppModal/components/AppModalCloseButton';
import {AppWheelPicker} from '../AppWheelPicker/AppWheelPicker';
import {AppWheelPickerModal} from '../AppWheelPickerModal/AppWheelPickerModal';
import {WheelPickerItemProps} from 'react-native-ui-lib';

interface DistanceUpdateModalProps {
  value: number;
  visible: boolean;
  onClose: () => void;
  onUpdate: (value: number) => void;
};

const kilometersRange: WheelPickerItemProps<number>[] = [];
for (let i = 0; i < 1000; i++) {
  kilometersRange.push({label: i.toString(), value: i});
}
// 10m increments within for faster scroll
const metersRange: WheelPickerItemProps<number>[] = [];
for (let i = 0; i < 1000; i += 10) {
  metersRange.push({label: i.toString().padStart(3, '0'), value: i});
}
export const DistanceUpdateModal: FC<DistanceUpdateModalProps> = (props) => {
  const initialKilometers = Math.floor(props.value / 1000);
  const initialMeters = Math.round((props.value % 1000) / 10) * 10;

  const [kilometers, setKilometers] = useState(initialKilometers);
  const [meters, setMeters] = useState(initialMeters);

  useEffect(() => {
    setKilometers(Math.floor(props.value / 1000));
    setMeters(Math.round((props.value % 1000) / 10) * 10);
  }, [props.value]);

  const handleSetKilometers = (value: number) => {
    setKilometers(value);
    props.onUpdate(value * 1000 + meters);
  };
  const handleSetMeters = (value: number) => {
    setMeters(value);
    props.onUpdate(kilometers * 1000 + value);
  };
  const header = (
    <View className="w-full flex-row gap-s justify-end">
      <AppModalCloseButton onClose={props.onClose} />
    </View>
  );
  return (
    <AppWheelPickerModal visible={props.visible} onClose={props.onClose} customHeader={header}>
      <View className="flex-row gap-s">
        <View className="flex-1">
          <AppWheelPicker
            data={kilometersRange}
            value={kilometers}
            onValueChanged={(item) => handleSetKilometers(Number(item.item.value))}
          />
        </View>
        <View className="flex-1">
          <AppWheelPicker
            data={metersRange}
            value={meters}
            onValueChanged={(item) => handleSetMeters(Number(item.item.value))}
          />
        </View>
      </View>
    </AppWheelPickerModal>
  );
};
