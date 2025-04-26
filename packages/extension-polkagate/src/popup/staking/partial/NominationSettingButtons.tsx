// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SoloStakingInfo } from '../../../hooks/useSoloStakingInfo';
import type { ValidatorInformation } from '../../../hooks/useValidatorsInformation';

import { Container, Grid, type SxProps, type Theme,Typography, useTheme } from '@mui/material';
import { Setting2, Trash, Triangle } from 'iconsax-react';
import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';

import { useTranslation } from '../../../hooks';
import { GradientDivider } from '../../../style';

interface SettingButtonProps {
  text?: string;
  Icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

const SettingButton = ({ Icon, disabled = false, onClick, text }: SettingButtonProps): React.ReactElement => {
  const onClickHandle = useCallback(() => {
    if (disabled) {
      return;
    }

    onClick();
  }, [disabled, onClick]);

  return (
    <Grid container item justifyContent='center' onClick={onClickHandle} sx={{ alignItems: 'center', bgcolor: '#809ACB26', borderRadius: '12px', columnGap: '4px', cursor: 'pointer', p: '3px 6px', width: 'fit-content' }}>
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
}

export default function NominationSettingButtons ({ nominatedValidatorsInformation, soloStakingInfo, style }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();

  const hasActiveValidators = useMemo(() => {
    if (!nominatedValidatorsInformation || !soloStakingInfo) {
      return undefined;
    }

    return nominatedValidatorsInformation.some((nominatedValidator) =>
      nominatedValidator?.exposureMeta?.others?.find(({ who }: { who: string }) => who?.toString() === soloStakingInfo.stakingAccount?.accountId?.toString()));
  }, [nominatedValidatorsInformation, soloStakingInfo]);

  const handleClick = useCallback((path: string) => () => navigate(path) as void, [navigate]);

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', ...style }}>
      <Typography color='text.primary' variant='B-2'>
        {t('Manage')}:
      </Typography>
      <Container disableGutters sx={{ display: 'flex', flexDirection: 'row', m: 0, gap: '4px', width: 'fit-content' }}>
        <SettingButton
          Icon={<Triangle color={theme.palette.text.highlight} size='18' variant='Bulk' />}
          disabled={false}
          onClick={handleClick('')}
          text={t('Change')}
        />
        <SettingButton
          Icon={<Setting2 color={theme.palette.text.highlight} size='18' variant='Bulk' />}
          disabled={!hasActiveValidators}
          onClick={handleClick('')}
          text={t('Tune Up')}
        />
        <GradientDivider orientation='vertical' style={{ height: '26px' }} />
        <SettingButton
          Icon={<Trash color={theme.palette.text.highlight} size='20' variant='Bulk' />}
          disabled={nominatedValidatorsInformation && nominatedValidatorsInformation.length === 0}
          onClick={handleClick('')}
        />
      </Container>
    </Container>
  );
}
