// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ValidatorInformation } from '../../../../hooks/useValidatorsInformation';

import { Container, IconButton, Stack } from '@mui/material';
import { ArrowRight2, BuyCrypto, PercentageSquare, Profile2User } from 'iconsax-react';
import React, { memo, useCallback, useRef } from 'react';

import { noop } from '@polkadot/util';

import { GlowCheckbox } from '../../../../components';
import { useChainInfo, useTranslation } from '../../../../hooks';
import { ValidatorIdentity } from '../../../../popup/staking/partial/NominatorsTable';
import { GradientDivider } from '../../../../style';
import { InfoWithIcons } from '../../new-solo/nominations/ValidatorItem';

interface PoolInfoProp {
  validatorInfo: ValidatorInformation;
  genesisHash: string | undefined;
  onDetailClick: () => void;
  selectable?: boolean;
  isSelected?: boolean;
  onSelect?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  style?: React.CSSProperties;
}

function ValidatorItem({ genesisHash, isSelected, onDetailClick, onSelect, selectable, style, validatorInfo }: PoolInfoProp) {
  const { t } = useTranslation();
  const { decimal, token } = useChainInfo(genesisHash, true);
  const containerRef = useRef(null);

  const commission = String(Number(validatorInfo.validatorPrefs.commission) / (10 ** 7) < 1 ? 0 : Number(validatorInfo.validatorPrefs.commission) / (10 ** 7)) + '%';

  const handleOnDetail = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    onDetailClick();
  }, [onDetailClick]);

  const handleContainerClick = useCallback(() => {
    const syntheticEvent = {
      target: {
        value: validatorInfo.accountId.toString()
      }
    } as React.ChangeEvent<HTMLInputElement>;

    onSelect?.(syntheticEvent);
  }, [onSelect, validatorInfo]);

  return (
    <Stack direction='column' sx={{ bgcolor: isSelected ? '#FF4FB926' : '#05091C', borderRadius: '14px', p: '8px 4px 8px 8px', transition: 'all 150ms ease-out', width: '100%', ...style }}>
      <Container
        disableGutters
        onClick={selectable ? handleContainerClick : noop}
        ref={containerRef}
        sx={{ alignItems: 'center', cursor: selectable ? 'pointer' : 'default', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}
      >
        {selectable &&
          <GlowCheckbox
            changeState={noop}
            checked={isSelected}
            style={{ height: '18px', mr: '6px', width: '18px' }}
          />}
        <ValidatorIdentity validatorInfo={validatorInfo} />
        <IconButton onClick={handleOnDetail} sx={{ bgcolor: '#2D1E4A', borderRadius: '6px', height: '34px', width: '34px' }}>
          <ArrowRight2 color='#AA83DC' size='16' variant='Bold' />
        </IconButton>
      </Container>
      <GradientDivider />
      <Container disableGutters sx={{ alignItems: 'center', columnGap: '8px', display: 'flex', flexDirection: 'row', py: '5.5px' }}>
        <InfoWithIcons
          StartIcon={BuyCrypto}
          amount={validatorInfo.stakingLedger.total}
          decimal={decimal}
          style={{ gap: '2px', maxWidth: '150px', width: 'fit-content' }}
          title={t('Staked')}
          token={token}
        />
        <InfoWithIcons
          StartIcon={PercentageSquare}
          style={{ gap: '2px', maxWidth: '120px', width: 'fit-content' }}
          text={String(commission) + '%'}
          title={t('Comm.')}
        />
        {/* @ts-ignore */}
        <InfoWithIcons StartIcon={Profile2User} style={{ gap: '2px', maxWidth: '115px', width: 'fit-content' }} text={validatorInfo.exposureMeta?.nominatorCount ?? 0} title={t('Nominators')} />
      </Container>
    </Stack>
  );
}

export default memo(ValidatorItem);
