// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ItemInformation, ItemsDetail } from './utils/types';

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { ActionContext, PButton, Warning } from '../../components';
import NFTIcon from '../../components/SVG/NFT';
import { useFullscreen, useInfo, useTranslation } from '../../hooks';
import { NFT_CHAINS } from '../../util/constants';
import { FullScreenHeader } from '../governance/FullScreenHeader';
import Bread from '../partials/Bread';
import { Title } from '../sendFund/InputPage';
import FilterSection from './components/FilterItems';
import ItemsList from './components/ItemsList';
import { fetchItemMetadata, fetchNFTs, fetchUniques } from './utils/util';

enum STEPS {
  CHECK_SCREEN,
  INDEX,
  UNSUPPORTED
}

function NFT (): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();
  const theme = useTheme();
  const onAction = useContext(ActionContext);
  const { address } = useParams<{ address: string }>();
  const { api, formatted, genesisHash } = useInfo(address);

  const [step, setStep] = useState<STEPS>(STEPS.CHECK_SCREEN);
  const [myNFTsDetails, setMyNFTs] = useState<ItemInformation[] | undefined>(undefined);
  const [myUniquesDetails, setMyUniques] = useState<ItemInformation[] | undefined>(undefined);
  const [itemsDetail, setItemsDetail] = useState<ItemsDetail>({});
  const [itemsToShow, setItemsToShow] = useState<ItemInformation[] | null | undefined>(undefined);

  const unsupportedChain = useMemo(() => !!(genesisHash && !(NFT_CHAINS.includes(genesisHash))), [genesisHash]);

  const reset = useCallback(() => {
    setMyNFTs(undefined);
    setMyUniques(undefined);
    setItemsDetail({});
    setStep(STEPS.CHECK_SCREEN);
  }, []);

  useEffect(() => {
    reset();
  }, [address, genesisHash, reset]);

  useEffect(() => {
    if (unsupportedChain) {
      return setStep(STEPS.UNSUPPORTED);
    } else if (!api || !formatted) {
      return setStep(STEPS.CHECK_SCREEN);
    } else if (!api.query['nfts']?.['item'] || !api.query['uniques']?.['asset']) {
      return setStep(STEPS.UNSUPPORTED);
    } else if (myNFTsDetails || myUniquesDetails) {
      setStep(STEPS.INDEX);

      return;
    }

    setStep(STEPS.CHECK_SCREEN);
    fetchNFTs(api, formatted, setMyNFTs).catch(console.error);
    fetchUniques(api, formatted, setMyUniques).catch(console.error);
  }, [api, formatted, genesisHash, myNFTsDetails, unsupportedChain, myUniquesDetails]);

  useEffect(() => {
    if (!myNFTsDetails && !myUniquesDetails) {
      return;
    }

    const allItems = [...(myNFTsDetails ?? [])].concat(myUniquesDetails ?? []);

    allItems.forEach((item) => {
      fetchItemMetadata(item, setItemsDetail).catch(console.error);
    });
  }, [myNFTsDetails, myUniquesDetails]);

  const backHome = useCallback(() => onAction('/'), [onAction]);

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader page='nft' />
      <Grid container item justifyContent='center' sx={{ bgcolor: 'backgroundFL.secondary', height: 'calc(100vh - 70px)', maxWidth: '1282px', overflow: 'scroll' }}>
        <Grid container item sx={{ display: 'block', px: '5%' }}>
          <Bread />
          <Title
            height='100px'
            logo={<NFTIcon color={theme.palette.text.primary} height={50} width={50} />}
            padding='0px'
            text={t('NFT / Unique Album')}
          />
          {step === STEPS.UNSUPPORTED &&
            <Grid alignItems='center' container direction='column' display='block' item>
              <Grid container item sx={{ '> div.belowInput': { m: 0 }, height: '30px', m: 'auto', pt: '50px', width: '400px' }}>
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
                {t('On NFT / Unique Album page you can watch all of your created or owned NFT/unique items.')}
              </Typography>
              <FilterSection
                myNFTsDetails={myNFTsDetails}
                myUniquesDetails={myUniquesDetails}
                setItemsToShow={setItemsToShow}
              />
              <ItemsList
                items={itemsToShow}
                itemsDetail={itemsDetail}
              />
              <Grid container item justifyContent='flex-end' sx={{ '> button': { width: '280px' }, '> div': { width: '280px' }, pt: '20px' }}>
                <PButton
                  _ml={0}
                  _mt='0'
                  _onClick={backHome}
                  text={t('Back')}
                />
              </Grid>
            </>
          }
        </Grid>
      </Grid>
    </Grid>
  );
}

export default React.memo(NFT);
