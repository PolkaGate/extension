// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TxInfo } from '../../../util/types';

import { Container, Divider, Grid, Typography } from '@mui/material';
import React from 'react';

import { AccountWithProxyInConfirmation, DisplayInfo, PButton, ShortAddress } from '../../../components';
import { useInfo, useTranslation } from '../../../hooks';
import { SubTitle } from '../../../partials';
import Explorer from '../../../popup/history/Explorer';
import FailSuccessIcon from '../../../popup/history/partials/FailSuccessIcon';

interface Props {
  address: string | undefined;
  txInfo: TxInfo;
  showConfirmation: boolean;
  onPrimaryBtnClick: () => void;
}

export default function Confirmation({ address, onPrimaryBtnClick, txInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { chainName, token } = useInfo(address);

  const fee = txInfo.api.createType('Balance', txInfo.fee);

  return (
    <Container disableGutters>
      <SubTitle label={txInfo.success ? t('Completed') : t('Failed')} style={{ paddingTop: '25px' }} />
      <FailSuccessIcon
        showLabel={false}
        style={{ fontSize: '87px', margin: `${txInfo?.failureText ? 15 : 20}px auto`, textAlign: 'center', width: 'fit-content' }}
        success={txInfo.success}
      />
      {txInfo?.failureText &&
        <Typography fontSize='16px' fontWeight={400} m='auto' sx={{ WebkitBoxOrient: 'vertical', WebkitLineClamp: '2', display: '-webkit-box', mb: '15px', overflow: 'hidden', textOverflow: 'ellipsis' }} textAlign='center' width='92%'>
          {txInfo.failureText}
        </Typography>
      }
      <AccountWithProxyInConfirmation
        txInfo={txInfo}
      />
      <Grid alignItems='center' container item justifyContent='center' pt='8px'>
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', width: '240px' }} />
      </Grid>
      <DisplayInfo
        caption={t('Unlock value:')}
        value={t(`${txInfo.amount || ''} {{token}}`, { replace: { token } })}
      />
      <DisplayInfo caption={t('Fee:')} value={fee?.toHuman() ?? '00.00'} />
      {txInfo?.txHash &&
        <Grid alignItems='center' container fontSize='16px' fontWeight={400} justifyContent='center' pt='8px'>
          <Grid container item width='fit-content'>
            <Typography pr='5px'>{t('Hash')}:</Typography>
          </Grid>
          <Grid container item width='fit-content'>
            <ShortAddress
              address={txInfo.txHash}
              charsCount={6}
              showCopy
              style={{ fontSize: '16px' }}
            />
          </Grid>
        </Grid>
      }
      {
        txInfo?.txHash && chainName &&
        <Grid container justifyContent='center' pt='5px'>
          <Explorer chainName={chainName} txHash={txInfo?.txHash} />
        </Grid>
      }
      <PButton
        _ml={0}
        _mt='50px'
        _onClick={onPrimaryBtnClick}
        _width={100}
        text={txInfo.success ? t('Done') : t('Close')}
      />
    </Container>
  );
}
