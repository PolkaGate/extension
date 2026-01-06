// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, Typography } from '@mui/material';
import React, { useCallback, useMemo, useRef } from 'react';

import { ChainLogo, DecisionButtons, FadeOnScroll } from '@polkadot/extension-polkagate/src/components/index';

import MySwitch from '../../../components/MySwitch';
import Radio from '../../../components/Radio';
import { useChainInfo, useEndpoint, useTranslation } from '../../../hooks';
import DotIndicator from '../../../popup/settings/extensionSettings/components/DotIndicator';
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
interface EndpointRowProps {
  isFirst: boolean;
  isLast: boolean;
  checked: boolean;
  name: string;
  value: string;
  delay: number | null | undefined;
  onChangeEndpoint: (event: React.ChangeEvent<HTMLInputElement>) => void
}

function EndpointRow({ checked, delay, isFirst, isLast, name, onChangeEndpoint, value }: EndpointRowProps): React.ReactElement {
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

function Endpoints({ genesisHash, isEnabled, onClose, onEnableChain, open }: Props): React.ReactElement {
  const { t } = useTranslation();
  const refContainer = useRef(null);

  const isFetching = useRef<Record<string, boolean>>({});
  const { displayName } = useChainInfo(genesisHash);
  const { endpoint, isAuto } = useEndpoint(genesisHash);

  const { dispatch,
    filteredEndpoints,
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
