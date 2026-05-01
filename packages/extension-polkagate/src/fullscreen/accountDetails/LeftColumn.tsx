// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Lock } from '@polkadot/extension-polkagate/fullscreen/governance/types';
import type { BN } from '@polkadot/util';

import { Grid, Stack, useTheme } from '@mui/material';
import React, { useRef } from 'react';
import { useParams } from 'react-router-dom';

import HasProxyOnHubIndicator from '@polkadot/extension-polkagate/src/components/HasProxyOnHubIndicator';
import AssetsBox from '@polkadot/extension-polkagate/src/popup/home/partial/AssetsBox';
import PolkaGateIdenticon from '@polkadot/extension-polkagate/src/style/PolkaGateIdenticon';
import { isEthereumAddress } from '@polkadot/util-crypto';

import { AccountVisibilityToggler, FadeOnScroll, Recoverability } from '../../components';
import { useAccount, useAccountProfile, useTranslation } from '../../hooks';
import { VelvetBox } from '../../style';
import { Account, AccountProfileLabel } from '../components';
import AccountDropDown from '../home/AccountDropDown';

export interface UnlockInformationType {
  classToUnlock: Lock[] | undefined;
  totalLocked: BN | null | undefined;
  unlockableAmount: BN | undefined;
}

export default function LeftColumn(): React.ReactElement {
  const { t } = useTranslation();
  const { address } = useParams<{ address: string }>();
  const account = useAccount(address);
  const profile = useAccountProfile(account);
  const refContainer = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const cardBg = isDark ? '#05091C' : '#FFFFFF';
  const borderColor = isDark ? '#1B133C' : '#DDE3F4';
  const toggleBg = account?.isHidden ? 'transparent' : cardBg;

  return (
    <VelvetBox style={{ height: 'fit-content', marginLeft: '15px', minHeight: '150px', width: ' 505px' }}>
      <Stack sx={{ bgcolor: cardBg, border: '1px solid', borderColor, borderRadius: '14px', height: '172px', m: '40px auto 5px', position: 'relative', width: '497px' }}>
        <PolkaGateIdenticon
          address={address ?? ''}
          size={64}
          style={{ left: '20px', position: 'absolute', top: '-35px' }}
        />
        <Account
          account={account}
          style={{ margin: '50px 0 0 20px', maxWidth: '92%' }}
          variant='B-3'
        />
        <AccountProfileLabel label={profile ?? t('Unknown')} style={{ position: 'absolute', right: '8px', top: '0' }} />
        <Stack direction='row' justifyContent='space-between' sx={{ bottom: '18px', left: '20px', position: 'absolute', width: '94%' }}>
          <Stack columnGap='8px' direction='row'>
            <AccountVisibilityToggler
              size={20}
              style={{ backgroundColor: toggleBg, borderColor, borderRadius: '12px', height: '40px', margin: 0, width: '40px' }}
            />
            <Recoverability />
            {!isEthereumAddress(address) &&
              <HasProxyOnHubIndicator
                address={address}
              />
            }
          </Stack>
          <AccountDropDown
            address={account?.address}
            isExternal={account?.isExternal}
            name={account?.name}
            style={{ borderWidth: '1px' }}
          />
        </Stack>
      </Stack>
      <Grid container item ref={refContainer} sx={{ maxHeight: 'calc(100vh - 325px)', overflow: 'hidden', overflowY: 'auto' }}>
        <AssetsBox loadingItemsCount={5} />
        <FadeOnScroll containerRef={refContainer} height='50px' ratio={0.3} />
      </Grid>
    </VelvetBox>
  );
}
