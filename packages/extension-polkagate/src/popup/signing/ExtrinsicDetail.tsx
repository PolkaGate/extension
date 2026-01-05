// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { RequestSign } from '@polkadot/extension-base/background/types';
import type { ExtrinsicPayload } from '@polkadot/types/interfaces';
import type { SignerPayloadJSON } from '@polkadot/types/types';

import { Grid, Stack, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { TypeRegistry } from '@polkadot/types';
import { formatNumber } from '@polkadot/util';

import { ActionButton, DisplayBalance } from '../../components';
import { useChainInfo, useTranslation } from '../../hooks';
import { toBN, toTitleCase } from '../../util';
import { type ModeData, SIGN_POPUP_MODE } from './types';

interface Data {
  hexBytes: string | null;
  payload: ExtrinsicPayload | null;
}

interface Props {
  request: RequestSign;
  mode: ModeData;
  setMode: React.Dispatch<React.SetStateAction<ModeData>>;
}

const registry = new TypeRegistry();
const STYLE = { '&::after': { background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', bottom: 0, content: '""', height: '1px', left: 0, position: 'absolute', width: '100%' }, p: '10px', position: 'relative' };

function ExtrinsicDetail({ mode: { data }, request, setMode }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const signerPayload = request.payload as SignerPayloadJSON;
  const [{ payload }, setData] = useState<Data>({ hexBytes: null, payload: null });

  useEffect((): void => {
    const payload = request.payload as SignerPayloadJSON;

    registry.setSignedExtensions(payload.signedExtensions);

    setData({
      hexBytes: null,
      payload: registry.createType('ExtrinsicPayload', payload, { version: payload.version })
    });
  }, [request]);

  const { decimal, token } = useChainInfo(signerPayload.genesisHash, true);

  const docs = useMemo(() => {
    if (!data?.meta?.docs) {
      return '';
    }

    const rawText = data.meta.docs.map((textObj) => textObj.toString()).join(' ');
    const regex = /\[`(.*?)`\]/g;

    return String(rawText).split(regex).map((part, index) => {
      if (index % 2 === 1) {
        return (
          <span key={index} style={{ color: '#82FFA5', fontFamily: 'JetBrainsMono', fontSize: '11px', fontWeight: '500' }}>
            {part}
          </span>
        );
      }

      return part;
    });
  }, [data]);

  const onBack = useCallback((): void => {
    setMode({
      data: undefined,
      title: t('Request Content'),
      type: SIGN_POPUP_MODE.REQUEST
    });
  }, [setMode, t]);

  return (
    <>
      <Grid container item sx={{ display: 'block', fontSize: '16px', justifyContent: 'center', justifyItems: 'center', maxHeight: '465px', minHeight: '465px', overflowY: 'auto' }}>
        <Grid alignItems='center' container item justifyContent='space-between' sx={STYLE}>
          <Typography color='#BEAAD8' fontSize='13px' variant='B-1'>
            {t('Tip')}
          </Typography>
          <DisplayBalance
            balance={toBN(payload?.tip ?? 0)}
            decimal={decimal}
            decimalPoint={3}
            style={{ color: '#EAEBF1' }}
            token={token}
          />
        </Grid>
        <Grid alignItems='center' container item justifyContent='space-between' sx={STYLE}>
          <Typography color='#BEAAD8' fontSize='13px' variant='B-1'>
            {t('Nonce')}
          </Typography>
          <Typography color='#EAEBF1' fontSize='13px' variant='B-1'>
            {formatNumber(payload?.nonce ?? 0)}
          </Typography>
        </Grid>
        <Grid alignItems='center' container item justifyContent='space-between' sx={STYLE}>
          <Typography color='#BEAAD8' fontSize='13px' variant='B-1'>
            {t('Pallet')}
          </Typography>
          <Typography color='#EAEBF1' fontSize='13px' variant='B-1'>
            {toTitleCase(data?.section)}
          </Typography>
        </Grid>
        <Grid alignItems='center' container item justifyContent='space-between' sx={{ p: '10px' }}>
          <Typography color='#BEAAD8' fontSize='13px' variant='B-1'>
            {t('Method')}
          </Typography>
          <Typography color='#EAEBF1' fontSize='13px' variant='B-1'>
            {toTitleCase(data?.method)}
          </Typography>
        </Grid>
        {!!data?.argsEntries?.length &&
          <Grid alignItems='start' container item sx={{ bgcolor: '#1B133C', borderRadius: '14px', p: '10px', pl: '20px' }}>
            <Typography color='#AA83DC' sx={{ '&::after': { background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', bottom: 0, content: '""', height: '1px', left: 0, position: 'absolute', width: '100%' }, mb: '10px', pb: '5px', position: 'relative', textAlign: 'left', width: '100%' }} textTransform='uppercase' variant='S-1'>
              {t('Arguments')}
            </Typography>
            <Grid container fontSize='11px' sx={{ overflowY: 'auto' }} textAlign='left'>
              {data?.argsEntries.map((entry, index) => {
                const [key, _type] = entry; // destructuring to get the key and type from argsEntries
                const value = data.args[index]; // Accessing the corresponding value from args

                return (
                  <div key={index}>
                    <Stack direction='row'>
                      <Typography color='#AA83DC' fontFamily='JetBrainsMono' fontSize='13px' fontWeight={500} sx={{ mr: '5px', width: 'max-content' }}>
                        {key}:
                      </Typography>
                      <Typography color='#EAEBF1' component='div' fontFamily='JetBrainsMono' fontSize='13px' fontWeight={500}>
                        {value !== null && typeof value === 'object'
                          ? <pre style={{ margin: 0 }}>
                            {JSON.stringify(value, null, 2)}
                          </pre>
                          : ` ${String(value)}`
                        }
                      </Typography>
                    </Stack>
                  </div>
                );
              })}
            </Grid>
          </Grid>
        }
        <Stack direction='column' sx={{ mx: '10px' }}>
          <Typography color='#BEAAD8' sx={{ m: '15px 0 5px', textAlign: 'left', width: '100%' }} variant='B-1'>
            {t('Documentation')}
          </Typography>
          <Typography color='#EAEBF1' sx={{ mb: '10px', pb: '5px', textAlign: 'left', width: '100%' }} variant='B-5'>
            {docs}
          </Typography>
        </Stack>
      </Grid>
      <ActionButton
        contentPlacement='center'
        onClick={onBack}
        style={{ height: '44px', marginTop: '5px', width: '100%' }}
        text={t('Back')}
      />
    </>
  );
}

export default React.memo(ExtrinsicDetail);
