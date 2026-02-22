// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveAccountRegistration } from '@polkadot/api-derive/types';
// @ts-ignore
import type { SpStakingIndividualExposure } from '@polkadot/types/lookup';

import { Collapse, Container, Grid, Stack } from '@mui/material';
import { BuyCrypto, Mask, PercentageSquare } from 'iconsax-react';
import React, { useMemo, useRef, useState } from 'react';

import { getSubstrateAddress, toBN } from '@polkadot/extension-polkagate/src/util';

import { FadeOnScroll, Identity2, MySkeleton, NoInfoYet } from '../../../../components';
import { useChainInfo, useTranslation } from '../../../../hooks';
import { MiniSocials } from '../../partials/ValidatorInformationFS';
import Curve from '../nominations/partials/Curve';
import { LabelBar } from '../nominations/partials/LabelBar';
import Line from '../nominations/partials/Line';
import { InfoWithIcons } from '../nominations/ValidatorItem';

interface Props {
  genesisHash: string | undefined;
  nominators: SpStakingIndividualExposure[] | undefined;
  total: string | undefined;
}

interface NominatorItemProps {
  genesisHash: string | undefined;
  nominator: SpStakingIndividualExposure;
  total: string | undefined;
}

const NominatorItem = ({ genesisHash, nominator, total }: NominatorItemProps) => {
  const { t } = useTranslation();
  const { decimal, token } = useChainInfo(genesisHash, true);

  const [accountInfo, setAccountInfo] = useState<DeriveAccountRegistration | undefined>(undefined);

  const share = useMemo(() => {
    if (!total) {
      return undefined;
    }

    const PRECISION = 1_00;
    const myShareBN = toBN(nominator.value).muln(100 * PRECISION).div(toBN((total)));

    return myShareBN.toNumber() / PRECISION;
  }, [nominator.value, total]);

  return (
    <Stack direction='row' sx={{ position: 'relative', width: '100%' }}>
      <Curve />
      <Stack direction='row' sx={{ alignItems: 'center', bgcolor: '#2D1E4A66', borderRadius: '14px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', ml: '30px', p: '10px', width: '100%' }}>
        <Stack direction='row' sx={{ pl: '10px', width: 'max-content' }}>
          <Identity2
            address={getSubstrateAddress(nominator.who.toString())}
            genesisHash={genesisHash ?? ''}
            identiconSize={24}
            returnIdentity={setAccountInfo}
            showShortAddress
            showSocial={false}
            style={{ variant: 'B-1', width: '300px' }}
          />
          <InfoWithIcons
            StartIcon={BuyCrypto}
            amount={nominator.value}
            decimal={decimal}
            title={t('Staked')}
            token={token}
            width='180px'
          />
          <InfoWithIcons
            StartIcon={PercentageSquare}
            text={share !== undefined ? `${share}%` : undefined}
            title={t('Share')}
            width='180px'
          />
        </Stack>
        <MiniSocials accountInfo={accountInfo} />
      </Stack>
    </Stack>
  );
};

const PlaceHolder = () => {
  return (
    <Container disableGutters sx={{ alignItems: 'center', bgcolor: '#2D1E4A66', borderRadius: '14px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', p: '10px' }}>
      <Stack alignItems='center' columnGap={14} direction='row' sx={{ width: 'max-content' }}>
        <Stack alignItems='center' columnGap={1} direction='row'>
          <MySkeleton height={24} width={24} />
          <MySkeleton width={120} />
        </Stack>
        <MySkeleton width={100} />
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

export default function Nominators({ genesisHash, nominators, total }: Props) {
  const { t } = useTranslation();
  const refContainer = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);

  return (
    <Stack direction='column' sx={{ minHeight: '220px', width: '100%' }}>
      <LabelBar
        Icon={Mask}
        color='#674394'
        count={nominators?.length}
        description={t('Who supports this validator')}
        isCollapsed={open}
        label={t('Nominators')}
        setCollapse={setOpen}
      />
      <Collapse easing={{ enter: '200ms', exit: '150ms' }} in={open} sx={{ height: 'fit-content', minHeight: 'auto' }}>
        <Grid container>
          <Stack direction='column' ref={refContainer} sx={{ gap: '4px', maxHeight: 'calc(100vh - 613px)', minHeight: '220px', overflow: 'auto', position: 'relative', width: '98%' }}>
            {!!nominators?.length &&
              <Line
                height={(48 * (nominators.length - 1))}
              />
            }
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
                  total={total}
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
          </Stack>
          <FadeOnScroll containerRef={refContainer} height='45px' ratio={0.3} style={{ borderRadius: '0 0 14px 14px' }} />
        </Grid>
      </Collapse>
    </Stack>
  );
}
