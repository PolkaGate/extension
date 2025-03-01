// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TxInfo } from '../../../util/types';

import { Divider, Grid, Typography } from '@mui/material';
import React from 'react';

import { AccountWithProxyInConfirmation, DisplayInfo, Motion, Popup, ShortAddress, TwoButtons } from '../../../components';
import { useToken, useTranslation } from '../../../hooks';
import { HeaderBrand, SubTitle } from '../../../partials';
import Explorer from '../../history/Explorer';
import FailSuccessIcon from '../../history/partials/FailSuccessIcon';

interface Props {
  address: string | undefined;
  txInfo: TxInfo;
  showConfirmation: boolean;
  primaryBtnText: string;
  onPrimaryBtnClick: () => void;
  secondaryBtnText?: string;
  onSecondaryBtnClick?: () => void;
}

export default function Confirmation({ address, onPrimaryBtnClick, onSecondaryBtnClick, primaryBtnText, secondaryBtnText, showConfirmation, txInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const token = useToken(address);

  const chainName = txInfo.chain.name.replace(' Relay Chain', '');
  const fee = txInfo.api.createType('Balance', txInfo.fee);

  return (
    <Motion>
      <Popup show={showConfirmation}>
        <HeaderBrand
          shortBorder
          text={t('Unlocking')}
        />
        <SubTitle label={txInfo.success ? t('Completed') : t('Failed')} />
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
          value={t(`${txInfo.amount} {{token}}`, { replace: { token } })}
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
          txInfo?.txHash &&
          <Grid container justifyContent='center' pt='5px'>
            <Explorer chainName={chainName} txHash={txInfo?.txHash} />
          </Grid>
        }
        <TwoButtons
          onPrimaryClick={onPrimaryBtnClick}
          onSecondaryClick={onSecondaryBtnClick as any}
          primaryBtnText={primaryBtnText}
          secondaryBtnText={secondaryBtnText}
        />
      </Popup>
    </Motion>
  );
}
