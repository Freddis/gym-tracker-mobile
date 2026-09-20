import {FC, useEffect, useRef, useState} from 'react';

import {ZodTypeAny} from 'zod';
import {ThemedTextInput, ThemedTextInputProps} from '../ThemedInput/ThemedInput';

interface ThemedSearchInputProps extends ThemedTextInputProps {
  onSearch: (value:string | null) => void,
  debounce?: number
  minLength?: number
  validator?: ZodTypeAny
}
export const ThemedSearchInput: FC<ThemedSearchInputProps> = (props) => {
  const {minLength = 3, debounce = 1000, validator, onSearch, ...rest} = props;
  // Keeps the typed value on its own unless the parent passes one, so the search can be cleared from the outside.
  const [ownValue, setOwnValue] = useState(props.value ?? '');
  const value = props.value ?? ownValue;
  const trimmed = value.trim();
  const search = trimmed.length < minLength ? null : trimmed;
  const hasError = validator && value !== '' && !validator.safeParse(value).success;
  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);
  useEffect(() => {
    const timeout = setTimeout(() => onSearchRef.current(search), debounce);
    return () => clearTimeout(timeout);
  }, [search, debounce]);
  const onChangeText: ThemedSearchInputProps['onChangeText'] = (e) => {
    setOwnValue(e);
    props.onChangeText?.(e);
  };

  return <ThemedTextInput {...rest} type={hasError ? 'dangerText' : undefined} onChangeText={onChangeText} value={value} />;
};
