// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid, Stack, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router';

import EndpointManager2 from '../../../class/endpointManager2';
import { ActionContext, BackWithLabel, ChainLogo } from '../../../components';
import MySwitch from '../../../components/MySwitch';
import Radio from '../../../components/Radio';
import { useEndpoint2, useEndpoints, useMetadata, useTranslation } from '../../../hooks';
import { UserDashboardHeader } from '../../../partials';
import HomeMenu from '../../../partials/HomeMenu';
import CalculateNodeDelay from '../../../util/calculateNodeDelay';
import { AUTO_MODE } from '../../../util/constants';
import DotIndicator from './components/DotIndicator';

const BackButton = ({ genesisHash }: { genesisHash: string | undefined; }) => {
  const chain = useMetadata(genesisHash, true);
  const chainName = chain?.name;

  return (
    <Grid alignItems='center' container item sx={{ columnGap: '6px', width: 'fit-content' }}>
      <ChainLogo genesisHash={genesisHash} size={24} />
      <Typography color='text.primary' textTransform='uppercase' variant='H-3'>
        {chainName}
      </Typography>
    </Grid>
  );
};

const endpointManager = new EndpointManager2();

type EndpointsDelay = { name: string, delay: number | null | undefined, value: string }[];

function Endpoints (): React.ReactElement {
  const { t } = useTranslation();
  const { genesisHash } = useParams<{ genesisHash: string }>();
  const onAction = useContext(ActionContext);
  const isFetching = useRef<Record<string, boolean>>({});
  const { endpoint } = useEndpoint2(genesisHash);
  const endpointOptions = useEndpoints(genesisHash);

  const [endpointsDelay, setEndpointsDelay] = useState<EndpointsDelay>();

  const isAutoMode = endpoint === AUTO_MODE.value;

  const onChangeEndpoint = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    const newEndpoint = event.target.value;

    if (!newEndpoint || !genesisHash) {
      return;
    }

    const checkForNewOne = newEndpoint === AUTO_MODE.value && endpointManager.get(genesisHash)?.isAuto;

    endpointManager.set(genesisHash, {
      checkForNewOne,
      endpoint: newEndpoint,
      isAuto: newEndpoint === AUTO_MODE.value,
      timestamp: Date.now()
    });
  }, [genesisHash]);

  const onBack = useCallback(() => onAction('/settings-extension/chains'), [onAction]);

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
    endpoints?.forEach(({ value }) => {
      if (value && value !== AUTO_MODE.value && !isFetching.current?.[value]) {
        isFetching.current[value] = true;
        calculateAndSetDelay(value);
      }
    });
  }, [calculateAndSetDelay, endpoint, endpoints]);

  return (
    <Container disableGutters sx={{ position: 'relative' }}>
      <UserDashboardHeader homeType='default' />
      <BackWithLabel
        content={<BackButton genesisHash={genesisHash} />}
        onClick={onBack}
        style={{ pb: 0, pt: '2px' }}
      />
      <Grid container item sx={{ px: '15px' }}>
        <Grid container item sx={{ border: '4px solid #1b143c', borderRadius: '14px', my: '10px' }}>
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
                  <Radio
                    checked={endpoint === value}
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
        </Grid>
      </Grid>
      <HomeMenu />
    </Container>
  );
}

export default React.memo(Endpoints);
