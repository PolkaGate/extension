// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SoloStakingInfo } from '../../../hooks/useSoloStakingInfo';
import type { ValidatorInformation } from '../../../hooks/useValidatorsInformation';

import { Container, Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { ArrowCircleLeft, Setting2, Trash, Triangle } from 'iconsax-react';
import React, { useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { noop } from '@polkadot/util';

import { useIsHovered, useTranslation } from '../../../hooks';
import { GradientDivider } from '../../../style';

interface SettingButtonProps {
  text?: string;
  Icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

const SettingButton = ({ Icon, disabled = false, onClick, text }: SettingButtonProps) => {
  const onClickHandle = useCallback(() => {
    if (disabled) {
      return;
    }

    onClick();
  }, [disabled, onClick]);

  return (
    <Grid container item justifyContent='center' onClick={onClickHandle} sx={{ alignItems: 'center', bgcolor: '#809ACB26', borderRadius: '12px', columnGap: '4px', cursor: disabled ? 'default' : 'pointer', p: '3px 6px', width: 'fit-content' }}>
      {Icon}
      {text && <Typography color='text.highlight' variant='B-2' width='max-content'>
        {text}
      </Typography>}
    </Grid>
  );
};

interface Props {
  soloStakingInfo: SoloStakingInfo | undefined;
  nominatedValidatorsInformation: ValidatorInformation[] | undefined;
  style?: SxProps<Theme>;
  onChill: () => void;
}

function NominationSettingButtons ({ nominatedValidatorsInformation, onChill, soloStakingInfo, style }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const hasActiveValidators = useMemo(() => {
    if (!nominatedValidatorsInformation || !soloStakingInfo) {
      return undefined;
    }

    return nominatedValidatorsInformation.some((nominatedValidator) =>
      // @ts-ignore
      nominatedValidator?.exposureMeta?.others?.find(({ who }: { who: string }) => who?.toString() === soloStakingInfo.stakingAccount?.accountId?.toString()));
  }, [nominatedValidatorsInformation, soloStakingInfo]);

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '4px', m: 0, width: 'fit-content', ...style }}>
      <SettingButton
        Icon={<Triangle color={theme.palette.text.highlight} size='18' variant='Bulk' />}
        disabled={false}
        onClick={noop}
        text={t('Change')}
      />
      <SettingButton
        Icon={<Setting2 color={theme.palette.text.highlight} size='18' variant='Bulk' />}
        disabled={!hasActiveValidators}
        onClick={noop}
        text={t('Tune Up')}
      />
      <GradientDivider orientation='vertical' style={{ height: '26px' }} />
      <SettingButton
        Icon={<Trash color={theme.palette.text.highlight} size='20' variant='Bulk' />}
        disabled={!nominatedValidatorsInformation || nominatedValidatorsInformation.length === 0}
        onClick={onChill}
      />
    </Container>
  );
}

export default function BackButton ({ nominatedValidatorsInformation, onChill, soloStakingInfo, style }: Props) {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const hovered = useIsHovered(containerRef);
  const navigate = useNavigate();
  const { genesisHash } = useParams<{ genesisHash: string }>();

  const onBack = useCallback(() => navigate('/solo/' + genesisHash) as void, [genesisHash, navigate]);

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', px: '15px', width: '100%', ...style }}>
      <Container disableGutters onClick={onBack} ref={containerRef} sx={{ alignItems: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'row', gap: '6px', ml: 0, width: 'max-content' }}>
        <ArrowCircleLeft color='#809ACB' size='24' variant={hovered ? 'Bold' : 'Bulk'} />
        <Typography sx={{ fontFamily: 'OdibeeSans', fontSize: '24px', fontWeight: '400', lineHeight: '26px', textTransform: 'uppercase' }}>
          {t('Validators')}
        </Typography>
      </Container>
      <NominationSettingButtons
        nominatedValidatorsInformation={nominatedValidatorsInformation}
        onChill={onChill}
        soloStakingInfo={soloStakingInfo}
      />
    </Container>
  );
}
