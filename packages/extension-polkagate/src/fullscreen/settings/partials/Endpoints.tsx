// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useRef } from 'react';

import { Logo, DecisionButtons, FadeOnScroll } from '@polkadot/extension-polkagate/src/components/index';
import EndpointRow from '@polkadot/extension-polkagate/src/popup/settings/extensionSettings/EndpointRow';

import MySwitch from '../../../components/MySwitch';
import { useChainInfo, useEndpoint, useTranslation } from '../../../hooks';
import { AUTO_MODE } from '../../../util/constants';
import { DraggableModal } from '../../components/DraggableModal';
import useEndpointsSetting from './useEndpointsSetting';

interface Props {
  genesisHash: string;
  isEnabled: boolean;
  open: boolean;
  onClose: () => void;
  onEnableChain: (value: string, checked: boolean) => void;
}

function Endpoints({ genesisHash, isEnabled, onClose, onEnableChain, open }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const refContainer = useRef(null);
  const isDark = theme.palette.mode === 'dark';
  const modalBodyBg = isDark ? '#1B133C' : '#F5F6FF';
  const fadeBackgroundColor = isDark ? modalBodyBg : 'transparent';
  const toggleBg = isDark ? '#05091C' : '#FFFFFF';
  const toggleBorderColor = isDark ? 'transparent' : '#DDE3F4';

  const isFetching = useRef<Record<string, boolean>>({});
  const { displayName } = useChainInfo(genesisHash);
  const { endpoint, isAuto } = useEndpoint(genesisHash, undefined, isEnabled);

  const { dispatch,
    filteredEndpoints,
    isEndpointSelectionDisabled,
    isOnAuto,
    mayBeEnabled,
    maybeNewEndpoint,
    onApply,
    onChangeEndpoint,
    onEnableNetwork,
    onToggleAuto } = useEndpointsSetting(genesisHash, isEnabled, onEnableChain, onClose);

  const isDisabled = useMemo(() => {
    const noEndpointChange = isOnAuto
      ? maybeNewEndpoint === undefined
      : maybeNewEndpoint === endpoint;
    const noEnableChange = mayBeEnabled === isEnabled;
    const noAutoChange = (isOnAuto ?? isAuto) === isAuto;

    if (!maybeNewEndpoint && isOnAuto === false) {
      return true;
    }

    return noEndpointChange && noEnableChange && noAutoChange;
  }, [endpoint, isEnabled, isOnAuto, isAuto, mayBeEnabled, maybeNewEndpoint]);

  const _onClose = useCallback(() => {
    dispatch({ type: 'RESET' });
    isFetching.current = {};
    onClose();
  }, [dispatch, onClose]);

  return (
    <DraggableModal
      TitleLogo={<Logo genesisHash={genesisHash} showSquare size={36} />}
      onClose={_onClose}
      open={open}
      showBackIconAsClose
      style={{ minHeight: '400px', padding: '20px' }}
      title={displayName}
    >
      <Stack direction='column'>
        <Stack direction='column' sx={{ position: 'relative', width: '100%' }}>
          <Grid container height='420px' item ref={refContainer} sx={{ bgcolor: modalBodyBg, border: '1px solid', borderColor: isDark ? 'transparent' : '#E3E8F7', borderRadius: '14px', display: 'block', overflowY: 'auto', position: 'relative' }}>
            <MySwitch
              checked={mayBeEnabled}
              columnGap='8px'
              label={t('Enable Network')}
              onChange={onEnableNetwork}
              style={{ alignItems: 'center', backgroundColor: toggleBg, border: `1px solid ${toggleBorderColor}`, borderRadius: '18px', height: '52px', justifyContent: 'flex-start', padding: '0 15px', width: '100%' }}
              value={mayBeEnabled}
            />
            <MySwitch
              checked={isOnAuto}
              columnGap='8px'
              disabled={isEndpointSelectionDisabled}
              label={t('Auto Node Selection')}
              onChange={onToggleAuto}
              style={{ alignItems: 'center', backgroundColor: toggleBg, border: `1px solid ${toggleBorderColor}`, borderRadius: '18px', height: '52px', justifyContent: 'flex-start', margin: '8px 0', padding: '0 15px', width: '100%' }}
              value={AUTO_MODE.value}
            />
            {filteredEndpoints?.map(({ delay, name, value }, index) => (
              <EndpointRow
                checked={maybeNewEndpoint === value}
                delay={delay}
                disabled={isEndpointSelectionDisabled}
                isFirst={index === 0}
                isLast={index === filteredEndpoints.length - 1}
                key={index}
                name={name}
                onChangeEndpoint={onChangeEndpoint}
                value={value}
              />
            ))}
          </Grid>
          <FadeOnScroll containerRef={refContainer} height='50px' ratio={0.3} style={{ backgroundColor: fadeBackgroundColor, borderRadius: '14px', justifySelf: 'center', width: '100%' }} />
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
