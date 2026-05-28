import {useFocusEffect} from '@react-navigation/native';
import {useCallback, useEffect, useRef} from 'react';

type EffectCallback = () => void | (() => void);

export function useFocusOnce(effect: EffectCallback) {
  const effectRef = useRef(effect);
  const hasRunRef = useRef(false);

  useEffect(() => {
    effectRef.current = effect;
  }, [effect]);

  useFocusEffect(
    useCallback(() => {
      if (hasRunRef.current) return;

      hasRunRef.current = true;

      const cleanup = effectRef.current?.();

      return () => {
        hasRunRef.current = false;

        if (typeof cleanup === 'function') {
          cleanup();
        }
      };
    }, [])
  );
}
