// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid, Stack, Typography } from '@mui/material';
import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { BackWithLabel, ChainLogo } from '../../../components';
import MySwitch from '../../../components/MySwitch';
import Radio from '../../../components/Radio';
import useEndpointsSetting from '../../../fullscreen/settings/partials/useEndpointsSetting';
import { useMetadata, useTranslation } from '../../../hooks';
import { UserDashboardHeader } from '../../../partials';
import HomeMenu from '../../../partials/HomeMenu';
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

function Endpoints (): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { genesisHash } = useParams<{ genesisHash: string }>();

  const { filteredEndpoints,
    isOnAuto,
    maybeNewEndpoint,
    onChangeEndpoint,
    onToggleAuto } = useEndpointsSetting(genesisHash, true);

  const onBack = useCallback(() => navigate('/settings-extension/chains') as void, [navigate]);

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
            <Grid alignItems='center' container item justifyContent='flex-start' py='5px' sx={{ bgcolor: '#05091C', borderRadius: '14px', height: '60px', mt: '4px', px: '10px' }}>
              <MySwitch
                checked={isOnAuto}
                columnGap='8px'
                label={t('Auto Node Selection')}
                onChange={onToggleAuto}
                value={AUTO_MODE.value}
              />
              <Grid item sx={{ mt: '-5px' }}>
                <Typography color='#674394' variant='B-5'>
                  {t('Automatically select the highest-performing remote node.')}
                </Typography>
              </Grid>
            </Grid>
            {filteredEndpoints?.map(({ delay, name, value }, index) => (
              <Grid alignItems='start' container direction='column' item key={value} py='5px' sx={{ bgcolor: '#05091C', borderRadius: '14px', flexWrap: 'nowrap', height: index === 0 ? '100px' : '73px', mt: '4px', px: '10px' }}>
                {index === 0 &&
                  <Typography color='#7956A5' fontFamily='Inter' fontSize='11px' fontWeight={600} sx={{ p: '8px' }}>
                    {t('NODES')}
                  </Typography>}
                <Stack alignItems='center' columnGap='10px' direction='row'>
                  <Radio
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
        </Grid>
      </Grid>
      <HomeMenu />
    </Container>
  );
}

export default React.memo(Endpoints);
