// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid, Typography } from '@mui/material';
import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { BackWithLabel, ChainLogo } from '../../../components';
import MySwitch from '../../../components/MySwitch';
import useEndpointsSetting from '../../../fullscreen/settings/partials/useEndpointsSetting';
import { useMetadata, useTranslation } from '../../../hooks';
import { UserDashboardHeader } from '../../../partials';
import HomeMenu from '../../../partials/HomeMenu';
import { AUTO_MODE } from '../../../util/constants';
import EndpointRow from './EndpointRow';

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

function Endpoints(): React.ReactElement {
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
        </Grid>
      </Grid>
      <HomeMenu />
    </Container>
  );
}

export default React.memo(Endpoints);
