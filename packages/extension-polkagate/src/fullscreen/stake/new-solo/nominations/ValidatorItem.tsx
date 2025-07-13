// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ValidatorInformation } from '../../../../hooks/useValidatorsInformation';

import { Container, Skeleton, Typography, useTheme } from '@mui/material';
import { BuyCrypto, ChartSquare, type Icon, PercentageSquare, Profile2User } from 'iconsax-react';
import React from 'react';

import { FormatBalance2, GlowCheckbox } from '../../../../components';
import { useChainInfo, useTranslation, useValidatorApy } from '../../../../hooks';
import { type StakingInfoStackProps, ValidatorIdentity } from '../../../../popup/staking/partial/NominatorsTable';
import { ValidatorIdSocials } from '../../../../popup/staking/partial/ValidatorDetail';
import { isHexToBn } from '../../../../util/utils';

interface InfoProps extends StakingInfoStackProps {
  StartIcon: Icon;
}

const Info = ({ StartIcon, amount, decimal, text, title, token }: InfoProps) => {
  const theme = useTheme();

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '4px', width: '140px' }}>
      <StartIcon color='#AA83DC' size='20' variant='Bulk' />
      <Typography color='#AA83DC' textAlign='left' variant='B-4'>
        {title}:
      </Typography>
      {amount &&
        <FormatBalance2
          decimalPoint={2}
          decimals={[decimal ?? 0]}
          style={{
            color: theme.palette.text.primary,
            fontFamily: 'Inter',
            fontSize: '12px',
            fontWeight: 500,
            width: 'max-content'
          }}
          tokens={[token ?? '']}
          value={amount}
        />}
      {text &&
        <Typography color='text.primary' textAlign='left' variant='B-4' width='fit-content'>
          {text}
        </Typography>
      }
    </Container>
  );
};

interface ValidatorInfoProp {
  validatorInfo: ValidatorInformation;
  genesisHash: string | undefined;
  onDetailClick: () => void;
  isAlreadySelected?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

const ValidatorInfo = ({ genesisHash, isAlreadySelected, isSelected, onSelect, validatorInfo }: ValidatorInfoProp) => {
  const { t } = useTranslation();
  const { api, decimal, token } = useChainInfo(genesisHash);
  const validatorAPY = useValidatorApy(api, String(validatorInfo?.accountId), !!(isHexToBn(validatorInfo?.stakingLedger.total as unknown as string))?.gtn(0));

  return (
    <Container
      disableGutters
      onClick={onSelect}
      sx={{
        alignItems: 'center',
        bgcolor: isSelected
          ? '#AA83DC1A'
          : isAlreadySelected
            ? '#FF4FB926'
            : '#05091C',
        borderRadius: '14px',
        cursor: onSelect ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        p: '10px'
      }}
    >
      {onSelect &&
        <GlowCheckbox
          changeState={onSelect}
          checked={isSelected}
          style={{ mr: '10px', width: 'fit-content' }}
        />
      }
      <ValidatorIdentity style={{ m: 0, width: '300px' }} validatorInfo={validatorInfo} />
      <Info StartIcon={BuyCrypto} amount={validatorInfo.stakingLedger.total} decimal={decimal} title={t('Staked')} token={token} />
      <Info StartIcon={PercentageSquare} text={String(Number(validatorInfo.validatorPrefs.commission) / (10 ** 7) < 1 ? 0 : Number(validatorInfo.validatorPrefs.commission) / (10 ** 7)) + '%'} title={t('Commission')} />
      {/* @ts-ignore */}
      <Info StartIcon={Profile2User} text={validatorInfo.exposureMeta?.nominatorCount ?? 0} title={t('Nominators')} />
      <Info StartIcon={ChartSquare} text={validatorAPY ?? '--'} title={t('APY')} />
      {/* <IconButton onClick={onDetailClick} sx={{ m: 0, p: '4px' }}>
          <ArrowForwardIosIcon sx={{ color: 'text.primary', fontSize: '20px' }} /> // it is available in the design onFigma but has no functionality
        </IconButton> */}
      <ValidatorIdSocials
        style={{ width: '130px' }}
        validatorDetail={validatorInfo}
      />
    </Container>
  );
};

const UndefinedItem = () => (
  <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#05091C', borderRadius: '14px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', p: '10px' }}>
    <Skeleton animation='wave' height={20} sx={{ borderRadius: '20px', display: 'inline-block', fontWeight: 'bold', transform: 'none', width: '300px' }} />
    <Skeleton animation='wave' height={20} sx={{ borderRadius: '20px', display: 'inline-block', fontWeight: 'bold', transform: 'none', width: '130px' }} />
    <Skeleton animation='wave' height={20} sx={{ borderRadius: '20px', display: 'inline-block', fontWeight: 'bold', transform: 'none', width: '130px' }} />
    <Skeleton animation='wave' height={20} sx={{ borderRadius: '20px', display: 'inline-block', fontWeight: 'bold', transform: 'none', width: '130px' }} />
    <Skeleton animation='wave' height={20} sx={{ borderRadius: '20px', display: 'inline-block', fontWeight: 'bold', transform: 'none', width: '130px' }} />
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '4px', justifyContent: 'space-between', m: 0, width: 'fit-content' }}>
      {Array.from({ length: 4 }).map((_, index) =>
        <Skeleton animation='wave' height={24} key={index} sx={{ borderRadius: '999px', display: 'inline-block', fontWeight: 'bold', transform: 'none', width: '24px' }} />
      )}
    </Container>
  </Container>
);

const MemoizedValidatorInfo = React.memo(ValidatorInfo);
const MemoizedUndefinedItem = React.memo(UndefinedItem);

export { MemoizedUndefinedItem as UndefinedItem, MemoizedValidatorInfo as ValidatorInfo };
