// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Compact } from '@polkadot/types';
import type { INumber } from '@polkadot/types/types';
import type { BN } from '@polkadot/util';
import type { ValidatorInformation } from '../../../hooks/useValidatorsInformation';

import { Container, Stack, Typography, useTheme } from '@mui/material';
import React from 'react';

import { FormatBalance2 } from '../../../components';
import { useChainInfo, useTranslation } from '../../../hooks';
import { GradientDivider, PolkaGateIdenticon } from '../../../style';
import { toShortAddress } from '../../../util/utils';

interface ValidatorInfoProp {
  validatorInfo: ValidatorInformation;
  genesisHash?: string;
}

const ValidatorIdentity = ({ validatorInfo }: ValidatorInfoProp) => {
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

const ValidatorStakingInfo = ({ amount, decimal, text, title, token }: ValidatorStakingInfoProps) => {
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

const ValidatorInfo = ({ genesisHash, validatorInfo }: ValidatorInfoProp) => {
  const { t } = useTranslation();
  const { decimal, token } = useChainInfo(genesisHash, true);

  return (
    <Stack direction='column' sx={{ bgcolor: '#110F2A', borderRadius: '14px', p: '8px', width: '100%' }}>
      <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', p: '4px' }}>
        <ValidatorIdentity validatorInfo={validatorInfo} />
      </Container>
      <GradientDivider style={{ mt: '2px' }} />
      <Container disableGutters sx={{ alignItems: 'flex-end', display: 'flex', flexDirection: 'row', justifyContent: 'space-around', p: '4px' }}>
        <ValidatorStakingInfo amount={validatorInfo.stakingLedger.total} decimal={decimal} title={t('Staked')} token={token} />
        <ValidatorStakingInfo text={String(Number(validatorInfo.validatorPrefs.commission) / (10 ** 7) < 1 ? 0 : Number(validatorInfo.validatorPrefs.commission) / (10 ** 7)) + '%'} title={t('Commission')} />
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */}
        <ValidatorStakingInfo text={validatorInfo.exposurePaged.others.length.toString()} title={t('Nominators')} />
      </Container>
    </Stack>
  );
};

interface NominatorsTableProp {
  genesisHash: string;
  validatorsInformation?: ValidatorInformation[];
}

export default function NominatorsTable ({ genesisHash, validatorsInformation }: NominatorsTableProp): React.ReactElement {
  return (
    <Stack direction='column' sx={{ height: 'fit-content', maxHeight: '500px', overflowY: 'scroll', rowGap: '4px', width: '100%' }}>
      {validatorsInformation?.map((validatorInfo, index) => (
        <ValidatorInfo
          genesisHash={genesisHash}
          key={index}
          validatorInfo={validatorInfo}
        />
      ))}
    </Stack>
  );
}
