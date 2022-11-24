// Copyright 2019-2022 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Divider, Grid, Link, Typography } from '@mui/material';
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
  const decimal = txInfo?.api.registry.chainDecimals[0];
  const token = txInfo?.api.registry.chainTokens[0];
  const historyLink = `/history/${network}/${decimal}/${token}/${txInfo?.from.address}`;
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
          style={{ fontSize: '87px', m: `${txInfo?.failureText ? 15 : 20}px auto`, textAlign: 'center', width: 'fit-content' }}
          success={txInfo.status === 'success'}
        />
        {txInfo?.failureText &&
          <Typography
            fontSize='16px'
            fontWeight={400}
            m='auto'
            sx={{
              display: '-webkit-box',
              overflow: 'hidden',
              mb: '15px',
              WebkitLineClamp: '2',
              WebkitBoxOrient: 'vertical',
              textOverflow: 'ellipsis'
            }}
            textAlign='center'
            width='92%'
          >
            {txInfo.failureText}
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
            {fee?.toHuman() ?? '00.00'}
          </Grid>
        </Grid>
        <Divider sx={{
          bgcolor: 'secondary.main',
          height: '2px',
          m: '5px auto',
          width: '70%'
        }}
        />
        {!!txInfo?.block &&
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
              #{txInfo.block}
            </Grid>
          </Grid>
        }
        {txInfo?.txHash &&
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
              <ShortAddress
                address={txInfo.txHash}
                style={{ fontSize: '16px' }}
                charsCount={6}
                showCopy
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
              <Grid alt={'subscan'} component='img' src={getLogo('subscan')} sx={{ height: 44, width: 44 }} />
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
