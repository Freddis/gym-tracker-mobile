import uuid from 'react-native-uuid';

export interface Wrapped<T>{
  item: T;
  key: string;
}

export const wrap = <T>(item: T): Wrapped<T> => {
  return {
    item,
    key: uuid.v4(),
  };
};
