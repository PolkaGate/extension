// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { BackWithLabel, Logo } from '../../../components';
import MySwitch from '../../../components/MySwitch';
import useEndpointsSetting from '../../../fullscreen/settings/partials/useEndpointsSetting';
import { useMetadata, useTranslation } from '../../../hooks';
import { UserDashboardHeader } from '../../../partials';
import HomeMenu from '../../../partials/HomeMenu';
import { AUTO_MODE } from '../../../util/constants';
import CustomEndpoint from './CustomEndpoint';
import EndpointRow from './EndpointRow';

const BackButton = ({ genesisHash }: { genesisHash: string | undefined; }) => {
  const chain = useMetadata(genesisHash, true);
  const chainName = chain?.name;

  return (
    <Grid alignItems='center' container item sx={{ columnGap: '6px', width: 'fit-content' }}>
      <Logo genesisHash={genesisHash} size={24} />
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
  const theme = useTheme();
  const refContainer = useRef<HTMLDivElement>(null);
  const isDark = theme.palette.mode === 'dark';
  const panelBorderColor = isDark ? '#1B133C' : '#DDE3F4';
  const panelBg = isDark ? '#1B133C' : 'rgba(248, 249, 255, 0.82)';
  const autoNodeBg = isDark ? '#05091C' : 'rgba(255, 255, 255, 0.72)';
  const autoNodeDescriptionColor = isDark ? '#674394' : '#7B84AC';

  const { filteredEndpoints,
    isEndpointSelectionDisabled,
    isOnAuto,
    maybeNewEndpoint,
    onChangeEndpoint,
    onSelectAuto,
    onSelectEndpoint,
    onToggleAuto } = useEndpointsSetting(genesisHash, true);

  const onBack = useCallback(() => navigate('/settings-extension/chains') as void, [navigate]);
  const endpointValues = useMemo(() => filteredEndpoints?.map(({ value }) => value) ?? [], [filteredEndpoints]);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => {
      const container = refContainer.current;

      container?.scrollTo({ behavior: 'smooth', top: container.scrollHeight });
    }, 100);
  }, []);

  return (
    <Container disableGutters sx={{ position: 'relative' }}>
      <UserDashboardHeader homeType='default' />
      <BackWithLabel
        content={<BackButton genesisHash={genesisHash} />}
        onClick={onBack}
        style={{ pb: 0, pt: '2px' }}
      />
      <Grid container item sx={{ px: '15px' }}>
        <Grid container item sx={{ border: '4px solid', borderColor: panelBorderColor, borderRadius: '14px', boxShadow: isDark ? 'none' : '0 12px 26px rgba(106, 116, 156, 0.16)', my: '10px' }}>
          <Grid container height='420px' item ref={refContainer} sx={{ backdropFilter: isDark ? 'none' : 'blur(10px)', bgcolor: panelBg, borderRadius: '14px', boxSizing: 'border-box', display: 'block', overflowY: 'auto', pb: '8px' }}>
            <Grid alignItems='center' container item justifyContent='flex-start' py='5px' sx={{ bgcolor: autoNodeBg, border: '1px solid', borderColor: isDark ? 'transparent' : '#E3E8F7', borderRadius: '14px', boxShadow: isDark ? 'none' : '0 8px 18px rgba(106, 116, 156, 0.10)', height: '60px', mt: '4px', px: '10px' }}>
              <MySwitch
                checked={isOnAuto}
                columnGap='8px'
                label={t('Auto Node Selection')}
                onChange={onToggleAuto}
                value={AUTO_MODE.value}
              />
              <Grid item sx={{ mt: '-5px' }}>
                <Typography color={autoNodeDescriptionColor} variant='B-5'>
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
            <CustomEndpoint
              disabled={isEndpointSelectionDisabled}
              existingEndpoints={endpointValues}
              genesisHash={genesisHash}
              onScrollToEnd={scrollToEnd}
              onSelectAuto={onSelectAuto}
              onSelectEndpoint={onSelectEndpoint}
              selectedEndpoint={maybeNewEndpoint}
            />
          </Grid>
        </Grid>
      </Grid>
      <HomeMenu />
    </Container>
  );
}

export default React.memo(Endpoints);
