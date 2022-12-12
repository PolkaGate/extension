// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Chain } from '@polkadot/extension-chains/types';
import type { Call, ExtrinsicEra, ExtrinsicPayload } from '@polkadot/types/interfaces';
import type { AnyJson, SignerPayloadJSON } from '@polkadot/types/types';

import { Grid, Typography } from '@mui/material';
import { TFunction } from 'i18next';
import React, { useMemo, useRef } from 'react';

import { BN, bnToBn, formatNumber } from '@polkadot/util';

import { ShortAddress } from '../../components';
import { useMetadata, useTranslation } from '../../hooks';

interface Decoded {
  args: AnyJson | null;
  method: Call | null;
}

interface Props {
  payload: ExtrinsicPayload;
  request: SignerPayloadJSON;
  url: string;
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

    args = null;
    method = null;
  }

  return { args, method };
}

function renderMethod(data: string, { args, method }: Decoded, t: TFunction): React.ReactNode {
  if (!args || !method) {
    return (
      <Grid alignItems='center' container item sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.light', minHeight: '36px', px: '8px' }}>
        <Typography fontWeight={300} width='35%'>{t<string>('Method data')}</Typography>
        <ShortAddress charsCount={6} address={data} showCopy style={{ fontWeight: 400, justifyContent: 'flex-end', textAlign: 'right', width: '65%' }} />
      </Grid>
    );
  }

  return (
    <>
      <tr>
        <td className='label'>{t<string>('method')}</td>
        <td className='data'>
          <details>
            <summary>{method.section}.{method.method}{
              method.meta
                ? `(${method.meta.args.map(({ name }) => name).join(', ')})`
                : ''
            }</summary>
            <pre>{JSON.stringify(args, null, 2)}</pre>
          </details>
        </td>
      </tr>
      {method.meta && (
        <tr>
          <td className='label'>{t<string>('info')}</td>
          <td className='data'>
            <details>
              <summary>{method.meta.docs.map((d) => d.toString().trim()).join(' ')}</summary>
            </details>
          </td>
        </tr>
      )}
    </>
  );
}

function mortalityAsString(era: ExtrinsicEra, hexBlockNumber: string, t: TFunction): string {
  if (era.isImmortalEra) {
    return t<string>('immortal');
  }

  const blockNumber = bnToBn(hexBlockNumber);
  const mortal = era.asMortalEra;

  return t<string>('mortal, valid from {{birth}} to {{death}}', {
    replace: {
      birth: formatNumber(mortal.birth(blockNumber)),
      death: formatNumber(mortal.death(blockNumber))
    }
  });
}

function Extrinsic({ payload: { era, nonce, tip }, request: { blockNumber, genesisHash, method, specVersion: hexSpec }, url }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const chain = useMetadata(genesisHash);
  const specVersion = useRef(bnToBn(hexSpec)).current;
  const decoded = useMemo(
    () => chain && chain.hasMetadata
      ? decodeMethod(method, chain, specVersion)
      : { args: null, method: null },
    [method, chain, specVersion]
  );

  const firstSlash = url.indexOf('/');
  const secondSlash = url.indexOf('/', firstSlash + 1);
  const thirdSlash = url.indexOf('/', secondSlash + 1);
  const final = url.substring(0, thirdSlash);

  return (
    <Grid container fontSize='16px' sx={{ '> div:last-child': { border: 'none' }, bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', m: '15px auto', width: '92%' }}>
      <Grid alignItems='center' container item sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.light', minHeight: '36px', px: '8px' }}>
        <Typography fontWeight={300} width='35%'>{t<string>('From')}</Typography>
        <Typography fontWeight={400} textAlign='right' width='65%'>{final}</Typography>
      </Grid>
      <Grid alignItems='center' container item sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.light', minHeight: '36px', px: '8px' }}>
        <Typography fontWeight={300} width='35%'>{chain ? t<string>('Chain') : t<string>('Genesis')}</Typography>
        {chain
          ? <Typography fontWeight={400} textAlign='right' width='65%'>{chain.name}</Typography>
          : <ShortAddress charsCount={6} address={genesisHash} showCopy style={{ fontWeight: 400, justifyContent: 'flex-end', textAlign: 'right', width: '65%' }} />
        }
      </Grid>
      <Grid alignItems='center' container item sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.light', minHeight: '36px', px: '8px' }}>
        <Typography fontWeight={300} width='35%'>{t<string>('Version')}</Typography>
        <Typography fontWeight={400} textAlign='right' width='65%'>{specVersion.toNumber()}</Typography>
      </Grid>
      <Grid alignItems='center' container item sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.light', minHeight: '36px', px: '8px' }}>
        <Typography fontWeight={300} width='35%'>{t<string>('Nonce')}</Typography>
        <Typography fontWeight={400} textAlign='right' width='65%'>{formatNumber(nonce)}</Typography>
      </Grid>
      {!tip.isEmpty && (
        <Grid alignItems='center' container item sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.light', minHeight: '36px', px: '8px' }}>
          <Typography fontWeight={300} width='35%'>{t<string>('Tip')}</Typography>
          <Typography fontWeight={400} textAlign='right' width='65%'>{formatNumber(tip)}</Typography>
        </Grid>
      )}
      {renderMethod(method, decoded, t)}
      <Grid alignItems='center' container item sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.light', minHeight: '36px', px: '8px' }}>
        <Typography fontWeight={300} width='35%'>{t<string>('Lifetime')}</Typography>
        <Typography fontWeight={400} textAlign='right' width='65%'>{mortalityAsString(era, blockNumber, t)}</Typography>
      </Grid>
    </Grid>
  );
}

export default React.memo(Extrinsic);
