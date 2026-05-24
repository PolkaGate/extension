// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ItemInformation } from '@polkadot/extension-polkagate/fullscreen/nft/utils/types';

import { Box, Grid } from '@mui/material';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import NftManager from '../../class/nftManager';
import { ActionContext, BackWithLabel, Motion } from '../../components';
import { useSelectedAccount } from '../../hooks';
import { UserDashboardHeader } from '../../partials';
import HomeMenu from '../../partials/HomeMenu';
import About from './About';
import Details from './Details';
import NftTabs from './NftTabs';
import Traits from './Traits';

export enum TAB {
  DETAILS,
  TRAITS,
  ABOUT
}

const nftManager = new NftManager();

export default function Nft(): React.ReactElement {
  const onAction = useContext(ActionContext);
  const refContainer = useRef<HTMLDivElement>(null);
  const { address, index } = useParams<{ address: string; index: string }>();
  const selectedAccount = useSelectedAccount();

  const [nfts, setNfts] = useState<ItemInformation[] | null | undefined>(undefined);
  const [tab, setTab] = useState<TAB>();

  const nft = nfts?.filter(({ isCollection }) => !isCollection)?.[Number(index || 0)];

  useEffect(() => {
    if (!address) {
      return;
    }

    const myNfts = nftManager.get(address);

    setNfts(myNfts);

    const handleNftUpdate = (updatedAddress: string, updatedNfts: ItemInformation[]) => {
      if (updatedAddress === address) {
        setNfts(updatedNfts);
      }
    };

    nftManager.subscribe(handleNftUpdate);

    return () => {
      nftManager.unsubscribe(handleNftUpdate);
    };
  }, [address]);

  const backHome = useCallback(() => {
    onAction('/');
  }, [onAction]);

  useEffect(() => {
    if (address && selectedAccount?.address && address !== selectedAccount.address) { // means the selected account has changed
      backHome();
    }
  }, [address, backHome, selectedAccount]);

  return (
    <Motion>
      <Grid alignContent='flex-start' container sx={{ position: 'relative' }}>
        <UserDashboardHeader />
        <BackWithLabel
          onClick={backHome}
          style={{ pb: 0, zIndex: 0 }}
        />
        <Grid container item ref={refContainer} sx={{ maxHeight: '420px', overflow: 'visible', position: 'relative' }}>
          <NftTabs setTab={setTab} tab={tab} />
          {nft?.image && tab !== undefined && tab !== TAB.DETAILS &&
            <Box sx={{
              backgroundImage: `url(${nft.image ?? ''})`,
              backgroundPosition: 'center',
              backgroundSize: 'contain',
              borderRadius: '14px',
              height: '64px',
              position: 'absolute',
              right: '12px',
              top: '-5px',
              width: '64px',
              zIndex: 100
            }}
            />
          }
          {
            (tab === undefined || tab === TAB.DETAILS) &&
            <Details nft={nft} />
          }
          {
            tab === TAB.TRAITS &&
            <Traits nft={nft} />
          }
          {
            tab === TAB.ABOUT &&
            <About nft={nft} />
          }
        </Grid>
        <HomeMenu />
      </Grid>
    </Motion>
  );
}
