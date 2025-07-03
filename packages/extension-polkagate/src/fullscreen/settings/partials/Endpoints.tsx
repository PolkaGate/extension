// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ChainLogo, DecisionButtons } from '@polkadot/extension-polkagate/src/components/index';

import EndpointManager2 from '../../../class/endpointManager2';
import MySwitch from '../../../components/MySwitch';
import { useChainInfo, useEndpoint2, useEndpoints, useTranslation } from '../../../hooks';
import DotIndicator from '../../../popup/settings/extensionSettings/components/DotIndicator';
import PRadio from '../../../popup/settings/extensionSettings/components/Radio';
import CalculateNodeDelay from '../../../util/calculateNodeDelay';
import { AUTO_MODE } from '../../../util/constants';
import { DraggableModal } from '../../components/DraggableModal';

const endpointManager = new EndpointManager2();

type EndpointsDelay = { name: string, delay: number | null | undefined, value: string }[];

interface Props {
  genesisHash: string;
  open: boolean;
  onClose: () => void;
}

function Endpoints ({ genesisHash, onClose, open }: Props): React.ReactElement {
  const { t } = useTranslation();
  const isFetching = useRef<Record<string, boolean>>({});
  const { displayName } = useChainInfo(genesisHash);
  const { endpoint } = useEndpoint2(genesisHash);
  const endpointOptions = useEndpoints(genesisHash);

  const [maybeNewEndpoint, setMaybeNewEndpoint] = useState<string | undefined>();
  const [endpointsDelay, setEndpointsDelay] = useState<EndpointsDelay>();

  const isAutoMode = maybeNewEndpoint === AUTO_MODE.value;

  const onChangeEndpoint = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    setMaybeNewEndpoint((prev) => prev === AUTO_MODE.value && event.target.value === AUTO_MODE.value ? undefined : event.target.value);
  }, []);

  const onApply = useCallback((): void => {
    if (!maybeNewEndpoint || !genesisHash) {
      return;
    }

    const checkForNewOne = maybeNewEndpoint === AUTO_MODE.value && endpointManager.get(genesisHash)?.isAuto;

    endpointManager.set(genesisHash, {
      checkForNewOne,
      endpoint: maybeNewEndpoint,
      isAuto: maybeNewEndpoint === AUTO_MODE.value,
      timestamp: Date.now()
    });
    onClose();
  }, [genesisHash, maybeNewEndpoint, onClose]);

  const endpoints = useMemo(() => {
    if (!endpointOptions.length) {
      return;
    }

    const mappedEndpoints = endpointOptions.map(({ text, value }) => ({ delay: null, name: text.replace(/^via\s/, ''), value })) as EndpointsDelay;

    setEndpointsDelay(mappedEndpoints);

    return mappedEndpoints;
  }, [endpointOptions]);

  const calculateAndSetDelay = useCallback((endpoint: string) => {
    endpoint && CalculateNodeDelay(endpoint)
      .then((response) => {
        if (!response) {
          return;
        }

        isFetching.current[endpoint] = false;
        setEndpointsDelay((prevEndpoints) => {
          return prevEndpoints?.map((e) => {
            if (e.value === response.endpoint) {
              return { ...e, delay: response.delay };
            }

            return e;
          });
        });

        response.api?.disconnect().catch(console.error); // if we don't need it to be used in the extension we can disconnect it in the function instead
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    endpoint && setMaybeNewEndpoint(endpoint);
  }, [endpoint]);

  useEffect(() => {
    endpoints?.forEach(({ value }) => {
      if (value && value !== AUTO_MODE.value && !isFetching.current?.[value]) {
        isFetching.current[value] = true;
        calculateAndSetDelay(value);
      }
    });
  }, [calculateAndSetDelay, endpoint, endpoints]);

  const _onClose = useCallback(() => {
    setMaybeNewEndpoint(undefined);
    setEndpointsDelay(undefined);
    isFetching.current = {};
    onClose();
  }, [onClose]);

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
        <Grid container height='420px' item sx={{ bgcolor: '#1B133C', borderRadius: '14px', display: 'block', overflowY: 'auto' }}>
          <Grid alignItems='center' container item justifyContent='flex-start' py='5px' sx={{ bgcolor: '#05091C', borderRadius: '14px', height: '60px', px: '10px', mt: '4px' }}>
            <MySwitch
              checked={isAutoMode}
              columnGap='8px'
              label={t('Auto Mode')}
              onChange={onChangeEndpoint}
              value={AUTO_MODE.value}
            />
            <Grid item sx={{ mt: '-5px' }}>
              <Typography color='#674394' variant='B-5'>
                {t('Automatically select the highest-performing remote node.')}
              </Typography>
            </Grid>
          </Grid>
          {endpointsDelay?.filter(({ name }) => name !== AUTO_MODE.text && !name.includes('light client')).map(({ delay, name, value }, index) => (
            <Grid alignItems='start' container direction='column' item key={value} py='5px' sx={{ bgcolor: '#05091C', borderRadius: '14px', height: index === 0 ? '100px' : '73px', px: '10px', flexWrap: 'nowrap', mt: '4px' }}>
              {index === 0 &&
                <Typography color='#7956A5' fontFamily='Inter' fontSize='11px' fontWeight={600} sx={{ p: '8px' }}>
                  {t('NODES')}
                </Typography>}
              <Stack alignItems='center' columnGap='10px' direction='row'>
                <PRadio
                  checked={maybeNewEndpoint === value}
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
          ))}

        </Grid>
        <DecisionButtons
          cancelButton
          direction='vertical'
          disabled={!maybeNewEndpoint || (endpoint === maybeNewEndpoint && !isAutoMode)}
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
