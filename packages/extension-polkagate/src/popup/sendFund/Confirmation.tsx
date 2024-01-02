// Copyright 2019-2024 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React from 'react';

import { Motion, ShortAddress, TwoButtons } from '../../components';
import { useAccountDisplay, useTranslation } from '../../hooks';
import { ThroughProxy } from '../../partials';
import { NameAddress, TxInfo } from '../../util/types';
import { pgBoxShadow } from '../../util/utils';
import Explorer from '../history/Explorer';
import FailSuccessIcon from '../history/partials/FailSuccessIcon';

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
  const fee = txInfo.api.createType('Balance', txInfo.fee);

  const DisplayInfo = ({ caption, showDivider = true, value }: DisplayInfoProps) => {
    return (
      <>{value &&
        <Grid alignItems='center' container direction='column' fontSize='16px' fontWeight={400} justifyContent='center'>
          <Grid container item width='fit-content'>
            <Typography lineHeight='40px' pr='5px'>{caption}</Typography>
            <Typography lineHeight='40px'>{value}</Typography>
          </Grid>
          {showDivider &&
            <Grid alignItems='center' container item justifyContent='center'>
              <Divider sx={{ bgcolor: 'secondary.main', height: '1px', mx: '6px', width: '240px' }} />
            </Grid>}
        </Grid>
      }</>
    );
  };

  return (
    <Motion>
      <Grid container item sx={{ bgcolor: 'background.paper', boxShadow: pgBoxShadow(theme), pb: '15px' }}>
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
        <Account info={txInfo.from} label={t<string>('From')} />
        {txInfo.throughProxy &&
          <Grid container m='auto' maxWidth='92%'>
            <ThroughProxy address={txInfo.throughProxy.address} chain={txInfo.chain} />
          </Grid>
        }
        <Divider sx={{ bgcolor: 'secondary.main', height: '1px', m: 'auto', width: '240px' }} />
        <DisplayInfo
          caption={t<string>('Amount:')}
          value={txInfo.amount && txInfo.token ? `${parseFloat(txInfo.amount)} ${txInfo.token}` : '00.00'}
        />
        <DisplayInfo
          caption={t<string>('Chain:')}
          showDivider={false}
          value={chainName}
        />
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: 'auto', width: '240px' }} />
        <Account info={txInfo.to} label={t<string>('To')} />
        <Divider sx={{ bgcolor: 'secondary.main', height: '1px', m: 'auto', width: '240px' }} />
        <DisplayInfo
          caption={t<string>('Chain:')}
          showDivider={false}
          value={txInfo.recipientChainName}
        />
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: 'auto', width: '240px' }} />
        <DisplayInfo
          caption={chainName === txInfo.recipientChainName ? t<string>('Fee:') : t<string>('Total transaction fee:')}
          showDivider={false}
          value={fee?.toHuman() ?? '00.00'}
        />
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: 'auto', width: '240px' }} />
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
            <Explorer chainName={chainName} formatted={txInfo.from?.address} txHash={txInfo?.txHash} />
          </Grid>
        }
      </Grid>
      <Grid container sx={{ '> div': { ml: '30%', mt: '15px', width: '100%' } }}>
        <TwoButtons
          mt='15px'
          onPrimaryClick={handleDone}
          onSecondaryClick={() => { window.close() }}
          primaryBtnText={t<string>('Done')}
          secondaryBtnText={t<string>('Close tab')}
        />
      </Grid>
    </Motion>
  );
}
