// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Compact } from '@polkadot/types';
// @ts-ignore
import type { SpStakingExposurePage, SpStakingPagedExposureMetadata } from '@polkadot/types/lookup';
import type { INumber } from '@polkadot/types/types';
import type { BN } from '@polkadot/util';
import type { ValidatorInformation } from '../../../hooks/useValidatorsInformation';

import { Container, IconButton, Stack, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { ArrowRight2, Danger } from 'iconsax-react';
import React, { type CSSProperties, memo, useCallback, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';

import { DisplayBalance, GlowCheckbox } from '../../../components';
import ValidatorInformationFS from '../../../fullscreen/stake/partials/ValidatorInformationFS';
import { useChainInfo, useIsBlueish, useIsExtensionPopup, useTranslation } from '../../../hooks';
import { GradientDivider, PolkaGateIdenticon } from '../../../style';
import { toBN, toShortAddress } from '../../../util';
import { HIGH_COMMISSION_THRESHOLD, HIGH_COMMISSION_WARNING_COLOR } from '../../../util/constants';
import ValidatorDetail from './ValidatorDetail';

interface ValidatorIdentityProp {
  validatorInfo: ValidatorInformation;
  style?: SxProps<Theme>;
}

export const ValidatorIdentity = memo(function ValidatorIdentity({ style, validatorInfo }: ValidatorIdentityProp) {
  const isBlueish = useIsBlueish();

  return (
    <Container disableGutters sx={{ alignItems: 'center', columnGap: '4px', display: 'flex', flexDirection: 'row', justifyContent: 'start', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', ...style }}>
      <PolkaGateIdenticon
        address={validatorInfo.accountId.toString()}
        size={24}
      />
      {
        !validatorInfo.identity &&
        <Typography color='text.primary' variant='B-2'>
          {toShortAddress(validatorInfo.accountId)}
        </Typography>
      }
      {
        validatorInfo.identity &&
        <Typography color='text.primary' textAlign='start' variant='B-2'>
          {validatorInfo.identity.displayParent ?? validatorInfo.identity.display}
        </Typography>
      }
      {
        validatorInfo.identity?.displayParent &&
        <Typography color={isBlueish ? 'text.highlight' : 'primary.main'} sx={{ bgcolor: isBlueish ? '#809ACB26' : '#AA83DC26', borderRadius: '6px', minWidth: '22px', p: '4px' }} textAlign='center' variant='B-5'>
          {validatorInfo.identity.display}
        </Typography>
      }
    </Container>
  );
});

export interface StakingInfoStackProps {
  decimal?: number | undefined;
  token?: string | undefined;
  title: string;
  text?: string | undefined;
  amount?: string | BN | Compact<INumber> | null | undefined;
  secondaryColor?: string;
  adjustedColorForTitle?: string;
  valueNode?: React.ReactNode;
}

export const StakingInfoStack = memo(function SIS({ adjustedColorForTitle, amount, decimal, secondaryColor, text, title, token, valueNode }: StakingInfoStackProps) {
  const theme = useTheme();
  const isExtension = useIsExtensionPopup();

  return (
    <Stack direction='column' sx={{ width: 'fit-content' }}>
      {amount &&
        <DisplayBalance
          balance={amount}
          decimal={decimal}
          decimalPoint={2}
          style={{
            color: theme.palette.text.primary,
            ...theme.typography[isExtension ? 'B-2' : 'B-4'],
            width: 'max-content'
          }}
          token={token}
        />}
      {valueNode}
      {text &&
        <Typography color={secondaryColor ?? 'text.primary'} textAlign='left' variant='B-4' width='fit-content'>
          {text}
        </Typography>
      }
      <Typography color={adjustedColorForTitle ?? 'text.highlight'} textAlign='left' variant='B-4'>
        {title}
      </Typography>
    </Stack>
  );
});

const CommissionPill = memo(function CommissionPill({ color, text }: { color: string; text: string }) {
  return (
    <Typography
      sx={{
        bgcolor: `${color}1A`,
        borderRadius: '999px',
        boxShadow: `inset 0 0 12px 2px ${color}33, 0 0 10px 0 ${color}22`,
        color,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        lineHeight: '16px',
        px: '8px',
        py: '2px'
      }}
      textAlign='left'
      variant='B-4'
      width='fit-content'
    >
      <Danger color={color} size='12' variant='Bold' />
      {text}
    </Typography>
  );
});

interface ValidatorInfoProp {
  genesisHash: string;
  isBlueish?: boolean;
  isSelected?: boolean;
  onDetailClick: () => void;
  onSelect?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  validatorInfo: ValidatorInformation;
  style?: CSSProperties;
}

const ValidatorInfo = memo(function VI({ genesisHash, isBlueish, isSelected, onDetailClick, onSelect, style, validatorInfo }: ValidatorInfoProp) {
  const { t } = useTranslation();
  const { decimal, token } = useChainInfo(genesisHash, true);

  const totalStaked = useMemo(() => toBN((validatorInfo.exposurePaged as unknown as SpStakingExposurePage)?.pageTotal ?? 0), [(validatorInfo.exposurePaged as unknown as SpStakingExposurePage)?.pageTotal]);
  const commission = useMemo(() => Number(validatorInfo.validatorPrefs.commission) / (10 ** 7) < 1 ? 0 : Number(validatorInfo.validatorPrefs.commission) / (10 ** 7), [validatorInfo.validatorPrefs.commission]);
  const isHighCommission = commission > HIGH_COMMISSION_THRESHOLD;
  const baseBgcolor = isSelected ? '#BFA1FF26' : '#110F2A';
  const warningColor = HIGH_COMMISSION_WARNING_COLOR;

  const handleSelect = useCallback((_value: boolean) => {
    const syntheticEvent = {
      target: {
        value: validatorInfo.accountId.toString()
      }
    } as React.ChangeEvent<HTMLInputElement>;

    onSelect?.(syntheticEvent);
  }, [onSelect, validatorInfo.accountId]);

  return (
    <Stack
      direction='column'
      sx={{
        bgcolor: baseBgcolor,
        borderRadius: '14px',
        mb: '4px',
        p: '8px',
        width: '100%',
        ...style
      }}
    >
      <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', p: '4px' }}>
        <Stack columnGap='5px' direction='row'>
          {onSelect &&
            <GlowCheckbox
              changeState={handleSelect}
              checked={isSelected}
              isBlueish={isBlueish}
              style={{ m: 'auto', width: 'fit-content' }}
            />
          }
          <ValidatorIdentity validatorInfo={validatorInfo} />
        </Stack>
        <IconButton onClick={onDetailClick} sx={{ m: 0, py: '6px' }}>
          <ArrowRight2 color='#fff' size='20' />
        </IconButton>
      </Container>
      <GradientDivider style={{ my: '4px' }} />
      <Container disableGutters sx={{ alignItems: 'flex-end', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <StakingInfoStack
          amount={totalStaked}
          decimal={decimal}
          title={t('Staked')}
          token={token}
        />
        <StakingInfoStack
          adjustedColorForTitle={isHighCommission ? warningColor : undefined}
          text={!isNaN(commission) && !isHighCommission ? String(commission) + '%' : undefined}
          title={t('Commission')}
          valueNode={isHighCommission
            ? <CommissionPill
              color={warningColor}
              text={isNaN(commission) ? '---' : String(commission) + '%'}
            />
            : undefined}
        />
        <StakingInfoStack
          text={String((validatorInfo.exposureMeta as unknown as SpStakingPagedExposureMetadata)?.nominatorCount ?? 0)}
          title={t('Nominators')}
        />
      </Container>
    </Stack>
  );
});

interface ValidatorInformationHandlerProps {
  genesisHash: string;
  validatorDetail: ValidatorInformation | undefined;
  toggleValidatorDetail: (validatorInfo: ValidatorInformation | undefined) => () => void;
}

const ValidatorInformationHandler = ({ genesisHash, toggleValidatorDetail, validatorDetail }: ValidatorInformationHandlerProps) => {
  const isExtension = useIsExtensionPopup();

  return useMemo(() => {
    if (isExtension) {
      return (
        <ValidatorDetail
          genesisHash={genesisHash}
          handleClose={toggleValidatorDetail(undefined)}
          validatorDetail={validatorDetail}
        />);
    }

    if (!validatorDetail) {
      return <></>;
    }

    return (
      <ValidatorInformationFS
        genesisHash={genesisHash}
        onClose={toggleValidatorDetail(undefined)}
        validator={validatorDetail}
      />);
  }, [genesisHash, isExtension, toggleValidatorDetail, validatorDetail]);
};

interface NominatorsTableProp {
  genesisHash: string;
  validatorsInformation: ValidatorInformation[];
  onSelect?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  selected?: string[];
  height?: number;
}

function NominatorsTable({ genesisHash, height = 515, onSelect, selected, validatorsInformation }: NominatorsTableProp): React.ReactElement {
  const isBlueish = useIsBlueish();

  const [validatorDetail, setValidatorDetail] = React.useState<ValidatorInformation | undefined>(undefined);

  const toggleValidatorDetail = useCallback((validatorInfo: ValidatorInformation | undefined) => () => {
    setValidatorDetail(validatorInfo);
  }, []);

  return (
    <>
      <Stack direction='column' sx={{ height: 'fit-content', width: '100%' }}>
        <List
          height={height}
          itemCount={validatorsInformation.length}
          itemSize={110}
          style={{ paddingBottom: '60px' }}
          width='100%'
        >
          {({ index, style }: { index: number, style: CSSProperties }) => {
            const validatorInfo = validatorsInformation[index];

            return (
              <div key={index} style={{ ...style }}>
                <ValidatorInfo
                  genesisHash={genesisHash}
                  isBlueish={isBlueish}
                  isSelected={selected ? selected.includes(validatorInfo.accountId.toString()) : undefined}
                  onDetailClick={toggleValidatorDetail(validatorInfo)}
                  onSelect={onSelect}
                  validatorInfo={validatorInfo}
                />
              </div>
            );
          }}
        </List>
      </Stack>
      <ValidatorInformationHandler
        genesisHash={genesisHash}
        toggleValidatorDetail={toggleValidatorDetail}
        validatorDetail={validatorDetail}
      />
    </>
  );
}

export default memo(NominatorsTable);
