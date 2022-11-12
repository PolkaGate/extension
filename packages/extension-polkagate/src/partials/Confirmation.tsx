// Copyright 2019-2022 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Divider, Grid, Link, Skeleton, Typography } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import { ActionContext, Motion, Popup, ShortAddress, TwoButtons } from '../components';
import { useTranslation } from '../hooks';
import FailSuccessIcon from '../popup/history/partials/FailSuccessIcon';
import getLogo from '../util/getLogo';
import { TxInfo } from '../util/types';
import { HeaderBrand } from '.';

interface Props {
  showConfirmation: boolean;
  headerTitle: string;
  failReason?: string; // to be deleted
  txInfo: TxInfo;
  primaryBtnText: string;
  onPrimaryBtnClick: () => void;
  children: React.ReactNode;
}

export default function Confirmation({ children, failReason = '', headerTitle, onPrimaryBtnClick, primaryBtnText, showConfirmation, txInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);

  const network = txInfo.chain.name.replace(' Relay Chain', '');
  const decimal = txInfo?.api.registry.chainDecimals[0];
  const token = txInfo?.api.registry.chainTokens[0];
  const historyLink = `/history/${network}/${decimal}/${token}/${txInfo?.from.address}`;
  const subscanLink = (txHash: string) => 'https://' + network + '.subscan.io/extrinsic/' + String(txHash);

  console.log('txInfo:',txInfo);
  
  const goToHistory = useCallback(() => {
    onAction(historyLink);
  }, [historyLink, onAction]);

  return (
    <Motion>
      <Popup show={showConfirmation}>
        <HeaderBrand
          shortBorder
          text={headerTitle}
        />
        <Typography
          fontSize='16px'
          fontWeight={500}
          m='auto'
          sx={{
            borderBottom: '2px solid',
            borderBottomColor: 'secondary.main'
          }}
          textAlign='center'
          width='39%'
        >
          {txInfo.status === 'success' ? t<string>('Completed') : t<string>('Failed')}
        </Typography>
        <FailSuccessIcon
          showLabel={false}
          style={{ fontSize: '87px', m: '20px auto', textAlign: 'center', width: 'fit-content' }}
          success={txInfo.status === 'success'}
        />
        {failReason &&
          <Typography
            fontSize='16px'
            fontWeight={400}
            m='auto'
            textAlign='center'
            width='92%'
          >
            {failReason}
          </Typography>
        }
        {children}
        <Grid
          alignItems='end'
          container
          justifyContent='center'
          sx={{
            m: 'auto',
            pt: '5px',
            width: '75%'
          }}
        >
          <Typography
            fontSize='16px'
            fontWeight={400}
            lineHeight='23px'
          >
            {t<string>('Fee:')}
          </Typography>
          <Grid
            fontSize='16px'
            fontWeight={400}
            item
            lineHeight='22px'
            pl='5px'
          >
            {txInfo?.fee?.toHuman() ?? '00.00'}
          </Grid>
        </Grid>
        <Divider sx={{
          bgcolor: 'secondary.main',
          height: '2px',
          m: '5px auto',
          width: '70%'
        }}
        />
        <Grid
          alignItems='end'
          container
          justifyContent='center'
        >
          <Typography
            fontSize='16px'
            fontWeight={400}
            lineHeight='23px'
          >
            {t<string>('Block:')}
          </Typography>
          <Grid
            fontSize='16px'
            fontWeight={400}
            item
            lineHeight='22px'
            pl='5px'
          >
            {txInfo.block ? `#${txInfo.block}` : <Skeleton sx={{ display: 'inline-block', fontWeight: 'bold', width: '70px' }} />}
          </Grid>
        </Grid>
        <Grid
          alignItems='end'
          container
          justifyContent='center'
          sx={{
            m: 'auto',
            pt: '5px',
            width: '75%'
          }}
        >
          <Typography
            fontSize='16px'
            fontWeight={400}
            lineHeight='23px'
          >
            {t<string>('Hash:')}
          </Typography>
          <Grid
            fontSize='16px'
            fontWeight={400}
            item
            lineHeight='22px'
            pl='5px'
          >
            {txInfo.txHash
              ? (
                <ShortAddress
                  address={txInfo.txHash}
                  addressStyle={{ fontSize: '16px' }}
                  charsCount={6}
                  showCopy
                />)
              : <Skeleton sx={{ display: 'inline-block', fontWeight: 'bold', width: '70px' }} />}
          </Grid>
        </Grid>
        <Grid
          container
          justifyContent='center'
          pt='5px'
        >
          <Link
            href={`${subscanLink(txInfo?.txHash)}`}
            rel='noreferrer'
            target='_blank'
            underline='none'
          >
            <Grid
              alt={'subscan'}
              component='img'
              src={getLogo('subscan')}
              sx={{ height: 44, width: 44 }}
            />
          </Link>
        </Grid>
        <TwoButtons
          onPrimaryClick={onPrimaryBtnClick}
          onSecondaryClick={goToHistory}
          primaryBtnText={primaryBtnText}
          secondaryBtnText={t<string>('History')}
        />
      </Popup>
    </Motion>
  );
}
