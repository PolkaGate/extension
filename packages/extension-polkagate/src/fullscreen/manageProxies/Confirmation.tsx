// Copyright 2019-2024 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ProxyItem, TxInfo } from '../../util/types';

import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import { BN } from '@polkadot/util';

import { AccountContext, Motion, PButton, ShortAddress, ShowBalance } from '../../components';
import { useChainName, useTranslation } from '../../hooks';
import { SubTitle, ThroughProxy } from '../../partials';
import Explorer from '../../popup/history/Explorer';
import FailSuccessIcon from '../../popup/history/partials/FailSuccessIcon';
import { getSubstrateAddress, pgBoxShadow } from '../../util/utils';

interface Props {
  address: string | undefined;
  txInfo: TxInfo;
  handleClose: () => void;
  depositAmount: BN;
  proxyItems: ProxyItem[];
}

export default function Confirmation ({ address, depositAmount, handleClose, proxyItems, txInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const chainName = useChainName(address);
  const { accounts } = useContext(AccountContext);

  const getLocalName = useCallback((proxyAddress: string) => accounts?.find(({ address }) => address === getSubstrateAddress(proxyAddress))?.name, [accounts]);

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
    <Motion>
      <Grid container item sx={{ bgcolor: 'background.paper', boxShadow: pgBoxShadow(theme), pb: '15px' }}>
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
        </Grid>
        {txInfo.throughProxy &&
          <Grid container m='auto' maxWidth='92%'>
            <ThroughProxy address={txInfo.throughProxy.address} chain={txInfo.chain} />
          </Grid>
        }
        <Grid alignItems='center' container item justifyContent='center' pt='8px'>
          <Divider sx={{ bgcolor: 'secondary.main', height: '2px', width: '240px' }} />
          {proxyItems.map(({ proxy, status }, index) => {
            const localName = getLocalName(proxy.delegate);

            return (
              <Grid alignItems='end' container justifyContent='center' key={index} sx={{ m: 'auto', pt: '5px', width: '90%' }}>
                {localName &&
                  <Typography fontSize='16px' fontWeight={400} maxWidth='35%' overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap'>
                    {localName}
                  </Typography>
                }
                <Grid fontSize='16px' fontWeight={400} item lineHeight='22px' pl='5px'>
                  <ShortAddress address={proxy.delegate} inParentheses style={{ fontSize: '16px' }} />
                </Grid>
                <Typography fontSize='16px' fontWeight={400} lineHeight='23px' maxWidth='45%' overflow='hidden' pl='5px' textOverflow='ellipsis' whiteSpace='nowrap'>
                  {status === 'new'
                    ? t('Added')
                    : t('Removed')}
                </Typography>
              </Grid>);
          })}
          <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mt: '5px', width: '240px' }} />
        </Grid>
        <DisplayInfo caption={t<string>('Fee:')} value={fee?.toHuman() ?? '00.00'} />
        <Grid container item justifyContent='center' sx={{ pt: '10px' }}>
          <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
            {t<string>('Deposit amount:')}
          </Typography>
          <Grid item lineHeight='22px' pl='5px'>
            <ShowBalance
              api={txInfo.api}
              balance={depositAmount}
              decimalPoint={4}
              height={22}
            />
          </Grid>
          <Grid alignItems='center' container item justifyContent='center'>
            <Divider sx={{ bgcolor: 'secondary.main', height: '2px', mt: '10px', width: '240px' }} />
          </Grid>
        </Grid>
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
          </Grid>}
        {txInfo?.txHash &&
          <Grid container justifyContent='center' pt='5px'>
            <Explorer chainName={chainName ?? ''} txHash={txInfo?.txHash} />
          </Grid>
        }
      </Grid>
      <PButton
        _ml={0}
        _mt='30px'
        _onClick={handleClose}
        _width={100}
        text={t<string>('Done')}
      />
    </Motion>
  );
}
