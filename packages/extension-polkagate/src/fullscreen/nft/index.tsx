// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
// @ts-ignore
import type { PalletNftsItemDetails, PalletNftsItemMetadata } from '@polkadot/types/lookup';

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { noop } from '@polkadot/util';

import { ActionContext, Checkbox2, InputFilter, PButton, Progress, Warning } from '../../components';
import NFTIcon from '../../components/SVG/NFT';
import { useFullscreen, useInfo, useTranslation } from '../../hooks';
import { NFT_CHAINS } from '../../util/constants';
import { FullScreenHeader } from '../governance/FullScreenHeader';
import Bread from '../partials/Bread';
import { Title } from '../sendFund/InputPage';
import NFTItem from './NFTItem';

enum STEPS {
  CHECK_SCREEN,
  INDEX,
  UNSUPPORTED
}

export interface NFTInformation {
  collectionId?: string;
  nftId?: string;
  data?: string;
}

interface CheckboxButtonProps {
  title: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
}

const CheckboxButton = ({ checked, onChange, title }: CheckboxButtonProps) => {
  const theme = useTheme();

  return (
    <Grid alignItems='center' container item justifyContent='flex-start' sx={{ color: theme.palette.mode === 'light' ? 'secondary.main' : 'text.primary', cursor: 'pointer', textDecorationLine: 'underline', width: 'fit-content' }} >
      <Checkbox2
        checked={checked}
        label={title}
        labelStyle={{ fontSize: '16px', fontWeight: 400 }}
        onChange={onChange}
      />
    </Grid>
  );
};

interface FilterSectionProps {
  onSearch: (filter: string) => void;
  onCreated: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  onOwn: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  onMyCollection: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
}

const FilterSection = ({ onCreated, onMyCollection, onOwn, onSearch }: FilterSectionProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Grid alignItems='flex-end' container item justifyContent='space-around' sx={{ borderBottom: '2px solid', borderBottomColor: 'divider', mt: '20px', py: '5px' }}>
      <CheckboxButton checked onChange={onCreated} title={t('Created')} />
      <CheckboxButton checked onChange={onOwn} title={t('Own')} />
      <CheckboxButton checked onChange={onMyCollection} title={t('My collection')} />
      <Grid container item justifyContent='flex-start' width='30%'>
        <InputFilter
          autoFocus={false}
          onChange={onSearch}
          placeholder={t('🔍 Search in nfts ')}
          theme={theme}
        // value={searchKeyword ?? ''}
        />
      </Grid>
    </Grid>
  );
};

interface NFTItemListProps {
  nftItems: NFTInformation[] | null | undefined;
}

const NFTItemList = ({ nftItems }: NFTItemListProps) => {
  const { t } = useTranslation();

  return (
    <Grid container item sx={{ bgcolor: 'background.paper', gap: '30px', height: '450px', maxHeight: '550px', overflowY: 'scroll', p: '20px 40px' }}>
      {nftItems === undefined &&
        <Grid alignItems='center' container item justifyContent='center'>
          <Progress
            gridSize={120}
            title={t('Looking for NFTs!')}
            type='grid'
          />
        </Grid>
      }
      {nftItems?.map((nftInfo) => (
        <NFTItem key={nftInfo.nftId} nftInformation={nftInfo} />
      ))
      }
      {nftItems?.length === 0 &&
        <Grid alignItems='center' container item justifyContent='center'>
          <Typography fontSize='16px' fontWeight={400}>
            {t('You do not have any NFTs on your account')}!
          </Typography>
        </Grid>
      }
    </Grid>
  );
};

export default function NFT (): React.ReactElement {
  useFullscreen();
  const { t } = useTranslation();
  const theme = useTheme();
  const onAction = useContext(ActionContext);
  const { address } = useParams<{ address: string }>();
  const { api, formatted, genesisHash } = useInfo(address);

  const [step, setStep] = useState<STEPS>(STEPS.CHECK_SCREEN);
  const [myNFTsDetails, setMyNFTs] = useState<NFTInformation[] | undefined>(undefined);

  const unsupportedChain = useMemo(() => !!(genesisHash && !(NFT_CHAINS.includes(genesisHash))), [genesisHash]);

  const reset = useCallback(() => {
    setMyNFTs(undefined);
    setStep(STEPS.CHECK_SCREEN);
  }, []);

  const fetchNFTs = useCallback(async (api: ApiPromise, formatted: string) => {
    try {
      const nftEntries = await api.query['nfts']['item'].entries();

      const myNFTs = nftEntries
        .filter(([_ntfId, nftInfo]) => {
          const info = nftInfo.toPrimitive() as unknown as PalletNftsItemDetails;

          return [String(info.deposit.account), String(info.owner)].includes(formatted);
        })
        .map(([ntfId, nftInfo]) => {
          const sanitizedId = (ntfId?.toHuman() as string[]).map((id) => id.replaceAll(',', ''));

          return {
            ids: {
              collectionId: sanitizedId[0],
              nftId: sanitizedId[1]
            },
            nftInfo: nftInfo.toPrimitive() as unknown as PalletNftsItemDetails
          };
        });

      const nftMetadataPromises = myNFTs.map(({ ids }) =>
        api.query['nfts']['itemMetadataOf'](ids.collectionId, ids.nftId)
      );
      const nftsMetadataRequests = await Promise.all(nftMetadataPromises);
      const nftsMetadata = nftsMetadataRequests.map((metadata) => (metadata.toPrimitive() as unknown as PalletNftsItemMetadata)?.data.toString());

      const nftInfos = myNFTs.map(({ ids }, index) => ({
        collectionId: ids.collectionId,
        data: nftsMetadata[index],
        nftId: ids.nftId
      }));

      setMyNFTs(nftInfos);
      setStep(STEPS.INDEX);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    }
  }, []);

  useEffect(() => {
    reset();
  }, [address, genesisHash, reset]);

  useEffect(() => {
    if (unsupportedChain) {
      return setStep(STEPS.UNSUPPORTED);
    } else if (!api || !formatted) {
      return setStep(STEPS.CHECK_SCREEN);
    } else if (!api.query['nfts']?.['item']) {
      return setStep(STEPS.UNSUPPORTED);
    } else if (myNFTsDetails) {
      return;
    }

    setStep(STEPS.CHECK_SCREEN);
    fetchNFTs(api, formatted).catch(console.error);
  }, [api, fetchNFTs, formatted, genesisHash, myNFTsDetails, unsupportedChain]);

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
            text={t('NFT Album')}
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
                  {t('The chosen blockchain does not support NFTs.')}
                </Warning>
              </Grid>
            </Grid>
          }
          {[STEPS.INDEX, STEPS.CHECK_SCREEN].includes(step) &&
            <>
              <Typography fontSize='14px' fontWeight={400}>
                {t('In NFT Album page you view all your created and owned NFTs.')}
              </Typography>
              <FilterSection
                onCreated={noop}
                onMyCollection={noop}
                onOwn={noop}
                onSearch={noop}
              />
              <NFTItemList
                nftItems={myNFTsDetails}
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
