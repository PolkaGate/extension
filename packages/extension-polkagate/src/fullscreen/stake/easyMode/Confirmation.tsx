// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { NameAddress, TxInfo } from '../../../util/types';

import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React from 'react';

import { PButton, ShortAddress } from '../../../components';
import { useAccountDisplay, useTranslation } from '../../../hooks';
import { ThroughProxy } from '../../../partials';
import Explorer from '../../../popup/history/Explorer';
import FailSuccessIcon from '../../../popup/history/partials/FailSuccessIcon';
import { amountToHuman, pgBoxShadow } from '../../../util/utils';

interface Props {
  txInfo: TxInfo;
  handleDone: () => void;
}

interface DisplayInfoProps {
  caption: string;
  value: string | undefined;
  showDivider?: boolean;
}

const Account = ({ info, label }: { label: string, info: NameAddress }) => {
  const accountName = useAccountDisplay(info.address);

  return (
    <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
      <Typography fontSize='16px' fontWeight={400} lineHeight='40px'>
        {label}:
      </Typography>
      <Typography fontSize='16px' fontWeight={400} lineHeight='40px' maxWidth='45%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap'>
        {info?.name || accountName}
      </Typography>
      <Grid fontSize='16px' fontWeight={400} item lineHeight='40px' pl='5px'>
        <ShortAddress address={info.address} inParentheses style={{ fontSize: '16px' }} />
      </Grid>
    </Grid>
  );
};

export default function Confirmation({ handleDone, txInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const chainName = txInfo.chain.name.replace(' Relay Chain', '');

  const Div = () => (
    <Grid alignItems='center' container item justifyContent='center' pt='8px'>
      <Divider sx={{ bgcolor: 'secondary.main', height: '2px', width: '240px' }} />
    </Grid>
  );

  const DisplayInfo = ({ caption, showDivider = true, value }: DisplayInfoProps) => {
    return (
      <>
        {value &&
          <Grid alignItems='center' container direction='column' fontSize='16px' fontWeight={400} justifyContent='center'>
            <Grid container item width='fit-content'>
              <Typography lineHeight='40px' pr='5px'>
                {caption}
              </Typography>
              <Typography lineHeight='40px'>
                {value}
              </Typography>
            </Grid>
            {showDivider &&
              <Div />
            }
          </Grid>
        }
      </>
    );
  };

  return (
    <>
      <Grid container item sx={{ bgcolor: 'background.paper', boxShadow: pgBoxShadow(theme), pb: '15px' }}>
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
        <Account
          info={txInfo.from}
          label={t('From')}
        />
        {txInfo.throughProxy &&
          <Grid container m='auto' maxWidth='92%'>
            <ThroughProxy address={txInfo.throughProxy.address} chain={txInfo.chain} />
          </Grid>
        }
        <Div />
        {txInfo.amount && txInfo.token &&
          <DisplayInfo
            caption={t('Amount:')}
            value={`${parseFloat(txInfo.amount)} ${txInfo.token}`}
          />
        }
        {txInfo.poolName &&
          <DisplayInfo
            caption={t('Pool Name:')}
            value={txInfo.poolName}
          />
        }
        {txInfo.validatorsCount &&
          <DisplayInfo
            caption={t('Validators:')}
            value={String(txInfo.validatorsCount)}
          />
        }
        {txInfo.fee && txInfo.token && txInfo.decimal &&
          <DisplayInfo
            caption={t('Fee:')}
            value={`${amountToHuman(txInfo.fee, txInfo.decimal)} ${txInfo.token}`}
          />
        }
        {!!txInfo.block &&
          <DisplayInfo
            caption={t('Block:')}
            value={`#${txInfo.block}`}
          />
        }
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
            <Explorer chainName={chainName} formatted={txInfo.from?.address} txHash={txInfo?.txHash} />
          </Grid>
        }
      </Grid>
      <Grid container sx={{ '> div': { ml: '30%', mt: '15px', width: '100%' } }}>
        <PButton
          _ml={0}
          _mt='15px'
          _onClick={handleDone}
          _width={100}
          text={txInfo.success ? t('Done') : t('Close')}
        />
      </Grid>
    </>
  );
}
