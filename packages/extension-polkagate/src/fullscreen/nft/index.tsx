// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Chain } from '@polkadot/extension-chains/types';
import type { ItemInformation } from './utils/types';

import { faGem } from '@fortawesome/free-solid-svg-icons';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import NftManager from '../../class/nftManager';
import { Warning } from '../../components';
import { useApiWithChain2, useFullscreen, useTranslation } from '../../hooks';
import { getAssetHubByChainName } from '../../hooks/useReferendum';
import FullScreenHeader from '../governance/FullScreenHeader';
import Bread from '../partials/Bread';
import { Title } from '../sendFund/InputPage';
import Filters from './components/Filters';
import NftList from './components/NftList';
import { SUPPORTED_NFT_CHAINS } from './utils/constants';
import { fetchItemMetadata } from './utils/util';

enum STEPS {
  CHECK_SCREEN,
  INDEX,
  UNSUPPORTED
}

function NFT(): React.ReactElement {
  useFullscreen();
  const nftManager = React.useMemo(() => new NftManager(), []);

  const { t } = useTranslation();
  const theme = useTheme();
  const { address } = useParams<{ address: string }>();

  const [nfts, setNfts] = useState<ItemInformation[] | null | undefined>(undefined);
  const [step, setStep] = useState<STEPS>(STEPS.CHECK_SCREEN);
  const [itemsToShow, setItemsToShow] = useState<ItemInformation[] | null | undefined>(undefined);

  useEffect(() => {
    const myNfts = nftManager.get(address);

    setNfts(myNfts);

    const handleNftUpdate = (updatedAddress: string, updatedNfts: ItemInformation[]) => {
      if (updatedAddress === address) {
        setNfts(updatedNfts);
      }
    };

    nftManager.subscribe(handleNftUpdate);

    // Cleanup
    return () => {
      nftManager.unsubscribe(handleNftUpdate);
    };
  }, [address, nftManager]);

  const chainNames = Object.keys(SUPPORTED_NFT_CHAINS);

  const apis = Object.fromEntries(
    chainNames.map((chainName) => [
      chainName,
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useApiWithChain2(getAssetHubByChainName(chainName) as Chain)
    ])
  );

  const reset = useCallback(() => {
    setStep(STEPS.CHECK_SCREEN);
  }, []);

  useEffect(() => {
    reset();
  }, [address, reset]);

  useEffect(() => {
    if (nfts) {
      setStep(STEPS.INDEX);

      nfts.forEach((nft) => {
        (nft.data && ((nft.image === undefined && nft.animation_url === undefined) || !nft.collectionName)) &&
          fetchItemMetadata(address, nft).catch(console.error);
      });

      return;
    }

    setStep(STEPS.CHECK_SCREEN);
  }, [address, nfts]);

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader noChainSwitch page='nft' />
      <Grid container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', height: 'calc(100vh - 70px)', maxWidth: '1282px', overflow: 'scroll' }}>
        <Grid container item sx={{ display: 'block', px: '5%' }}>
          <Bread />
          <Title
            height='100px'
            icon={faGem}
            padding='0px'
            text={t('NFT Album')}
          />
          {step === STEPS.UNSUPPORTED &&
            <Grid alignItems='center' container direction='column' display='block' item>
              <Grid container item justifyContent='center' sx={{ '> div.belowInput': { m: 0 }, height: '30px', m: 'auto', pt: '50px', width: '70%' }}>
                <Warning
                  fontSize='16px'
                  fontWeight={500}
                  isBelowInput
                  theme={theme}
                >
                  {t('The chosen blockchain does not support NFTs/Uniques.')}
                </Warning>
              </Grid>
            </Grid>
          }
          {[STEPS.INDEX, STEPS.CHECK_SCREEN].includes(step) &&
            <>
              <Typography fontSize='14px' fontWeight={400}>
                {t('Here, you can view all your created or owned NFTs and unique items. Click on any to enlarge, access more details, and view in fullscreen mode.')}
              </Typography>
              <Filters
                items={nfts}
                setItemsToShow={setItemsToShow}
              />
              <NftList
                apis={apis}
                nfts={itemsToShow}
              />
            </>
          }
        </Grid>
      </Grid>
    </Grid>
  );
}

export default React.memo(NFT);
