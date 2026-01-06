// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SigningRequest } from '@polkadot/extension-base/background/types';
import type { Chain } from '@polkadot/extension-chains/types';
import type { Call, ExtrinsicPayload } from '@polkadot/types/interfaces';
import type { AnyJson, SignerPayloadJSON } from '@polkadot/types/types';
import type { BN } from '@polkadot/util';
import type { HexString } from '@polkadot/util/types';

import { Avatar, Grid, Stack, Typography, useTheme } from '@mui/material';
import { Warning2 } from 'iconsax-react';
import React, { useEffect, useMemo, useState } from 'react';

import { bnToBn } from '@polkadot/util';

import { ChainLogo, DisplayBalance, Identity2, TwoToneText } from '../../../components';
import { useAccountAssets, useAllChains, useChainInfo, useEstimatedFee, useFavIcon, useIsExtensionPopup, useMetadata, useSelectedChains, useTranslation } from '../../../hooks';
import { getAndWatchStorage, getSubstrateAddress, isOnAssetHub } from '../../../util';
import { NATIVE_TOKEN_ASSET_ID, NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB, STORAGE_KEY } from '../../../util/constants';
import { getValue } from '../../account/util';
import Confirm from '../Confirm';
import { type Decoded, type ModeData } from '../types';
import AiInsight from './AiInsight';
import { AiInsightErrorBoundary } from './AiInsightErrorBoundary';
import RequestContent from './requestContent';

interface Props {
  payload: ExtrinsicPayload;
  signerPayload: SignerPayloadJSON;
  url: string;
  onCancel: () => void;
  setMode: React.Dispatch<React.SetStateAction<ModeData>>;
  onSignature: ({ signature }: { signature: HexString }) => void;
  request: SigningRequest;
}

function displayDecodeVersion(message: string, chain: Chain, specVersion: BN): string {
  return `${message}: chain=${chain.name}, specVersion=${chain.specVersion.toString()} (request specVersion=${specVersion.toString()})`;
}

function decodeMethod(data: string, chain: Chain, specVersion: BN): Decoded {
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

function DappRow({ url }: { url: string }) {
  const dapp = new URL(url).origin;
  const faviconUrl = useFavIcon(dapp);

  return (
    <Grid alignItems='center' columnGap='5px' container direction='row' item justifyContent='center' sx={{ bgcolor: '#05091C80', borderRadius: '14px', height: '34px', m: 'auto', pr: '5px', width: 'fit-content' }}>
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

interface SignerContextProps {
  address: string;
  genesisHash: HexString;
  showBalance?: boolean;
}

function SignerContext({ address, genesisHash, showBalance = true }: SignerContextProps): React.ReactElement {
  const theme = useTheme();
  const { t } = useTranslation();
  const { chainName, decimal, token } = useChainInfo(genesisHash);

  const substrateAddress = getSubstrateAddress(address);
  const accountAssets = useAccountAssets(substrateAddress);
  const nativeAssetId = isOnAssetHub(genesisHash) ? NATIVE_TOKEN_ASSET_ID_ON_ASSETHUB : NATIVE_TOKEN_ASSET_ID;
  const nativeAssetBalance = accountAssets?.find((asset) => asset.genesisHash === genesisHash && asset.assetId === nativeAssetId);

  return (
    <Grid alignItems='center' columnGap='5px' container direction='row' item justifyContent='space-between'>
      <Identity2
        address={address}
        addressStyle={{ color: 'text.secondary', variant: 'B-4' }}
        charsCount={4}
        genesisHash={genesisHash}
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
          {showBalance &&
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
  );
}

function Extrinsic({ onCancel, onSignature, payload, request, setMode, signerPayload: { address, genesisHash, method, specVersion: hexSpec }, url }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const allChains = useAllChains();
  const selectedChains = useSelectedChains();
  const isExtension = useIsExtensionPopup();

  const chain = useMetadata(genesisHash);
  const { api, chainName } = useChainInfo(genesisHash);

  const [enabled, setEnabled] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = getAndWatchStorage(STORAGE_KEY.AI_TX_INFO, setEnabled);

    return () => unsubscribe();
  }, []);

  const substrateAddress = getSubstrateAddress(address);

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

  const noMetadata = !chainName;
  const missingInfo = (isNetworkSupported && isNetworkEnabled === false) || noMetadata;

  return (
    <>
      <DappRow
        url={url}
      />
      <Stack direction='column' sx={{ bgcolor: isExtension ? '#1B133C' : 'unset', borderRadius: '16px', mt: '20px', p: '4px' }}>
        <SignerContext
          address={address}
          genesisHash={genesisHash}
          showBalance={api !== null && !missingInfo}
        />
        {decoded.method &&
          <>
            <Stack direction='row' justifyContent='space-between' sx={{ my: '6px', width: '100%' }}>
              <Typography color='#674394' variant='B-2'>
                {t('Request content')}
              </Typography>
              {enabled &&
                <AiInsightErrorBoundary>
                  <AiInsight
                    decoded={decoded}
                    genesisHash={genesisHash}
                    url={url}
                  />
                </AiInsightErrorBoundary>
              }
            </Stack>
            <RequestContent
              decoded={decoded}
              genesisHash={genesisHash}
              setMode={setMode}
            />
          </>
        }
      </Stack>
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
      <Confirm
        extrinsicPayload={payload}
        fee={missingInfo ? null : fee}
        onCancel={onCancel}
        onSignature={onSignature}
        request={request}
        signWithPasswordStyle={isExtension ? undefined : { inset: '15px', top: 'unset', width: 'unset' }}
      />
    </>
  );
}

export default React.memo(Extrinsic);
