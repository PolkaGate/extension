// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type React from 'react';

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

import EndpointManager from '../../../class/endpointManager';
import { useEndpoint, useEndpoints, useIsExtensionPopup } from '../../../hooks';
import CalculateNodeDelay from '../../../util/calculateNodeDelay';
import { AUTO_MODE } from '../../../util/constants';

type EndpointsDelay = { name: string, delay: number | null | undefined, value: string }[];

interface State {
  isOnAuto: boolean | undefined;
  mayBeEnabled: boolean;
  maybeNewEndpoint?: string;
  endpointsDelay?: EndpointsDelay;
}

type Action =
  | { type: 'SET_ENABLED'; }
  | { type: 'TOGGLE_AUTO'; }
  | { type: 'SET_ENDPOINT'; payload: string | undefined }
  | { type: 'SET_ENDPOINTS_DELAY'; payload: EndpointsDelay }
  | { type: 'UPDATE_DELAY'; payload: { endpoint: string; delay: number } }
  | { type: 'RESET' };

function reducer (state: State, action: Action): State {
  switch (action.type) {
    case 'SET_ENABLED':
      return { ...state, mayBeEnabled: !state.mayBeEnabled };

    case 'TOGGLE_AUTO': {
      const toggle = !state.isOnAuto;

      return { ...state, isOnAuto: toggle, maybeNewEndpoint: toggle ? undefined : state.maybeNewEndpoint };
    }

    case 'SET_ENDPOINT':
      return { ...state, isOnAuto: false, maybeNewEndpoint: action.payload };

    case 'SET_ENDPOINTS_DELAY':
      return { ...state, endpointsDelay: action.payload };

    case 'UPDATE_DELAY':
      return {
        ...state,
        endpointsDelay: state.endpointsDelay?.map((e) =>
          e.value === action.payload.endpoint ? { ...e, delay: action.payload.delay } : e
        )
      };

    case 'RESET':
      return { endpointsDelay: undefined, isOnAuto: undefined, mayBeEnabled: false, maybeNewEndpoint: undefined };

    default:
      return state;
  }
}

const endpointManager = new EndpointManager();

export default function useEndpointsSetting (genesisHash: string | undefined, isEnabled: boolean, onEnableChain?: (value: string, checked: boolean) => void, onClose?: () => void) {
  const isExtension = useIsExtensionPopup();
  const { endpoint, isAuto } = useEndpoint(genesisHash);
  const endpointOptions = useEndpoints(genesisHash);

  const isFetching = useRef<Record<string, boolean>>({});
  // Keep a reference to the previous state to compare changes
  const prevStateRef = useRef<State | null>(null);

  const [state, dispatch] = useReducer(reducer, {
    endpointsDelay: undefined,
    isOnAuto: undefined,
    mayBeEnabled: isEnabled,
    maybeNewEndpoint: undefined
  });

  const { endpointsDelay, isOnAuto, mayBeEnabled, maybeNewEndpoint } = state;

  // Just to initialize
  useEffect(() => {
    if (maybeNewEndpoint || isOnAuto) {
      return;
    }

    if (isAuto && isOnAuto === undefined) {
      return dispatch({ type: 'TOGGLE_AUTO' });
    }

    endpoint && dispatch({ payload: endpoint, type: 'SET_ENDPOINT' });
  }, [endpoint, isAuto, maybeNewEndpoint, isOnAuto]);

  const onApply = useCallback((): void => {
    genesisHash && onEnableChain?.(genesisHash, mayBeEnabled);

    const checkForNewOne = Boolean(maybeNewEndpoint === AUTO_MODE.value && genesisHash && endpointManager.get(genesisHash)?.isAuto);

    genesisHash && endpointManager.set(genesisHash, {
      checkForNewOne,
      endpoint: maybeNewEndpoint || AUTO_MODE.value,
      isAuto: isOnAuto,
      timestamp: Date.now()
    });

    onClose?.();
  }, [genesisHash, onEnableChain, mayBeEnabled, maybeNewEndpoint, isOnAuto, onClose]);

  // If we're in the extension popup context, auto-apply behavior
  useEffect(() => {
    if (!isExtension) {
      return;
    }

    // Only apply if state actually changed (avoid loops)
    if (prevStateRef.current && prevStateRef.current !== state) {
      onApply();
    }

    // Update the ref with the current state for the next comparison
    prevStateRef.current = state;
  }, [state, isExtension, onApply]);

  const mappedEndpoints = useMemo(() => {
    if (!endpointOptions.length) {
      return [];
    }

    return endpointOptions.map(({ text, value }) => ({
      delay: null,
      name: text.replace(/^via\s/, ''),
      value
    })) as EndpointsDelay;
  }, [endpointOptions]);

  useEffect(() => {
    if (mappedEndpoints.length) {
      dispatch({ payload: mappedEndpoints, type: 'SET_ENDPOINTS_DELAY' });
    }
  }, [mappedEndpoints]);

  const calculateAndSetDelay = useCallback((endpoint: string) => {
    endpoint && CalculateNodeDelay(endpoint)
      .then((response) => {
        if (!response) {
          return;
        }

        isFetching.current[endpoint] = false;
        dispatch({ payload: { delay: response.delay, endpoint: response.endpoint }, type: 'UPDATE_DELAY' });

        response.api?.disconnect().catch(console.error); // if we don't need it to be used in the extension we can disconnect it in the function instead
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    mappedEndpoints?.forEach(({ value }) => {
      if (value && value !== AUTO_MODE.value && !isFetching.current?.[value]) {
        isFetching.current[value] = true;
        calculateAndSetDelay(value);
      }
    });
  }, [calculateAndSetDelay, endpoint, mappedEndpoints]);

  const filteredEndpoints = useMemo(() => {
    return endpointsDelay?.filter(({ name }) => name !== AUTO_MODE.text && !name.includes('light client'));
  }, [endpointsDelay]);

  const onChangeEndpoint = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch({ payload: event.target.value, type: 'SET_ENDPOINT' });
  }, []);

  const onToggleAuto = useCallback((_event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch({ type: 'TOGGLE_AUTO' });
  }, []);

  const onEnableNetwork = useCallback((_event: React.ChangeEvent<HTMLInputElement>, _checked: boolean): void => {
    dispatch({ type: 'SET_ENABLED' });
  }, []);

  return {
    ...state,
    dispatch,
    filteredEndpoints,
    onApply,
    onChangeEndpoint,
    onEnableNetwork,
    onToggleAuto
  };
}
