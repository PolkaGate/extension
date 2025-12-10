// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveAccountRegistration } from '@polkadot/api-derive/types';
// @ts-ignore
import type { SpStakingIndividualExposure } from '@polkadot/types/lookup';

import { Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import React, { useRef, useState } from 'react';

import { getSubstrateAddress } from '@polkadot/extension-polkagate/src/util';

import { DisplayBalance, FadeOnScroll, Identity2, MySkeleton, NoInfoYet } from '../../../../components';
import { useChainInfo, useTranslation } from '../../../../hooks';
import { MiniSocials } from '../../partials/ValidatorInformationFS';

interface Props {
  genesisHash: string | undefined;
  nominators: SpStakingIndividualExposure[] | undefined;
}

interface NominatorItemProps {
  nominator: SpStakingIndividualExposure;
  genesisHash: string | undefined;
}

const NominatorItem = ({ genesisHash, nominator }: NominatorItemProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { decimal, token } = useChainInfo(genesisHash, true);

  const [accountInfo, setAccountInfo] = useState<DeriveAccountRegistration | undefined>(undefined);

  return (
    <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#05091C', borderRadius: '14px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', p: '15px' }}>
      <Stack direction='row' sx={{ width: 'max-content' }}>
        <Identity2
          address={getSubstrateAddress(nominator.who.toString())}
          genesisHash={genesisHash ?? ''}
          identiconSize={24}
          returnIdentity={setAccountInfo}
          showShortAddress
          showSocial={false}
          style={{ width: '300px' }}
        />
        <Grid container item sx={{ alignItems: 'center', gap: '5px', width: 'fit-content' }}>
          <Typography color='#AA83DC' textAlign='left' variant='B-4'>
            {t('Staked')}
          </Typography>
          <DisplayBalance
            balance={nominator.value}
            decimal={decimal}
            decimalPoint={2}
            style={{ color: theme.palette.text.primary, fontFamily: 'Inter', fontSize: '12px', fontWeight: 500 }}
            token={token}
          />
        </Grid>
      </Stack>
      <MiniSocials accountInfo={accountInfo} />
    </Container>
  );
};

const PlaceHolder = () => {
  return (
    <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#05091C', borderRadius: '14px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', p: '15px' }}>
      <Stack alignItems='center' columnGap={14} direction='row' sx={{ width: 'max-content' }}>
        <Stack alignItems='center' columnGap={1} direction='row'>
          <MySkeleton height={24} width={24} />
          <MySkeleton width={120} />
        </Stack>
        <MySkeleton width={100} />
      </Stack>
      <Stack columnGap={1} direction='row'>
        <MySkeleton height={24} width={24} />
        <MySkeleton height={24} width={24} />
        <MySkeleton height={24} width={24} />
      </Stack>
    </Container>
  );
};

export default function Nominators ({ genesisHash, nominators }: Props) {
  const { t } = useTranslation();
  const refContainer = useRef<HTMLDivElement>(null);

  return (
    <Stack direction='column' sx={{ width: '100%' }}>
      <Stack alignItems='center' columnGap={1} direction='row' sx={{ p: '20px 10px 5px' }}>
        <Typography color='text.primary' textAlign='left' variant='H-3'>
          {t('Nominators')}
        </Typography>
        <Typography color='#AA83DC' sx={{ alignItems: 'center', bgcolor: '#AA83DC26', borderRadius: '1024px', display: 'flex', height: '19px', px: '10px' }} variant='B-2'>
          {nominators ? `${nominators.length}` : ''}
        </Typography>
      </Stack>
      <Stack direction='column' ref={refContainer} sx={{ gap: '4px', maxHeight: 'calc(100vh - 588px)', maxWidth: '1050px', minHeight: '220px', overflow: 'auto', width: '100%', position: 'relative' }}>
        {!nominators &&
          Array.from({ length: 5 }).map((_, index) => (
            <PlaceHolder
              key={index}
            />
          ))
        }
        {!!nominators?.length &&
          nominators.map((item, index) => (
            <NominatorItem
              genesisHash={genesisHash}
              key={index}
              nominator={item}
            />
          ))
        }
        {nominators?.length === 0 &&
          <NoInfoYet
            show
            size={120}
            style={{ pt: '2%' }}
            text={t('No nominators')}
          />
        }
        <FadeOnScroll containerRef={refContainer} height='45px' ratio={0.3} style={{ borderRadius: '0 0 14px 14px' }} />
      </Stack>
    </Stack>
  );
}
