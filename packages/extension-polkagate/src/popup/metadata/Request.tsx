// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MetadataDef } from '@polkadot/extension-inject/types';

import { Box, Grid, Stack, Typography } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import { toShortAddress, toTitleCase } from '@polkadot/extension-polkagate/src/util';

import { ActionContext, DecisionButtons } from '../../components';
import { useMetadata, useTranslation } from '../../hooks';
import { approveMetaRequest, rejectMetaRequest } from '../../messaging';

interface Props {
  request: MetadataDef;
  metaId: string;
  url: string;
}

function ItemValue ({ item, value }: { item: string, value: string }): React.ReactElement<Props> {
  return (
    <>
      <Grid alignItems='center' container item justifyContent='space-between' sx={{ minHeight: '36px', px: '8px' }}>
        <Typography color= '#AA83DC' variant='B-4'>
          {toTitleCase(item)}
        </Typography>
        <Typography color='#EAEBF1' sx={{ mr: '3px' }} variant='B-4'>
          {value}
        </Typography>
      </Grid>
      <Box sx={{ background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', height: '1px', width: '345px' }} />
    </>
  );
}

export default function Request ({ metaId, request, url }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const chain = useMetadata(request.genesisHash, true);
  const onAction = useContext(ActionContext);

  const onApprove = useCallback(
    (): void => {
      approveMetaRequest(metaId)
        .then(() => onAction('/'))
        .catch(console.error);
    },
    [metaId, onAction]
  );

  const onReject = useCallback(
    (): void => {
      rejectMetaRequest(metaId)
        .then(() => onAction('/'))
        .catch(console.error);
    },
    [metaId, onAction]
  );

  const firstSlash = url.indexOf('/');
  const secondSlash = url.indexOf('/', firstSlash + 1);
  const thirdSlash = url.indexOf('/', secondSlash + 1);
  const from = url.substring(0, thirdSlash);

  return (
    <>
      <Grid container fontSize='16px' sx={{ m: '0 15px auto', width: '92%', zIndex: 100 }}>
        <Stack direction='row' justifyContent='space-between' sx={{ m: '10px 0 10px', p: '0 15px 0 5px', width: '100%' }}>
          <Typography color='#7956A5' sx={{ fontWeight: 600, textTransform: 'uppercase' }} variant='B-5'>
            {t('item')}
          </Typography>
          <Typography color='#7956A5' sx={{ fontWeight: 600, textTransform: 'uppercase' }} variant='B-5'>
            {t('value')}
          </Typography>
        </Stack>
        <ItemValue item={t('from')} value={from} />
        <ItemValue item={t('chain')} value={request.chain} />
        <ItemValue item={t('genesis hash')} value={toShortAddress(request.genesisHash, 6)} />
        <ItemValue item={t('icon')} value={request.icon} />
        <ItemValue item={t('decimals')} value={String(request.tokenDecimals)} />
        <ItemValue item={t('symbol')} value={request.tokenSymbol} />
        <ItemValue item={t('upgrade')} value={`${chain ? chain.specVersion : t('<unknown>')} => ${request.specVersion}`} />
      </Grid>
      <Typography color='#BEAAD8' sx={{ display: 'flex', p: ' 30px 10px 10px', textAlign: 'center', width: '100%' }} variant='B-4'>
        {t('This approval adds the metadata to your extension so future requests can be decoded with it')}
      </Typography>
      <DecisionButtons
        cancelButton
        direction='horizontal'
        onPrimaryClick={onApprove}
        onSecondaryClick={onReject}
        primaryBtnText={t('Approve')}
        secondaryBtnText={t('Reject')}
        style={{ marginTop: '25px', width: '92%' }}
      />
    </>
  );
}
