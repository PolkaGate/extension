// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Compact } from '@polkadot/types';
import type { INumber } from '@polkadot/types/types';
import type { BN } from '@polkadot/util';
import type { ValidatorInformation } from '../../../hooks/useValidatorsInformation';

import { Container, IconButton, Stack, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import { ArrowRight2 } from 'iconsax-react';
import React, { type CSSProperties, memo, useCallback, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';

import { DisplayBalance, GlowCheckbox } from '../../../components';
import ValidatorInformationFS from '../../../fullscreen/stake/partials/ValidatorInformationFS';
import { useChainInfo, useIsBlueish, useIsExtensionPopup, useTranslation } from '../../../hooks';
import { GradientDivider, PolkaGateIdenticon } from '../../../style';
import { toShortAddress } from '../../../util';
import ValidatorDetail from './ValidatorDetail';

interface ValidatorIdentityProp {
  validatorInfo: ValidatorInformation;
  style?: SxProps<Theme>;
}

export const ValidatorIdentity = memo(function ValidatorIdentity ({ style, validatorInfo }: ValidatorIdentityProp) {
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
        <Typography color={isBlueish ? 'text.highlight' : 'primary.main'} sx={{ bgcolor: isBlueish ? '#809ACB26' : '#AA83DC26', borderRadius: '6px', minWidth: '22px', p: '4px' }} textAlign='start' variant='B-5'>
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
}

export const StakingInfoStack = memo(function StakingInfoStack ({ adjustedColorForTitle, amount, decimal, secondaryColor, text, title, token }: StakingInfoStackProps) {
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

interface ValidatorInfoProp {
  genesisHash: string;
  isBlueish?: boolean;
  isSelected?: boolean;
  onDetailClick: () => void;
  onSelect?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  validatorInfo: ValidatorInformation;
  style?: CSSProperties;
}

const ValidatorInfo = memo(function ValidatorInfo ({ genesisHash, isBlueish, isSelected, onDetailClick, onSelect, style, validatorInfo }: ValidatorInfoProp) {
  const { t } = useTranslation();
  const { decimal, token } = useChainInfo(genesisHash, true);

  const handleSelect = useCallback((_value: boolean) => {
    const syntheticEvent = {
      target: {
        value: validatorInfo.accountId.toString()
      }
    } as React.ChangeEvent<HTMLInputElement>;

    onSelect?.(syntheticEvent);
  }, [onSelect, validatorInfo.accountId]);

  return (
    <Stack direction='column' sx={{ bgcolor: isSelected ? '#BFA1FF26' : '#110F2A', borderRadius: '14px', mb: '4px', p: '8px', width: '100%', ...style }}>
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
        <StakingInfoStack amount={validatorInfo.stakingLedger.total} decimal={decimal} title={t('Staked')} token={token} />
        <StakingInfoStack text={String(Number(validatorInfo.validatorPrefs.commission) / (10 ** 7) < 1 ? 0 : Number(validatorInfo.validatorPrefs.commission) / (10 ** 7)) + '%'} title={t('Commission')} />
        {/* @ts-ignore */}
        <StakingInfoStack text={validatorInfo.exposureMeta?.nominatorCount ?? 0} title={t('Nominators')} />
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

function NominatorsTable ({ genesisHash, height = 515, onSelect, selected, validatorsInformation }: NominatorsTableProp): React.ReactElement {
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
          itemSize={108}
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
