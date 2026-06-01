import {styled} from 'nativewind';
import WheelPicker, {withVirtualized} from '@quidone/react-native-wheel-picker';
import {PickerItem, ValueChangedEvent} from '@quidone/react-native-wheel-picker/dest/typescript/base';
import WheelPickerFeedback from '@quidone/react-native-wheel-picker-feedback';

const VirtualizedWheelPicker = withVirtualized(WheelPicker);
const NativeWindWheelPicker = styled(VirtualizedWheelPicker, {
  className: 'style',
  overlayItemClassName: 'overlayItemStyle',
  itemTextClassName: 'itemTextStyle',
  contentContainerClassName: 'contentContainerStyle',
});
interface AppWheelPickerProps<T, > {
  data: PickerItem<T>[];
  value: T;
  onValueChanged: (event: ValueChangedEvent<PickerItem<T>>) => void;
}

export const AppWheelPicker = <T, >(props: AppWheelPickerProps<T>) => {
  return (
  <NativeWindWheelPicker
    className="grow"
    itemTextClassName="text-on-main"
    overlayItemClassName="bg-accent"
    data={props.data}
    value={props.value}
    onValueChanged={props.onValueChanged}
    onValueChanging={() => WheelPickerFeedback.triggerSoundAndImpact()}
   />
  );
};
