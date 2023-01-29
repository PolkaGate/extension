// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Divider, Grid, Link, Typography } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import { subscan } from '../assets/icons/';
import { ActionContext, Motion, Popup, ShortAddress, TwoButtons } from '../components';
import { useTranslation } from '../hooks';
import FailSuccessIcon from '../popup/history/partials/FailSuccessIcon';
import { TxInfo } from '../util/types';
import { HeaderBrand, SubTitle } from '.';
import { getSubstrateAddress } from '../util/utils';

interface Props {
  showConfirmation: boolean;
  headerTitle: string;
  txInfo: TxInfo;
  primaryBtnText: string;
  onPrimaryBtnClick: () => void;
  secondaryBtnText?: string;
  onSecondaryBtnClick?: () => void;
  children: React.ReactNode;
}

export default function Confirmation({ children, headerTitle, onPrimaryBtnClick, onSecondaryBtnClick, primaryBtnText, secondaryBtnText, showConfirmation, txInfo }: Props): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);

  const network = txInfo.chain.name.replace(' Relay Chain', '');
  const historyLink = txInfo?.from.address && getSubstrateAddress(txInfo.from.address) ? `/history/${getSubstrateAddress(txInfo.from.address)}` : '/';
  const subscanLink = (txHash: string) => 'https://' + network + '.subscan.io/extrinsic/' + String(txHash);
  const fee = txInfo.api.createType('Balance', txInfo.fee);

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
        <SubTitle label={txInfo.success ? t<string>('Completed') : t<string>('Failed')} />
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
        {children}
        <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '75%' }}>
          <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
            {t<string>('Fee:')}
          </Typography>
          <Grid fontSize='16px' fontWeight={400} item lineHeight='22px' pl='5px'>
            {fee?.toHuman() ?? '00.00'}
          </Grid>
        </Grid>
        <Divider sx={{ bgcolor: 'secondary.main', height: '2px', m: '5px auto', width: '70%' }} />
        {!!txInfo?.block &&
          <Grid alignItems='end' container justifyContent='center'>
            <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
              {t<string>('Block:')}
            </Typography>
            <Grid fontSize='16px' fontWeight={400} item lineHeight='22px' pl='5px'>
              #{txInfo.block}
            </Grid>
          </Grid>
        }
        {txInfo?.txHash &&
          <Grid alignItems='end' container justifyContent='center' sx={{ m: 'auto', pt: '5px', width: '75%' }}>
            <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
              {t<string>('Hash:')}
            </Typography>
            <Grid fontSize='16px' fontWeight={400} item lineHeight='22px' pl='5px'>
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
            <Link
              href={`${subscanLink(txInfo?.txHash)}`}
              rel='noreferrer'
              target='_blank'
              underline='none'
            >
              <Box alt={'subscan'} component='img' height='30px' mt='5px' src={subscan} width='30px' />
            </Link>
          </Grid>
        }
        <TwoButtons
          onPrimaryClick={onPrimaryBtnClick}
          onSecondaryClick={onSecondaryBtnClick || goToHistory}
          primaryBtnText={primaryBtnText}
          secondaryBtnText={secondaryBtnText || t<string>('History')}
        />
      </Popup>
    </Motion>
  );
}
