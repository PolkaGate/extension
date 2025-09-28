// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-ignore
import type { SpStakingExposurePage } from '@polkadot/types/lookup';
import type { ValidatorInformation } from '../../../../hooks/useValidatorsInformation';

import { Container, IconButton, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { ArrowRight2, BuyCrypto, ChartSquare, type Icon, PercentageSquare, Profile2User } from 'iconsax-react';
import React, { memo, useCallback, useMemo } from 'react';

import { noop } from '@polkadot/util';

import { DisplayBalance, GlowCheckbox, MySkeleton } from '../../../../components';
import { useChainInfo, useTranslation, useValidatorApy } from '../../../../hooks';
import { type StakingInfoStackProps, ValidatorIdentity } from '../../../../popup/staking/partial/NominatorsTable';
import { ValidatorIdSocials } from '../../../../popup/staking/partial/ValidatorDetail';
import { toBN } from '../../../../util';
import ValidatorInformationFS from '../../partials/ValidatorInformationFS';

interface InfoProps extends StakingInfoStackProps {
  StartIcon?: Icon;
  width?: string;
  style?: SxProps<Theme>;
}

const InfoWithIcons = memo(function InfoWithIcons ({ StartIcon, amount, decimal, style, text, title, token, width = '80px' }: InfoProps) {
  const theme = useTheme();

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '4px', m: 0, width, ...style }}>
      {
        StartIcon &&
        <StartIcon color='#AA83DC' size='20' style={{ minWidth: '20px' }} variant='Bulk' />
      }
      <Typography color='#AA83DC' textAlign='left' variant='B-4'>
        {title}:
      </Typography>
      {amount &&
        <DisplayBalance
          balance={amount}
          decimal={decimal}
          decimalPoint={2}
          style={{ color: theme.palette.text.primary, fontFamily: 'Inter', fontSize: '12px', fontWeight: 500 }}
          token={token}
        />}
      {text &&
        <Typography color='text.primary' textAlign='left' variant='B-4' width='fit-content'>
          {text}
        </Typography>
      }
      {amount === undefined && text === undefined && '---'}
    </Container>
  );
});

interface ValidatorInfoProp {
  bgcolor?: string | undefined;
  genesisHash: string | undefined;
  isAlreadySelected?: boolean;
  isActive?: boolean | undefined;
  isSelected?: boolean;
  myShare?: number | undefined;
  onSelect?: () => void;
  reachedMaximum?: boolean;
  validatorInfo: ValidatorInformation;
  style?: React.CSSProperties;
}

const ValidatorInfo = memo(function ValidatorInfo ({ bgcolor, genesisHash, isActive, isAlreadySelected, isSelected, myShare, onSelect, reachedMaximum, style = {}, validatorInfo }: ValidatorInfoProp) {
  const { t } = useTranslation();
  const { api, decimal, token } = useChainInfo(genesisHash);

  const totalStaked = toBN((validatorInfo.exposurePaged as unknown as SpStakingExposurePage)?.pageTotal ?? 0);
  const validatorAPY = useValidatorApy(api, String(validatorInfo?.accountId), !!totalStaked?.gtn(0));

  const [open, setOpen] = React.useState<boolean>(false);

  const openValidatorDetail = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    setOpen(true);
  }, []);
  const closeDetail = useCallback(() => setOpen(false), []);

  const commission = useMemo(() => Number(validatorInfo.validatorPrefs.commission) / (10 ** 7) < 1 ? 0 : Number(validatorInfo.validatorPrefs.commission) / (10 ** 7), [validatorInfo.validatorPrefs.commission]);
  const notElected = isActive === undefined && !onSelect;

  return (
    <>
      <Container
        disableGutters
        onClick={onSelect}
        sx={{ alignItems: 'center', bgcolor: bgcolor ?? (isSelected ? '#FF4FB926' : isAlreadySelected ? '#AA83DC1A' : '#05091C'), borderRadius: '14px', columnGap: '5px', cursor: onSelect ? 'pointer' : 'default', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', minHeight: '48px', p: '4px', pl: '10px', ...style }}
      >
        {onSelect &&
          <GlowCheckbox
            changeState={noop}
            checked={isSelected}
            disabled={reachedMaximum}
            style={{ m: 0, mr: '10px', width: 'fit-content' }}
          />
        }
        {isActive !== undefined &&
          <Typography sx={{ bgcolor: isActive ? '#82FFA526' : '#8E8E8E26', borderRadius: '6px', color: isActive ? '#82FFA5' : '#8E8E8E', lineHeight: '16px', minWidth: '54px', mr: '8px', px: '8px' }} variant='B-5'>
            {isActive ? t('Active') : t('Inactive')}
          </Typography>
        }
        <ValidatorIdentity
          style={{ m: 0, ml: notElected ? '15px' : 0, width: myShare ? '185px' : notElected ? '352px' : '305px' }}
          validatorInfo={validatorInfo}
        />
        {
          !!myShare &&
          <InfoWithIcons
            text={`${myShare}%`}
            title={t('My Share')}
            width='110px'
          />
        }
        <InfoWithIcons
          StartIcon={BuyCrypto}
          amount={totalStaked}
          decimal={decimal}
          title={t('Staked')}
          token={token}
          width='180px'
        />
        <InfoWithIcons
          StartIcon={PercentageSquare}
          text={isNaN(commission) ? '---' : String(commission) + '%'}
          title={t('Comm.')}
          width='105px'
        />
        <InfoWithIcons
          StartIcon={Profile2User}
          // @ts-ignore
          text={validatorInfo.exposureMeta?.nominatorCount}
          title={t('Nominators')}
          width='132px'
        />
        <InfoWithIcons
          StartIcon={ChartSquare}
          text={validatorAPY != null ? `${validatorAPY}%` : '---'}
          title={t('APY')}
          width='100px'
        />
        <ValidatorIdSocials
          style={{ justifyContent: 'center', width: '125px' }}
          validatorDetail={validatorInfo}
        />
        <IconButton onClick={openValidatorDetail} sx={{ bgcolor: bgcolor ? '#1B133C' : '#2D1E4A', borderRadius: '8px', height: '40px', width: '36px' }}>
          <ArrowRight2 color='#AA83DC' size='14' variant='Bold' />
        </IconButton>
      </Container>
      {open &&
        <ValidatorInformationFS
          genesisHash={genesisHash}
          onClose={closeDetail}
          onSelect={onSelect}
          validator={validatorInfo}
        />}
    </>
  );
});

const UndefinedItem = ({ mb = '0px', noSocials = false }: { noSocials?: boolean; mb?: string; }) => (
  <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#05091C', borderRadius: '14px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', mb, minHeight: '48px', p: '10px' }}>
    <MySkeleton height={20} style={{ borderRadius: '20px', width: '300px' }} />
    <MySkeleton height={20} style={{ borderRadius: '20px', width: '130px' }} />
    <MySkeleton height={20} style={{ borderRadius: '20px', width: '130px' }} />
    <MySkeleton height={20} style={{ borderRadius: '20px', width: '130px' }} />
    <MySkeleton height={20} style={{ borderRadius: '20px', width: '130px' }} />
    {!noSocials && <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '4px', justifyContent: 'space-between', m: 0, width: 'fit-content' }}>
      {Array.from({ length: 4 }).map((_, index) =>
        <MySkeleton height={24} key={index} style={{ width: '24px' }} variant='rounded' />
      )}
    </Container>}
  </Container>
);

export { InfoWithIcons, UndefinedItem, ValidatorInfo };
