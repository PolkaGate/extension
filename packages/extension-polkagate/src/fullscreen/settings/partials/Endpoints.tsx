// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

import { ChainLogo, DecisionButtons, FadeOnScroll } from '@polkadot/extension-polkagate/src/components/index';

import EndpointManager2 from '../../../class/endpointManager2';
import MySwitch from '../../../components/MySwitch';
import Radio from '../../../components/Radio';
import { useChainInfo, useEndpoint2, useEndpoints, useTranslation } from '../../../hooks';
import DotIndicator from '../../../popup/settings/extensionSettings/components/DotIndicator';
import CalculateNodeDelay from '../../../util/calculateNodeDelay';
import { AUTO_MODE } from '../../../util/constants';
import { DraggableModal } from '../../components/DraggableModal';

const endpointManager = new EndpointManager2();

type EndpointsDelay = { name: string, delay: number | null | undefined, value: string }[];

interface Props {
  genesisHash: string;
  isEnabled: boolean;
  open: boolean;
  onClose: () => void;
  onEnableChain: (value: string, checked: boolean) => void;
}
interface EndpointRowProps {
  isFirst: boolean;
  isLast: boolean;
  checked: boolean;
  name: string;
  value: string;
  delay: number | null | undefined;
  onChangeEndpoint: (event: React.ChangeEvent<HTMLInputElement>) => void
}

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
      return { ...state, maybeNewEndpoint: action.payload };
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

function EndpointRow ({ checked, delay, isFirst, isLast, name, onChangeEndpoint, value }: EndpointRowProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Grid alignItems='start' container direction='column' item key={value} py='5px' sx={{ bgcolor: '#05091C', borderRadius: isFirst ? '14px 14px 0 0' : isLast ? '0 0 14px 14px' : 0, flexWrap: 'nowrap', height: isFirst ? '100px' : '73px', mt: '2px', px: '10px' }}>
      {
        isFirst &&
        <Typography color='#7956A5' fontFamily='Inter' fontSize='11px' fontWeight={600} sx={{ p: '8px' }}>
          {t('NODES')}
        </Typography>
      }
      <Stack alignItems='center' columnGap='10px' direction='row'>
        <Radio
          checked={checked}
          columnGap='5px'
          label={name}
          onChange={onChangeEndpoint}
          value={value}
        />
        <DotIndicator delay={delay} />
      </Stack>
      <Grid item sx={{ mt: '-5px', pl: '10px' }}>
        <Typography color='#674394' variant='B-5'>
          {value}
        </Typography>
      </Grid>
    </Grid>
  );
}

