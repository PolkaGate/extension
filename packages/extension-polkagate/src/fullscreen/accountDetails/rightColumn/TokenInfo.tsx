// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { FetchedBalance } from '../../../util/types';

import { Grid, Stack, Typography } from '@mui/material';
import { Coin, Lock1, People, Trade, UserOctagon } from 'iconsax-react';
import React, { memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import ReservedLockedPopup from '@polkadot/extension-polkagate/src/popup/tokens/partial/ReservedLockedPopup';
import { useTokenInfoDetails } from '@polkadot/extension-polkagate/src/popup/tokens/useTokenInfoDetails';
import { VelvetBox } from '@polkadot/extension-polkagate/src/style/index';
import { isStakingChain } from '@polkadot/extension-polkagate/src/util/migrateHubUtils';
import { BN_ZERO } from '@polkadot/util';

import { useTranslation } from '../../../hooks';
import TokenDetailBox from '../../../popup/tokens/partial/TokenDetailBox';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
  token: FetchedBalance | undefined;
}

function TokenInfo ({ address, genesisHash, token }: Props): React.ReactElement {
  const { t } = useTranslation();
  const navigate = useNavigate();

    const { closeMenu,
      displayPopup,
      hasAmount,
      lockedBalance,
      lockedTooltip,
      onTransferable,
      reservedBalance,
      state,
      tokenPrice,
      transferable } = useTokenInfoDetails(address, genesisHash, token);

  const onStaking = useCallback((type: string) => () => {
    navigate(`/fullscreen-stake/${type}/${address}/${genesisHash}`) as void;
  }, [address, genesisHash, navigate]);

  const stakings = useMemo(() => {
    if (!token || !isStakingChain(genesisHash)) {
      return undefined;
    }

    return {
      hasPoolStake: token.pooledBalance && !token.pooledBalance.isZero(),
      hasSoloStake: token?.soloTotal && !token.soloTotal.isZero(),
      maybePoolStake: token?.pooledBalance?.add(token?.poolReward ?? BN_ZERO) ?? BN_ZERO,
      maybeSoloStake: token?.soloTotal ?? BN_ZERO
    };
  }, [genesisHash, token]);

  const BOX_BG = '#05091C';
  const ICON_SIZE = '20';

  return (
    <>
      <Grid container item sx={{ display: 'flex', gap: '4px', mb: '10px', p: '15px', pb: '10px' }}>
        <Typography sx={{ display: 'flex', mb: '10px', width: '100%' }} variant='B-3'>
          {t('Info')}
        </Typography>
        <VelvetBox>
          <Stack columnGap='5px' direction='row' sx={{ overflowX: 'auto' }}>
            <TokenDetailBox
              Icon={Trade}
              amount={transferable}
              background={BOX_BG}
              decimal={token?.decimal}
              iconSize={ICON_SIZE}
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onClick={onTransferable}
              priceId={token?.priceId}
              title={t('Transferable')}
              token={token?.token}
            />
            <TokenDetailBox
              Icon={Lock1}
              amount={lockedBalance}
              background={BOX_BG}
              decimal={token?.decimal}
              description={lockedTooltip}
              iconSize={ICON_SIZE}
              onClick={hasAmount(lockedBalance) ? displayPopup('locked') : undefined}
              priceId={token?.priceId}
              title={t('Locked')}
              token={token?.token}
            />
            <TokenDetailBox
              Icon={Coin}
              amount={reservedBalance}
              background={BOX_BG}
              decimal={token?.decimal}
              iconSize={ICON_SIZE}
              onClick={hasAmount(reservedBalance) ? displayPopup('reserved') : undefined}
              priceId={token?.priceId}
              title={t('Reserved')}
              token={token?.token}
            />
            {
              stakings?.hasPoolStake &&
              <TokenDetailBox
                Icon={People}
                amount={stakings.maybePoolStake}
                background={BOX_BG}
                decimal={token?.decimal}
                iconSize={ICON_SIZE}
                iconVariant='Bulk'
                onClick={onStaking('pool')}
                priceId={token?.priceId}
                title={t('Pool Staked')}
                token={token?.token}
              />
            }
            {
              stakings?.hasSoloStake &&
              <TokenDetailBox
                Icon={UserOctagon}
                amount={stakings.maybeSoloStake}
                background={BOX_BG}
                decimal={token?.decimal}
                iconSize={ICON_SIZE}
                iconVariant='Bold'
                onClick={onStaking('solo')}
                priceId={token?.priceId}
                title={t('Solo Staked')}
                token={token?.token}
              />
            }
          </Stack>
        </VelvetBox>
      </Grid>
      <ReservedLockedPopup
        TitleIcon={state.data?.titleIcon}
        decimal={token?.decimal}
        handleClose={closeMenu}
        items={state.data?.items ?? {}}
        openMenu={!!state.type}
        price={tokenPrice}
        title={state.type ?? ''}
        token={token?.token}
      />
    </>
  );
}

export default memo(TokenInfo);
