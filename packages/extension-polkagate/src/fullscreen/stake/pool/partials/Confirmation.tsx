// Copyright 2019-2024 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, Typography } from '@mui/material';
import React from 'react';

import { Motion, PButton, ShortAddress } from '../../../../components';
import { useTranslation } from '../../../../hooks';
import Explorer from '../../../../popup/history/Explorer';
import FailSuccessIcon from '../../../../popup/history/partials/FailSuccessIcon';
import { TxInfo } from '../../../../util/types';

interface Props {
  txInfo: TxInfo;
  handleClose: () => void;
  children: React.ReactNode;
  modalHeight?: number;
}

export default function Confirmation({ children, handleClose, modalHeight, txInfo }: Props): React.ReactElement {
  const { t } = useTranslation();

  const chainName = txInfo.chain.name.replace(' Relay Chain', '');
  const fee = txInfo.api.createType('Balance', txInfo.fee);

  const DisplayInfo = ({ caption, showDivider = true, value }: { caption: string, value: string, showDivider?: boolean }) => {
    return (
      <Grid alignItems='center' container direction='column' fontSize='16px' fontWeight={400} justifyContent='center'>
        <Grid container item width='fit-content'>
          <Typography lineHeight='40px' pr='5px'>{caption}</Typography>
          <Typography lineHeight='40px'>{value}</Typography>
        </Grid>
        {showDivider &&
          <Grid alignItems='center' container item justifyContent='center'>
            <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mx: '6px', width: '240px' }} />
          </Grid>}
      </Grid>
    );
  };

  return (
    <Motion style={{ height: modalHeight ? `${modalHeight - 120}px` : 'auto', width: '100%' }}>
      <Grid>
        <FailSuccessIcon
          showLabel={false}
          style={{ fontSize: '87px', m: `${txInfo?.failureText ? 15 : 20}px auto`, textAlign: 'center', width: 'fit-content' }}
          success={txInfo.success}
        />
        {txInfo?.failureText &&
          <Typography fontSize='16px' fontWeight={400} m='auto' sx={{ WebkitBoxOrient: 'vertical', WebkitLineClamp: '2', display: '-webkit-box', mb: '15px', overflow: 'hidden', textOverflow: 'ellipsis' }} textAlign='center' width='92%'>
            {txInfo.failureText}
          </Typography>
        }
        {children}
        <DisplayInfo caption={t<string>('Fee:')} value={fee?.toHuman() ?? '00.00'} />
        {txInfo?.txHash &&
          <Grid alignItems='center' container fontSize='16px' fontWeight={400} justifyContent='center' pt='8px'>
            <Grid container item width='fit-content'>
              <Typography pr='5px'>{t<string>('Hash')}:</Typography>
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
        <PButton
          _ml={0}
          _mt='30px'
          _onClick={handleClose}
          _width={100}
          text={t<string>('Done')}
        />
      </Grid>
    </Motion>
  );
}
