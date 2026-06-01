import {FC} from 'react';
import {Button} from 'react-native';

export const AppModalCloseButton: FC<{onClose: () => void}> = (props) => {
  return (
    <Button title="Done" onPress={props.onClose} className="color-accent" />
  );
};
