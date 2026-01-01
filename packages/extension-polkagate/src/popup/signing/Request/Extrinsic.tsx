// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Chain } from '@polkadot/extension-chains/types';
import type { Balance, Call, ExtrinsicPayload } from '@polkadot/types/interfaces';
import type { AnyJson, SignerPayloadJSON } from '@polkadot/types/types';
import type { BN } from '@polkadot/util';

import { Avatar, Grid, Stack, Typography, useTheme } from '@mui/material';
import { Warning2 } from 'iconsax-react';
import React, { useCallback, useMemo, useRef } from 'react';

import { bnToBn } from '@polkadot/util';

import { ChainLogo, DecisionButtons, DisplayBalance, FormatPrice, Identity2, TwoToneText } from '../../../components';
import { useAccountAssets, useAllChains, useChainInfo, useEstimatedFee, useFavIcon, useMetadata, useSelectedChains, useTokenPrice, useTranslation } from '../../../hooks';
import { amountToHuman, getSubstrateAddress, isOnAssetHub } from '../../../util';
import { NATIVE_TOKEN_ASSET_ID, NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB } from '../../../util/constants';
import { getValue } from '../../account/util';
import { type ModeData, SIGN_POPUP_MODE } from '../types';
import RequestContent from './requestContent';

interface Decoded {
  args: AnyJson | null;
  method: Call | null;
}

interface Props {
  payload: ExtrinsicPayload;
  signerPayload: SignerPayloadJSON;
  url: string;
  onCancel: () => void;
  setMode: React.Dispatch<React.SetStateAction<ModeData>>
}

function displayDecodeVersion (message: string, chain: Chain, specVersion: BN): string {
  return `${message}: chain=${chain.name}, specVersion=${chain.specVersion.toString()} (request specVersion=${specVersion.toString()})`;
}

function decodeMethod (data: string, chain: Chain, specVersion: BN): Decoded {
  let args: AnyJson | null = null;
  let method: Call | null = null;

  try {
    if (specVersion.eqn(chain.specVersion)) {
      method = chain.registry.createType('Call', data);
      args = (method.toHuman() as { args: AnyJson }).args;
    } else {
      console.log(displayDecodeVersion('Outdated metadata to decode', chain, specVersion));
    }
  } catch (error) {
    console.error(`${displayDecodeVersion('Error decoding method', chain, specVersion)}:: ${(error as Error).message}`);
  }

  return { args, method };
}

