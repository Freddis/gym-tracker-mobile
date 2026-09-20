import {forwardRef, useImperativeHandle, useRef, useState} from 'react';

import {ZodTypeAny} from 'zod';
import {ThemedTextInput, ThemedTextInputProps} from '../ThemedInput/ThemedInput';

interface ThemedSearchInputProps extends ThemedTextInputProps {
  onSearch: (value:string | null) => void,
  debounce?: number
  minLength?: number
  validator?: ZodTypeAny
}

export interface ThemedSearchInputHandle {
  clear: () => void
}

export const ThemedSearchInput = forwardRef<ThemedSearchInputHandle, ThemedSearchInputProps>((props, ref) => {
  const {minLength = 3, debounce = 1000, validator, onSearch, ...rest} = props;
  const [searchValue, setSearchValue] = useState(props.value ?? '');
  const hasError = validator && searchValue !== '' && !validator.safeParse(searchValue).success;
  // A ref, not a state, so that a pending search is cancelled even by a change within the same render.
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const onChange: ThemedSearchInputProps['onChangeText'] = (e) => {
    const trimmed = e.trim();
    clearTimeout(timeoutRef.current);
    setSearchValue(e);
    // Emptying the input, the clear button in particular, should not wait for the debounce.
    if (trimmed === '') {
      onSearch(null);
      return;
    }
    timeoutRef.current = setTimeout(() => {
      onSearch(trimmed.length < minLength ? null : trimmed);
    }, debounce);
  };
  useImperativeHandle(ref, () => ({
    clear: () => {
      clearTimeout(timeoutRef.current);
      setSearchValue('');
    },
  }));

  return (
    <ThemedTextInput
      clearButtonMode="always"
      {...rest}
      type={hasError ? 'dangerText' : undefined}
      onChangeText={onChange}
      value={searchValue}
    />
  );
});
ThemedSearchInput.displayName = 'ThemedSearchInput';
