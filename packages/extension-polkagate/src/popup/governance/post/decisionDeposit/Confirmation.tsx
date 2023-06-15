// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, Typography } from '@mui/material';
import React from 'react';

import { Motion, PButton, ShortAddress } from '../../../../components';
import { useToken, useTranslation } from '../../../../hooks';
import { ThroughProxy } from '../../../../partials';
import Explorer from '../../../../popup/history/Explorer';
import FailSuccessIcon from '../../../../popup/history/partials/FailSuccessIcon';
import { TxInfo } from '../../../../util/types';

interface Props {
  address: string | undefined;
  txInfo: TxInfo;
  handleClose: () => void
  refIndex: number;
}

export default function Confirmation({ address, handleClose, refIndex, txInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const token = useToken(address);

  const chainName = txInfo.chain.name.replace(' Relay Chain', '');
  const fee = txInfo.api.createType('Balance', txInfo.fee);
  const amount = txInfo.api.createType('Balance', txInfo.amount);

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
    <Motion style={{ height: '100%' }}>
      <Grid container sx={{ width: '100%' }}>
        <FailSuccessIcon
          showLabel={false}
          style={{ fontSize: '87px', m: `${txInfo?.failureText ? 15 : 20}px auto`, textAlign: 'center', width: 'fit-content' }}
          success={txInfo.success}
        />
        {txInfo?.failureText &&
          <Typography
            fontSize='16px'
            fontWeight={400}
            m='auto'
            sx={{
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: '2',
              display: '-webkit-box',
              mb: '15px',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            textAlign='center'
            width='92%'
          >
            {txInfo.failureText}
          </Typography>
        }
        {/* <AccountHolderWithProxy address={address} chain={txInfo.chain} showDivider selectedProxyAddress={txInfo.throughProxy?.address} /> */}
        <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
          <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
            {t<string>('Account holder')}:
          </Typography>
          <Typography fontSize='16px' fontWeight={400} lineHeight='23px' maxWidth='45%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap'>
            {txInfo.from.name}
          </Typography>
          <Grid fontSize='16px' fontWeight={400} item lineHeight='22px' pl='5px'>
            <ShortAddress address={txInfo.from.address} inParentheses style={{ fontSize: '16px' }} />
          </Grid>
        </Grid>
        {txInfo.throughProxy &&
          <Grid container m='auto' maxWidth='92%'>
            <ThroughProxy address={txInfo.throughProxy.address} chain={txInfo.chain} />
          </Grid>
        }
        <Grid alignItems='center' container item justifyContent='center' pt='8px'>
          <Divider sx={{ bgcolor: 'secondary.main', height: '2px', width: '240px' }} />
        </Grid>
        <DisplayInfo caption={t<string>('Referendum Id:')} value={`#${refIndex}`} />
        <DisplayInfo caption={t<string>('Decision Deposit:')} value={amount?.toHuman() ?? '00.00'} />
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
        {
          txInfo?.txHash &&
          <Grid container justifyContent='center' pt='5px'>
            <Explorer chainName={chainName} txHash={txInfo?.txHash} />
          </Grid>
        }
        <PButton
          _ml={0}
          _mt='30px'
          _onClick={handleClose}
          _width={100}
          text={t<string>('Close')}
        />
      </Grid>
    </Motion>
  );
}