function FeeRow ({ fee, genesisHash }: { fee: Balance | undefined, genesisHash: string }): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { decimal } = useChainInfo(genesisHash);
  const { price } = useTokenPrice(genesisHash);

  return (
    <Grid alignItems='center' container item justifyContent='space-between' sx={{ '&::after': { background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', bottom: 0, content: '""', height: '1px', left: 0, position: 'absolute', width: '100%' }, bottom: '-33px', p: '10px', position: 'relative' }}>
      <Typography color='#AA83DC' variant='B-1'>
        {t('Estimated Fee')}
      </Typography>
      <Stack alignItems='center' columnGap='5px' direction='row' lineHeight='normal'>
        <FormatPrice
          commify
          decimalColor='#EAEBF1'
          decimalPoint={4}
          fontFamily='Inter'
          fontSize='13px'
          fontWeight={500}
          num={fee ? amountToHuman(fee?.muln(price ?? 0), decimal) : undefined}
          skeletonHeight={21}
          textColor='#EAEBF1'
        />
        <Typography color='#AA83DC' variant='B-1'>
          {fee?.toHuman()}
        </Typography>
      </Stack>
    </Grid>
  );
}

function DappRow ({ url }: { url: string }): React.ReactElement<Props> {
  const dapp = new URL(url).origin;
  const faviconUrl = useFavIcon(dapp);

  return (
    <Grid alignItems='center' columnGap='5px' container direction='row' item justifyContent='center' sx={{ bgcolor: '#05091C80', borderRadius: '14px', height: '34px', pr: '5px', width: 'fit-content' }}>
      <Avatar
        src={faviconUrl ?? undefined}
        sx={{ borderRadius: '8px !important', height: '26px', width: '26px' }}
        variant='circular'
      />
      <Typography color='#BEAAD8' variant='B-1'>
        {dapp}
      </Typography>
    </Grid>
  );
}

function Extrinsic ({ onCancel, setMode, signerPayload: { address, genesisHash, method, specVersion: hexSpec }, url }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const allChains = useAllChains();
  const selectedChains = useSelectedChains();

  const chain = useMetadata(genesisHash);
  const { api, chainName, decimal, token } = useChainInfo(genesisHash);

  const substrateAddress = getSubstrateAddress(address);

  const accountAssets = useAccountAssets(substrateAddress);
  const specVersion = useMemo(() => bnToBn(hexSpec), [hexSpec]);

  const decoded = useMemo(() => chain?.hasMetadata ? decodeMethod(method, chain, specVersion) : { args: null, method: null }, [method, chain, specVersion]);
  const isNetworkSupported = useMemo(() => genesisHash && allChains.find((c) => c.genesisHash === genesisHash), [allChains, genesisHash]);
  const isNetworkEnabled = useMemo(() => genesisHash && selectedChains && selectedChains.includes(genesisHash), [genesisHash, selectedChains]);

  const call = useMemo(
    () => (api && decoded?.method)
      ? api.tx?.[decoded.method.section as keyof typeof api.tx]?.[decoded.method.method]
      : undefined,
    [api, decoded?.method]
  );
  const fee = useEstimatedFee(
    genesisHash,
    substrateAddress,
    call,
    decoded.method ? decoded.method.args : []
  );

  const nativeAssetId = isOnAssetHub(genesisHash) ? NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB : NATIVE_TOKEN_ASSET_ID;
  const nativeAssetBalance = accountAssets?.find((asset) => asset.genesisHash === genesisHash && asset.assetId === nativeAssetId);

  const onNext = useCallback(() => {
    setMode({
      fee,
      title: t('Your Signature'),
      type: SIGN_POPUP_MODE.SIGN
    });
  }, [fee, setMode, t]);

  const noMetadata = !chainName;
  const missingInfo = (isNetworkSupported && isNetworkEnabled === false) || noMetadata;

  return (
    <Grid container display='block' fontSize='16px' justifyContent='center' justifyItems='center' minHeight='450px' position='relative'>
      <DappRow
        url={url}
      />
      <Grid alignItems='center' columnGap='5px' container direction='row' item justifyContent='space-between' sx={{ m: '20px 0 15px' }}>
        <Identity2
          address={address}
          addressStyle={{ color: 'text.secondary', variant: 'B-4' }}
          charsCount={4}
          genesisHash={genesisHash ?? ''}
          identiconSize={36}
          inTitleCase
          showSocial={false}
          style={{
            backgroundColor: '#05091C',
            borderRadius: '14px',
            color: theme.palette.text.primary,
            height: '56px',
            paddingLeft: '10px',
            variant: 'B-2',
            width: '45%'
          }}
          withShortAddress
        />
        <Typography color='#AA83DC' fontSize='13px' textTransform='uppercase' variant='B-2'>
          {t('on')}
        </Typography>
        <Stack alignItems='center' columnGap='5px' direction='row' sx={{ bgcolor: '#05091C', borderRadius: '14px', height: '56px', pl: '10px', width: '45%' }}>
          <ChainLogo genesisHash={genesisHash} size={36} />
          <Stack alignItems='flex-start' width='90px'>
            <Typography color='#EAEBF1' sx={{ overflow: 'hidden', textAlign: 'left', textOverflow: 'ellipsis', width: '95%' }} variant='B-2'>
              {chainName || t('Unknown')}
            </Typography>
            {api !== null && !missingInfo &&
              <DisplayBalance
                balance={nativeAssetBalance ? getValue('transferable', nativeAssetBalance) : undefined}
                decimal={decimal}
                style={{ color: '#BEAAD8', ...theme.typography['B-4'] }}
                token={token}
              />
            }
          </Stack>
        </Stack>
      </Grid>
      {decoded.method &&
        <>
          <Stack direction='row' justifyContent='space-between' width='100%'>
            <Typography color='#674394' variant='B-2'>
              {t('Request content')}
            </Typography>
          </Stack>
          <RequestContent
            decoded={decoded}
            genesisHash={genesisHash}
            setMode={setMode}
          />
        </>
      }
      {fee !== null && !missingInfo &&
        <FeeRow
          fee={fee}
          genesisHash={genesisHash}
        />
      }
      {missingInfo &&
        <Grid alignItems='center' columnGap='5px' container item sx={{ bottom: '125px', position: 'absolute' }}>
          <Warning2 color='#FFCE4F' size='24px' variant='Bold' />
          <Typography color='#EAEBF1' textAlign='left' variant='B-4' width='90%'>
            <TwoToneText
              color={theme.palette.primary.main}
              text={noMetadata
                ? t('No metadata found for this chain. Please update metadata')
                : t('Enable the {{chainName}} network to view transaction detail. Go to Settings → Networks', { replace: { chainName } })
              }
              textPartInColor={noMetadata
                ? t('metadata')
                : 'Settings → Networks'
              }
            />
          </Typography>
        </Grid>
      }
      <DecisionButtons
        direction='vertical'
        onPrimaryClick={onNext}
        onSecondaryClick={onCancel}
        primaryBtnText={t('Next')}
        secondaryBtnText={t('Cancel')}
        style={{ bottom: '0px', position: 'absolute' }}
      />
    </Grid>
  );
}

export default React.memo(Extrinsic);
