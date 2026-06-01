import {FC} from 'react';
import {View} from 'react-native';
import {AppModalProps} from './types/AppModalProps';
import {Modal} from 'react-native-reanimated-modal';
import {AppModalCloseButton} from './components/AppModalCloseButton';


export const AppModal: FC<AppModalProps> = (props) => {
  return (
    <Modal visible={props.visible} animation="slide" onHide={props.onClose} onBackdropPress={props.onClose} style={{justifyContent: 'flex-end'}}>
      <View className="bg-surface rounded-t-xl">
        <View className="flex-row justify-end px-m">
          {props.customHeader ?? <AppModalCloseButton onClose={props.onClose} />}
        </View>
        <View className="p-m">
          {props.children}
        </View>
      </View>
    </Modal>
  );
};
