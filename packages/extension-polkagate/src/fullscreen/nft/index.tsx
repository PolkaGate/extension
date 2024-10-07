// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ItemInformation, ItemsDetail } from './utils/types';

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { Warning } from '../../components';
import NFTIcon from '../../components/SVG/NFT';
import { useFullscreen, useNFT, useTranslation } from '../../hooks';
import FullScreenHeader from '../governance/FullScreenHeader';
import Bread from '../partials/Bread';
import { Title } from '../sendFund/InputPage';
import ItemsList from './components/ItemsList';
import Tabs from './components/Tabs';
import { fetchItemMetadata } from './utils/util';

enum STEPS {
  CHECK_SCREEN,
  INDEX,
  UNSUPPORTED
}

function NFT (): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();
  const theme = useTheme();
  const { address } = useParams<{ address: string }>();

  const items = useNFT(address);

  const [step, setStep] = useState<STEPS>(STEPS.CHECK_SCREEN);
  const [itemsDetail, setItemsDetail] = useState<ItemsDetail>({});
  const [itemsToShow, setItemsToShow] = useState<ItemInformation[] | null | undefined>(undefined);

  const reset = useCallback(() => {
    setItemsDetail({});
    setStep(STEPS.CHECK_SCREEN);
  }, []);

  useEffect(() => {
    reset();
  }, [address, reset]);

  useEffect(() => {
    if (items) {
      setStep(STEPS.INDEX);

      return;
    }

    setStep(STEPS.CHECK_SCREEN);
  }, [items]);

  useEffect(() => {
    if (!items) {
      return;
    }

    items.forEach((item) => {
      fetchItemMetadata(item, setItemsDetail).catch(console.error);
    });
  }, [items]);

  return (
    <Grid bgcolor='backgroundFL.primary' container item justifyContent='center'>
      <FullScreenHeader noChainSwitch page='nft' />
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
                {t('On NFT / Unique Album page you can watch all of your created or owned NFT/unique items.')}
              </Typography>
              <Tabs
                items={items}
                setItemsToShow={setItemsToShow}
              />
              <ItemsList
                items={itemsToShow}
                itemsDetail={itemsDetail}
              />
            </>
          }
        </Grid>
      </Grid>
    </Grid>
  );
}

export default React.memo(NFT);
