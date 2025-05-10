// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Compact } from '@polkadot/types';
import type { INumber } from '@polkadot/types/types';
import type { BN } from '@polkadot/util';
import type { ValidatorInformation } from '../../../hooks/useValidatorsInformation';

import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { Container, IconButton, Stack, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { FormatBalance2 } from '../../../components';
import { useChainInfo, useTranslation } from '../../../hooks';
import { GradientDivider, PolkaGateIdenticon } from '../../../style';
import { toShortAddress } from '../../../util/utils';
import ValidatorDetail from './ValidatorDetail';

interface ValidatorIdentityProp {
  validatorInfo: ValidatorInformation;
}

const ValidatorIdentity = ({ validatorInfo }: ValidatorIdentityProp) => {
  return (
    <Container disableGutters sx={{ alignItems: 'center', columnGap: '4px', display: 'flex', flexDirection: 'row' }}>
      <PolkaGateIdenticon
        address={validatorInfo.accountId.toString()}
        size={24}
      />
      {!validatorInfo.identity &&
        <Typography color='text.primary' variant='B-2'>
          {toShortAddress(validatorInfo.accountId)}
        </Typography>}
      {validatorInfo.identity &&
        <Typography color='text.primary' variant='B-2'>
          {validatorInfo.identity.displayParent ?? validatorInfo.identity.display}
        </Typography>}
      {validatorInfo.identity?.displayParent &&
        <Typography color='text.highlight' sx={{ bgcolor: '#809ACB26', borderRadius: '6px', p: '4px' }} variant='B-5'>
          {validatorInfo.identity.display}
        </Typography>}
    </Container>
  );
};

interface ValidatorStakingInfoProps {
  decimal?: number | undefined;
  token?: string | undefined;
  title: string;
  text?: string | undefined;
  amount?: string | BN | Compact<INumber> | null | undefined
}

export const ValidatorStakingInfo = ({ amount, decimal, text, title, token }: ValidatorStakingInfoProps) => {
  const theme = useTheme();

  return (
    <Stack direction='column' sx={{ width: 'fit-content' }}>
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
        </Typography>}
      <Typography color='text.highlight' textAlign='left' variant='B-4'>
        {title}
      </Typography>
    </Stack>
  );
};

interface ValidatorInfoProp {
  validatorInfo: ValidatorInformation;
  genesisHash: string;
  onDetailClick: () => void;
}

const ValidatorInfo = ({ genesisHash, onDetailClick, validatorInfo }: ValidatorInfoProp) => {
  const { t } = useTranslation();
  const { decimal, token } = useChainInfo(genesisHash, true);

  return (
    <Stack direction='column' sx={{ bgcolor: '#110F2A', borderRadius: '14px', p: '8px', width: '100%' }}>
      <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', p: '4px' }}>
        <ValidatorIdentity validatorInfo={validatorInfo} />
        <IconButton onClick={onDetailClick} sx={{ bgcolor: '#809ACB26', borderRadius: '12px', m: 0, p: '1px 6px' }}>
          <MoreHorizIcon sx={{ color: 'text.highlight', fontSize: '24px' }} />
        </IconButton>
      </Container>
      <GradientDivider style={{ my: '4px' }} />
      <Container disableGutters sx={{ alignItems: 'flex-end', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', p: '4px' }}>
        <Container disableGutters sx={{ alignItems: 'flex-end', display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
          <ValidatorStakingInfo amount={validatorInfo.stakingLedger.total} decimal={decimal} title={t('Staked')} token={token} />
          <ValidatorStakingInfo text={String(Number(validatorInfo.validatorPrefs.commission) / (10 ** 7) < 1 ? 0 : Number(validatorInfo.validatorPrefs.commission) / (10 ** 7)) + '%'} title={t('Commission')} />
          {/* @ts-ignore */}
          <ValidatorStakingInfo text={validatorInfo.exposureMeta?.nominatorCount ?? 0} title={t('Nominators')} />
        </Container>
        {/* <IconButton onClick={onDetailClick} sx={{ m: 0, p: '4px' }}>
          <ArrowForwardIosIcon sx={{ color: 'text.primary', fontSize: '20px' }} /> // it is available in the design onFigma but has no functionality
        </IconButton> */}
      </Container>
    </Stack>
  );
};

interface NominatorsTableProp {
  genesisHash: string;
  validatorsInformation: ValidatorInformation[];
}

export default function NominatorsTable ({ genesisHash, validatorsInformation }: NominatorsTableProp): React.ReactElement {
  const [validatorDetail, setValidatorDetail] = React.useState<ValidatorInformation | undefined>(undefined);

  const toggleValidatorDetail = useCallback((validatorInfo: ValidatorInformation | undefined) => () => {
    setValidatorDetail(validatorInfo);
  }, []);

  return (
    <>
      <Stack direction='column' sx={{ height: 'fit-content', mb: '75px', rowGap: '4px', width: '100%' }}>
        {validatorsInformation.map((validatorInfo, index) => (
          <ValidatorInfo
            genesisHash={genesisHash}
            key={index}
            onDetailClick={toggleValidatorDetail(validatorInfo)}
            validatorInfo={validatorInfo}
          />
        ))}
      </Stack>
      <ValidatorDetail
        genesisHash={genesisHash}
        handleClose={toggleValidatorDetail(undefined)}
        validatorDetail={validatorDetail}
      />
    </>
  );
}
