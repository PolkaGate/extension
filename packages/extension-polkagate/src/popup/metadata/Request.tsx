// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MetadataDef } from '@polkadot/extension-inject/types';

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import { ActionContext, TwoButtons, Warning } from '../../components';
import { useMetadata, useTranslation } from '../../hooks';
import { approveMetaRequest, rejectMetaRequest } from '../../messaging';

interface Props {
  request: MetadataDef;
  metaId: string;
  url: string;
}

export default function Request({ metaId, request, url }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const chain = useMetadata(request.genesisHash, true);
  const onAction = useContext(ActionContext);
  const theme = useTheme();

  const _onApprove = useCallback(
    (): void => {
      approveMetaRequest(metaId)
        .then(() => onAction())
        .catch(console.error);
    },
    [metaId, onAction]
  );

  const _onReject = useCallback(
    (): void => {
      rejectMetaRequest(metaId)
        .then(() => onAction())
        .catch(console.error);
    },
    [metaId, onAction]
  );

  const firstSlash = url.indexOf('/');
  const secondSlash = url.indexOf('/', firstSlash + 1);
  const thirdSlash = url.indexOf('/', secondSlash + 1);
  const final = url.substring(0, thirdSlash);

  return (
    <>
      <Grid container fontSize='16px' sx={{ '> div:last-child': { border: 'none' }, bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px', m: '15px auto', width: '92%' }}>
        <Grid alignItems='center' container item sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.light', minHeight: '36px', px: '8px' }}>
          <Typography fontWeight={300} width='35%'>{t<string>('from')}</Typography>
          <Typography fontWeight={400} textAlign='right' width='65%'>{final}</Typography>
        </Grid>
        <Grid alignItems='center' container item sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.light', minHeight: '36px', px: '8px' }}>
          <Typography fontWeight={300} width='35%'>{t<string>('chain')}</Typography>
          <Typography fontWeight={400} textAlign='right' width='65%'>{request.chain}</Typography>
        </Grid>
        <Grid alignItems='center' container item sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.light', minHeight: '36px', px: '8px' }}>
          <Typography fontWeight={300} width='35%'>{t<string>('icon')}</Typography>
          <Typography fontWeight={400} textAlign='right' width='65%'>{request.icon}</Typography>
        </Grid>
        <Grid alignItems='center' container item sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.light', minHeight: '36px', px: '8px' }}>
          <Typography fontWeight={300} width='35%'>{t<string>('decimals')}</Typography>
          <Typography fontWeight={400} textAlign='right' width='65%'>{request.tokenDecimals}</Typography>
        </Grid>
        <Grid alignItems='center' container item sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.light', minHeight: '36px', px: '8px' }}>
          <Typography fontWeight={300} width='35%'>{t<string>('symbol')}</Typography>
          <Typography fontWeight={400} textAlign='right' width='65%'>{request.tokenSymbol}</Typography>
        </Grid>
        <Grid alignItems='center' container item sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.light', minHeight: '36px', px: '8px' }}>
          <Typography fontWeight={300} width='35%'>{t<string>('upgrade')}</Typography>
          <Typography fontWeight={400} textAlign='right' width='65%'>{chain ? chain.specVersion : t('<unknown>')} -&gt; {request.specVersion}</Typography>
        </Grid>
      </Grid>
      <Grid
        height='80px'
        m='auto'
        width='96%'
      >
        <Warning
          fontWeight={400}
          iconDanger
          isBelowInput
          theme={theme}
        >
          {t<string>('This approval will add the metadata to your extension instance, allowing future requests to be decoded using this metadata.')}
        </Warning>
      </Grid>
      <TwoButtons onPrimaryClick={_onApprove} onSecondaryClick={_onReject} primaryBtnText={t<string>('Approve')} secondaryBtnText={t<string>('Reject')} variant='text' />
    </>
  );
}
