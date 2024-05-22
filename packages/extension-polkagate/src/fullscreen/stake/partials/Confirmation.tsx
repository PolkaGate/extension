// Copyright 2019-2024 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Divider, Grid, Typography } from '@mui/material';
import React, { useMemo } from 'react';

import { PButton, ShortAddress } from '../../../components';
import { useAccountName, useInfo, useTranslation } from '../../../hooks';
import { SubTitle, ThroughProxy } from '../../../partials';
import Explorer from '../../../popup/history/Explorer';
import FailSuccessIcon from '../../../popup/history/partials/FailSuccessIcon';
import { TxInfo } from '../../../util/types';

interface Props {
  txInfo: TxInfo;
  handleDone: () => void;
}

export default function Confirmation({ handleDone, txInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { chainName, formatted, token } = useInfo(txInfo.from.address);

  const fee = txInfo.api.createType('Balance', txInfo.fee);
  const maybePayeeAddress = useMemo(() => {
    if (txInfo?.payee) {
      return;
    }

    if (txInfo.payee === 'Stash') {
      return formatted;
    }

    return txInfo.payee?.Account ? String(txInfo.payee.Account) : undefined;
  }, [formatted, txInfo.payee]);

  const destinationAccountName = useAccountName(maybePayeeAddress);

  const Div = () => (
    <Grid alignItems='center' container item justifyContent='center' pt='8px'>
      <Divider sx={{ bgcolor: 'secondary.main', height: '2px', width: '240px' }} />
    </Grid>
  );

  const DisplayInfo = ({ caption, showDivider = true, value }: { caption: string, value: string, showDivider?: boolean }) => {
    return (
      <Grid alignItems='center' container direction='column' fontSize='16px' fontWeight={400} justifyContent='center'>
        <Grid container item width='fit-content'>
          <Typography lineHeight='40px' pr='5px'>{caption}</Typography>
          <Typography lineHeight='40px'>{value}</Typography>
        </Grid>
        {showDivider &&
          <Div />
        }
      </Grid>
    );
  };

  return (
    <Grid container item>
      <SubTitle label={txInfo.success ? t('Completed') : t('Failed')} style={{ paddingTop: '25px' }} />
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
      <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
        <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
          {t('Account holder')}:
        </Typography>
        <Typography fontSize='16px' fontWeight={400} lineHeight='23px' maxWidth='45%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap'>
          {txInfo.from.name}
        </Typography>
        <Grid fontSize='16px' fontWeight={400} item lineHeight='22px' pl='5px'>
          <ShortAddress address={txInfo.from.address} inParentheses style={{ fontSize: '16px' }} />
        </Grid>
        {!txInfo.throughProxy &&
          <Div />
        }
      </Grid>
      {txInfo.throughProxy &&
        <Grid container m='auto' maxWidth='92%'>
          <ThroughProxy address={txInfo.throughProxy.address} chain={txInfo.chain} />
          <Div />
        </Grid>
      }
      {txInfo?.payee &&
        <>
          <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '90%' }}>
            <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
              {t<string>('Rewards destination')}:
            </Typography>
            {maybePayeeAddress &&
              <Typography fontSize='16px' fontWeight={400} lineHeight='23px' maxWidth='34%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap'>
                {destinationAccountName || t('Unknown')}
              </Typography>
            }
            <Grid fontSize='16px' fontWeight={400} item lineHeight='22px' pl='5px'>
              {maybePayeeAddress
                ? <ShortAddress address={maybePayeeAddress} inParentheses style={{ fontSize: '16px' }} />
                : <>{t('Add to staked amount')} </>
              }
            </Grid>
          </Grid>
          <Div />
        </>
      }
      {txInfo?.amount &&
        <>
          <DisplayInfo
            caption={t('Amount:')}
            value={`${txInfo.amount} ${token}`}
          />
        </>
      }
      <DisplayInfo
        caption={t('Fee:')}
        value={fee?.toHuman() ?? '00.00'}
      />
      <DisplayInfo
        caption={t('block:')}
        showDivider={false}
        value={`#${txInfo.block}`}
      />
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
      {txInfo?.txHash && chainName &&
        <Grid container justifyContent='center' pt='5px'>
          <Explorer chainName={chainName} txHash={txInfo?.txHash} />
        </Grid>
      }
      <PButton
        _ml={0}
        _onClick={handleDone}
        _width={90}
        left='5%'
        text={txInfo.success ? t('Done') : t('Close')}
      />
    </Grid>
  );
}
