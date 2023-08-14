// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component shows an account balances information in detail
 * */

import type { DeriveAccountRegistration } from '@polkadot/api-derive/types';

import { Container, Divider, Grid, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { Chain } from '@polkadot/extension-chains/types';
import { AccountId } from '@polkadot/types/interfaces/runtime';

import { Identicon, Motion, Popup } from '../../components';
import { useAccountName, useFormatted, useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';
import { STAKING_CHAINS } from '../../util/constants';
import { BalancesInfo } from '../../util/types';
import LabelBalancePrice from './LabelBalancePrice';

interface Props {
  identity: DeriveAccountRegistration | null | undefined;
  show: boolean;
  chain: Chain;
  balances: BalancesInfo;
  address: AccountId | string;
  setShow: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}

export default function Others({ address, balances, chain, identity, setShow, show }: Props): React.ReactElement<void> {
  const { t } = useTranslation();
  const formatted = useFormatted(address);
  const accountName = useAccountName(address);

  const identicon = (
    <Identicon
      iconTheme={chain?.icon || 'polkadot'}
      isSubId={!!identity?.displayParent}
      judgement={identity?.judgements}
      prefix={chain?.ss58Format ?? 42}
      size={40}
      value={formatted}
    />
  );

  const goToAccount = useCallback(() => {
    setShow(false);
  }, [setShow]);

  return (
    <Motion>
      <Popup show={show}>
        <HeaderBrand
          _centerItem={identicon}
          noBorder
          onBackClick={goToAccount}
          paddingBottom={0}
          showBackArrow
        />
        <Container disableGutters sx={{ px: '15px' }}>
          <Grid container item justifyContent='center'>
            <Typography sx={{ fontSize: '28px', fontWeight: 400, maxWidth: '82%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {identity?.display || accountName}
            </Typography>
          </Grid>
          <Grid container item justifyContent='center'>
            <Typography sx={{ fontSize: '36px', fontWeight: 400, letterSpacing: '-0.015em' }}>
              {t('Others')}
            </Typography>
          </Grid>
          <Grid alignItems='center' item justifyContent='center'>
            <Divider sx={{ bgcolor: 'secondary.main', height: '2px' }} />
          </Grid>
        </Container>
        <Container disableGutters sx={{ maxHeight: `${parent.innerHeight - 150}px`, overflowY: 'auto', px: '15px' }}>
          {chain?.genesisHash && STAKING_CHAINS.includes(chain.genesisHash) &&
            <LabelBalancePrice address={address} balances={balances} label={'Free Balance'} />
          }
          {/* {chain?.genesisHash && !GOVERNANCE_CHAINS.includes(chain.genesisHash) &&
            <LabelBalancePrice address={address} balances={balances} label={'Locked Balance'} />
          } */}
          <LabelBalancePrice address={address} balances={balances} label={'Voting Balance'} />
        </Container>
      </Popup>
    </Motion>
  );
}
