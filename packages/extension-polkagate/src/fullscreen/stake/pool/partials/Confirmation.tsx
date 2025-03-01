// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TxInfo } from '../../../../util/types';

import { Grid, Typography } from '@mui/material';
import React from 'react';

import { DisplayInfo, Motion, PButton, ShortAddress } from '../../../../components';
import { useTranslation } from '../../../../hooks';
import Explorer from '../../../../popup/history/Explorer';
import FailSuccessIcon from '../../../../popup/history/partials/FailSuccessIcon';

interface Props {
  txInfo: TxInfo;
  handleClose: () => void;
  children: React.ReactNode;
  popupHeight: number;
}

const unAvailableSpace = 120;

export default function Confirmation({ children, handleClose, popupHeight, txInfo }: Props): React.ReactElement {
  const { t } = useTranslation();

  const chainName = txInfo.chain.name.replace(' Relay Chain', '');
  const fee = txInfo.api.createType('Balance', txInfo.fee);

  return (
    <Motion style={{ height: `${popupHeight - unAvailableSpace}px`, position: 'relative', width: '100%' }}>
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
      {children}
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
      {txInfo?.txHash &&
        <Grid container justifyContent='center' pt='5px'>
          <Explorer chainName={chainName} txHash={txInfo?.txHash} />
        </Grid>
      }
      <Grid container item sx={{ bottom: 0, height: '120px', position: 'absolute' }}>
        <PButton
          _ml={0}
          _mt='30px'
          _onClick={handleClose}
          _width={100}
          text={txInfo.success ? t('Done') : t('Close')}
        />
      </Grid>
    </Motion>
  );
}
