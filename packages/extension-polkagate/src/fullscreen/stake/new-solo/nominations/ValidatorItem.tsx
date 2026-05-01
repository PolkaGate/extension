// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-ignore
import type { SpStakingExposurePage } from '@polkadot/types/lookup';
import type { ValidatorInformation } from '../../../../hooks/useValidatorsInformation';

import { Container, IconButton, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { ArrowRight2, BuyCrypto, ChartSquare, Danger, type Icon, PercentageSquare, Profile2User } from 'iconsax-react';
import React, { memo, useCallback, useMemo } from 'react';

import { noop } from '@polkadot/util';

import { DisplayBalance, GlowCheckbox, MySkeleton } from '../../../../components';
import { useChainInfo, useTranslation, useValidatorApy } from '../../../../hooks';
import { type StakingInfoStackProps, ValidatorIdentity } from '../../../../popup/staking/partial/NominatorsTable';
import { ValidatorIdSocials } from '../../../../popup/staking/partial/ValidatorDetail';
import { toBN } from '../../../../util';
import { HIGH_COMMISSION_THRESHOLD, HIGH_COMMISSION_WARNING_COLOR } from '../../../../util/constants';
import ValidatorInformationFS from '../../partials/ValidatorInformationFS';

interface InfoProps extends StakingInfoStackProps {
  StartIcon?: Icon;
  startIconColor?: string;
  textColor?: string;
  titleColor?: string;
  width?: string;
  style?: SxProps<Theme>;
}

const InfoWithIcons = memo(function InfoWithIcons({ StartIcon, amount, decimal, startIconColor, style, text, textColor, title, titleColor, token, width = '80px' }: InfoProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const accentColor = isDark ? '#AA83DC' : '#6F5A96';

  return (
    <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '4px', m: 0, width, ...style }}>
      {
        StartIcon &&
        <StartIcon color={startIconColor ?? accentColor} size='20' style={{ minWidth: '20px' }} variant='Bulk' />
      }
      <Typography color={titleColor ?? accentColor} textAlign='left' variant='B-4'>
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
        <Typography color={textColor ?? 'text.primary'} textAlign='left' variant='B-4' width='fit-content'>
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

const ValidatorInfo = memo(function ValidatorInfo({ bgcolor, genesisHash, isActive, isAlreadySelected, isSelected, myShare, onSelect, reachedMaximum, style = {}, validatorInfo }: ValidatorInfoProp) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
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
  const isHighCommission = commission > HIGH_COMMISSION_THRESHOLD;
  const notElected = isActive === undefined && !onSelect;
  const baseBgcolor = bgcolor ?? (isSelected ? '#FF4FB926' : isAlreadySelected ? (isDark ? '#AA83DC1A' : '#EEF1FF') : isDark ? '#05091C' : '#FFFFFF');
  const activeBadgeBg = isDark ? '#82FFA526' : '#E8F8EE';
  const activeBadgeColor = isDark ? '#82FFA5' : '#43A867';
  const inactiveBadgeBg = isDark ? '#8E8E8E26' : '#F1F3F9';
  const inactiveBadgeColor = isDark ? '#8E8E8E' : '#98A0B8';
  const warningColor = HIGH_COMMISSION_WARNING_COLOR;

  return (
    <>
      <Container
        disableGutters
        onClick={onSelect}
        sx={{
          alignItems: 'center',
          bgcolor: baseBgcolor,
          border: isDark ? 'none' : '1px solid #DDE3F4',
          borderRadius: '14px',
          boxShadow: isDark ? 'none' : '0 8px 18px rgba(133, 140, 176, 0.10)',
          columnGap: '5px',
          cursor: onSelect ? 'pointer' : 'default',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          minHeight: '48px',
          p: '4px',
          pl: '10px',
          ...style
        }}
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
          <Typography
            sx={{
              bgcolor: isActive ? activeBadgeBg : inactiveBadgeBg,
              borderRadius: '6px',
              color: isActive ? activeBadgeColor : inactiveBadgeColor,
              lineHeight: '16px',
              minWidth: '54px',
              mr: '8px',
              px: '8px'
            }}
            variant='B-5'
          >
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
            title={t('Share')}
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
          StartIcon={isHighCommission ? Danger : PercentageSquare}
          startIconColor={isHighCommission ? warningColor : undefined}
          style={isHighCommission
            ? {
              bgcolor: `${warningColor}1A`,
              borderRadius: '999px',
              boxShadow: `inset 0 0 12px 2px ${warningColor}33, 0 0 10px 0 ${warningColor}22`,
              justifyContent: 'center',
              px: '8px',
              py: '2px'
            }
            : undefined}
          text={isNaN(commission) ? '---' : String(commission) + '%'}
          textColor={isHighCommission ? warningColor : undefined}
          title={t('Comm.')}
          titleColor={isHighCommission ? warningColor : undefined}
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
        <IconButton onClick={openValidatorDetail} sx={{ bgcolor: isDark ? (bgcolor ? '#1B133C' : '#2D1E4A') : '#EEF1FF', border: isDark ? 'none' : '1px solid #DDE3F4', borderRadius: '8px', height: '40px', width: '36px' }}>
          <ArrowRight2 color={isDark ? '#AA83DC' : '#6F5A96'} size='14' variant='Bold' />
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

const UndefinedItem = ({ mb = '0px', noSocials = false }: { noSocials?: boolean; mb?: string; }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Container disableGutters sx={{ alignItems: 'center', bgcolor: isDark ? '#05091C' : '#FFFFFF', border: isDark ? 'none' : '1px solid #DDE3F4', borderRadius: '14px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', mb, minHeight: '48px', p: '10px' }}>
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
};

export { InfoWithIcons, UndefinedItem, ValidatorInfo };