function Endpoints ({ genesisHash, isEnabled, onClose, onEnableChain, open }: Props): React.ReactElement {
  const { t } = useTranslation();
  const refContainer = useRef(null);

  const isFetching = useRef<Record<string, boolean>>({});
  const { displayName } = useChainInfo(genesisHash);
  const { endpoint, isAuto } = useEndpoint2(genesisHash);
  const endpointOptions = useEndpoints(genesisHash);

  const [state, dispatch] = useReducer(reducer, {
    endpointsDelay: undefined,
    isOnAuto: undefined,
    mayBeEnabled: isEnabled,
    maybeNewEndpoint: undefined
  });

  const { endpointsDelay, isOnAuto, mayBeEnabled, maybeNewEndpoint } = state;

  // Just to initialize
  useEffect(() => {
    if (state.maybeNewEndpoint || isOnAuto) {
      return;
    }

    if (isAuto && isOnAuto === undefined) {
      return dispatch({ type: 'TOGGLE_AUTO' });
    }

    endpoint && dispatch({ payload: endpoint, type: 'SET_ENDPOINT' });
  }, [endpoint, isAuto, state.maybeNewEndpoint, isOnAuto]);

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

  const onChangeEndpoint = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch({ payload: event.target.value, type: 'SET_ENDPOINT' });
  }, []);

  const onToggleAuto = useCallback((_event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch({ type: 'TOGGLE_AUTO' });
  }, []);

  const onEnableNetwork = useCallback((_event: React.ChangeEvent<HTMLInputElement>, _checked: boolean): void => {
    dispatch({ type: 'SET_ENABLED' });
  }, []);

  const onApply = useCallback((): void => {
    onEnableChain(genesisHash, mayBeEnabled);

    const checkForNewOne = maybeNewEndpoint === AUTO_MODE.value && endpointManager.get(genesisHash)?.isAuto;

    endpointManager.set(genesisHash, {
      checkForNewOne,
      endpoint: maybeNewEndpoint,
      isAuto: isOnAuto,
      timestamp: Date.now()
    });

    onClose();
  }, [genesisHash, mayBeEnabled, maybeNewEndpoint, isOnAuto, onClose, onEnableChain]);

  const _onClose = useCallback(() => {
    dispatch({ type: 'RESET' });
    isFetching.current = {};
    onClose();
  }, [onClose]);

  const isDisabled = useMemo(() => {
    const noEndpointChange = maybeNewEndpoint === endpoint;
    const noEnableChange = mayBeEnabled === isEnabled;

    return noEndpointChange && noEnableChange;
  }, [endpoint, isEnabled, mayBeEnabled, maybeNewEndpoint]);

  const filteredEndpoints = useMemo(() => {
    return endpointsDelay?.filter(({ name }) => name !== AUTO_MODE.text && !name.includes('light client'));
  }, [endpointsDelay]);

  return (
    <DraggableModal
      TitleLogo={<ChainLogo genesisHash={genesisHash} showSquare size={36} />}
      onClose={_onClose}
      open={open}
      showBackIconAsClose
      style={{ minHeight: '400px', padding: '20px' }}
      title={displayName}
    >
      <Stack direction='column'>
        <Stack direction='column' sx={{ position: 'relative', width: '100%' }}>
          <Grid container height='420px' item ref={refContainer} sx={{ bgcolor: '#1B133C', borderRadius: '14px', display: 'block', overflowY: 'auto', position: 'relative' }}>
            <MySwitch
              checked={mayBeEnabled}
              columnGap='8px'
              label={t('Enable Network')}
              onChange={onEnableNetwork}
              style={{ alignItems: 'center', backgroundColor: '#05091C', borderRadius: '18px', height: '52px', justifyContent: 'flex-start', padding: '0 15px', width: '100%' }}
              value={mayBeEnabled}
            />
            <MySwitch
              checked={isOnAuto}
              columnGap='8px'
              label={t('Auto Node Selection')}
              onChange={onToggleAuto}
              style={{ alignItems: 'center', backgroundColor: '#05091C', borderRadius: '18px', height: '52px', justifyContent: 'flex-start', margin: '8px 0', padding: '0 15px', width: '100%' }}
              value={AUTO_MODE.value}
            />
            {filteredEndpoints?.map(({ delay, name, value }, index) => (
              <EndpointRow
                checked={maybeNewEndpoint === value}
                delay={delay}
                isFirst={index === 0}
                isLast={index === filteredEndpoints.length - 1}
                key={index}
                name={name}
                onChangeEndpoint={onChangeEndpoint}
                value={value}
              />
            ))}
          </Grid>
          <FadeOnScroll containerRef={refContainer} height='50px' ratio={0.3} style={{ borderRadius: '14px', justifySelf: 'center', width: '100%' }} />
        </Stack>
        <DecisionButtons
          cancelButton
          direction='vertical'
          disabled={isDisabled}
          onPrimaryClick={onApply}
          onSecondaryClick={_onClose}
          primaryBtnText={t('Apply')}
          secondaryBtnText={t('Back')}
          style={{ marginTop: '15px', width: '100%' }}
        />
      </Stack>
    </DraggableModal>

  );
}

export default React.memo(Endpoints);
