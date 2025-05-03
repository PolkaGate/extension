// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';
import type { Lock } from '../../hooks/useAccountLocks';

import { Grid, Stack } from '@mui/material';
import React, { useContext, useRef } from 'react';
import { useParams } from 'react-router';

import HasProxyIndicator from '@polkadot/extension-polkagate/src/components/HasProxyIndicator';
import AssetsBox from '@polkadot/extension-polkagate/src/popup/home/partial/AssetsBox';
import PolkaGateIdenticon from '@polkadot/extension-polkagate/src/style/PolkaGateIdenticon';

import { AccountContext, AccountVisibilityToggler, FadeOnScroll, Recoverability } from '../../components';
import { useAccountProfile, useTranslation } from '../../hooks';
import { VelvetBox } from '../../style';
import { Account, AccountProfileLabel } from '../components';

export interface UnlockInformationType {
  classToUnlock: Lock[] | undefined;
  totalLocked: BN | null | undefined;
  unlockableAmount: BN | undefined;
}

export default function LeftColumn (): React.ReactElement {
  const { t } = useTranslation();
  const { address } = useParams<{ address: string, paramAssetId?: string }>();
  const { accounts } = useContext(AccountContext);
  const account = accounts.find(({ address: accountAddress }) => accountAddress === address);
  const profile = useAccountProfile(account);
  const refContainer = useRef<HTMLDivElement>(null);

  return (
    <VelvetBox style={{ height: '100%', marginLeft: '15px', minHeight: '150px', width: ' 505px' }}>
      <Stack sx={{ bgcolor: '#05091C', borderRadius: '14px', height: '172px', m: '40px auto 5px', position: 'relative', width: '497px' }}>
        <PolkaGateIdenticon
          address={address ?? '' }
          size={64}
          style={{ left: '20px', position: 'absolute', top: '-35px' }}
        />
        <Account
          account={account}
          style={{ margin: '50px 0 0 20px' }}
          variant='B-3'
        />
        <AccountProfileLabel label={profile ?? t('Unknown')} style={{ position: 'absolute', right: '8px', top: '0' }} />
        <Stack columnGap='5px' direction='row' sx={{ bottom: '18px', left: '20px', position: 'absolute' }}>
          <AccountVisibilityToggler
            size={20}
            style={{ backgroundColor: account?.isHidden ? 'transparent' : '#05091C', borderColor: '#1B133C', borderRadius: '12px' }}
          />
          <Recoverability />
          <HasProxyIndicator />
        </Stack>
      </Stack>
      <Grid container item ref={refContainer} sx={{ maxHeight: '460px', overflow: 'scroll' }}>
        <AssetsBox />
        <FadeOnScroll containerRef={refContainer} height='50px' ratio={0.3} />
      </Grid>
    </VelvetBox>
  );
}
