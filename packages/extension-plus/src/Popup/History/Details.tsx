// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description this component shows a detailed information of an individual transaction including sender/reciver addresses if applicable,
 *  amount, type of transaction, hashes and etc.
 * */

import { faCopy } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { BubbleChart as BubbleChartIcon } from '@mui/icons-material';
import { Box, Chip, Container, Divider, Grid, Link, Paper, Stack } from '@mui/material';
import React, { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import { Chain } from '@polkadot/extension-chains/types';

import useTranslation from '../../../../extension-ui/src/hooks/useTranslation';
import { Hint, PlusHeader, Popup } from '../../components';
import { SHORT_ADDRESS_CHARACTERS } from '../../util/constants';
import getLogo from '../../util/getLogo';
import { TransactionDetail } from '../../util/plusTypes';
import { amountToHuman } from '../../util/plusUtils';
import { getTxIcon } from './getTxIcon';

interface Props {
  chain?: Chain | null;
  coin: string;
  decimals: number;
  showDetailModal: boolean;
  setShowDetailModal: Dispatch<SetStateAction<boolean>>;
  transaction: TransactionDetail;
}

export default function Details({
  chain,
  coin,
  decimals,
  setShowDetailModal,
  showDetailModal,
  transaction }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [showToast, setShowToast] = useState<boolean>(false);

  const network = chain ? chain.name.replace(' Relay Chain', '') : 'westend';
  const subscanLink = (transactionHash: string) => 'https://' + network + '.subscan.io/extrinsic/' + String(transactionHash);

  const handleDetailsModalClose = useCallback(
    (): void => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      setShowDetailModal(false);
    },
    [setShowDetailModal]
  );

  const _onCopy = useCallback((): void => setShowToast(true), []);

  useEffect(() => {
    if (showToast) { setTimeout(setShowToast, 1000, false); }
  }, [showToast]);

  function makeAddressShort(_address: string): React.ReactElement {
    return (
      <Box
        component='span'
        fontFamily='Monospace'
        fontSize={14}
      >
        {_address.slice(0, SHORT_ADDRESS_CHARACTERS) +
          '...' +
          _address.slice(-1 * SHORT_ADDRESS_CHARACTERS)}
      </Box>
    );
  }

  const showAddress = (_addr: string): React.ReactElement => {
    return (
      _addr
        ? <>
          {makeAddressShort(_addr)}{' '}
          <Link href='#'>
            <CopyToClipboard text={_addr}>
              <FontAwesomeIcon
                className='copyIcon'
                icon={faCopy}
                onClick={_onCopy}
                size='lg'
                title={t('copy address')}
              />
            </CopyToClipboard>
          </Link>
        </>
        : <Box>N/A</Box>
    );
  };

  return (
    <Popup handleClose={handleDetailsModalClose} id='scrollArea' showModal={showDetailModal}>
      <PlusHeader action={handleDetailsModalClose} chain={chain} closeText={'Close'} icon={<BubbleChartIcon fontSize='small' />} title={'Transaction Detail'} />
      <Container data-testid='details' sx={{ p: '0px 20px' }}>
        <Grid item sx={{ p: '15px 15px 8px' }} xs={12}>
          <Paper elevation={3}>
            <Grid container item justifyContent='center' sx={{ fontSize: 12, textAlign: 'center', p: '30px 10px 20px' }}>
              <Grid container item justifyContent='center' spacing={1} xs={12}>
                <Grid item>
                  {getTxIcon(transaction.action)}
                </Grid>
                <Grid item sx={{ pb: '10px' }}>
                  {transaction.action.toUpperCase()}
                </Grid>
              </Grid>
              <Grid id='transactionStatus' item sx={{ fontSize: 15, fontWeight: 'bold', p: '5px 1px 10px', color: ['success'].includes(transaction.status.toLowerCase()) ? 'green' : 'red' }} xs={12}>
                {['success'].includes(transaction.status.toLowerCase()) ? t('Success') : t('Failed')}
              </Grid>
              {transaction.status.toLowerCase() !== 'success' &&
                <Stack id='failureText' justifyContent='center' sx={{ color: 'gray', overflow: 'hidden', whiteSpace: 'nowrap', textAlign: 'center', textOverflow: 'ellipsis' }}>
                  <Hint tip={transaction.status}>
                    {transaction.status}
                  </Hint>
                </Stack>
              }
              <Grid container item justifyContent='flex-end' sx={{ paddingTop: '10px' }} xs={12}>
                <Grid item xs={10}>
                  {new Date(transaction.date).toDateString()}{' '}{new Date(transaction.date).toLocaleTimeString()}
                </Grid>
                <Grid item xs={1}>
                  <Link
                    href={`${subscanLink(transaction.hash)}`}
                    rel='noreferrer'
                    target='_blank'
                    underline='none'
                  >
                    <Grid
                      alt={'subscan'}
                      component='img'
                      src={getLogo('subscan')}
                      sx={{ height: 20, width: 20 }}
                    />
                  </Link>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item sx={{ fontSize: 14, opacity: showToast ? 1 : 0, textAlign: 'center' }} xs={12}>
          <Chip label={t<string>('Copied')} />
        </Grid>
        <Grid item sx={{ p: '8px 15px 10px' }} xs={12}>
          <Paper elevation={3}>
            <Grid container justifyContent='space-between' sx={{ fontSize: 12, p: '30px 10px 20px' }}>
              <Grid item sx={{ textAlign: 'left' }} xs={6}>
                {t('Amount')}
              </Grid>
              <Grid item sx={{ fontWeight: 'bold', pb: '10px', textAlign: 'right' }} xs={6}>
                {transaction.amount || 'N/A'} {' '}{coin}
              </Grid>
              <Grid item sx={{ textAlign: 'left' }} xs={2}>
                {t('From')}
              </Grid>
              <Grid item sx={{ textAlign: 'right', pb: '10px' }} xs={10}>
                {showAddress(transaction.from)}
              </Grid>
              <Grid item sx={{ textAlign: 'left' }} xs={2}>
                {t('To')}
              </Grid>
              <Grid item sx={{ textAlign: 'right' }} xs={10}>
                {transaction.to.length < 10 ? transaction.to : showAddress(transaction.to)}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item sx={{ p: '10px 15px 10px' }} xs={12}>
          <Paper elevation={3}>
            <Grid container justifyContent='space-between' sx={{ fontSize: 12, p: '30px 10px 20px' }}>
              <Grid item sx={{ textAlign: 'left' }} xs={6}>
                {t('Fees')}
              </Grid>
              <Grid item sx={{ fontWeight: '600', textAlign: 'right', pb: '10px' }} xs={6}>
                {amountToHuman(transaction.fee, decimals, 6)} {' '}{coin}
              </Grid>
              <Grid item sx={{ textAlign: 'left' }} xs={2}>
                {t('Block')}
              </Grid>
              <Grid item sx={{ textAlign: 'right', pb: '10px' }} xs={10}>
                # {transaction.block || 'N/A'}
              </Grid>
              <Grid item sx={{ textAlign: 'left' }} xs={1}>
                {t('Hash')}
              </Grid>
              <Grid item sx={{ textAlign: 'right' }} xs={11}>
                {makeAddressShort(transaction.hash) || 'N/A'}{' '}
                <Link href='#'>
                  <CopyToClipboard text={transaction.hash}>
                    <FontAwesomeIcon
                      className='copyIcon'
                      icon={faCopy}
                      onClick={_onCopy}
                      size='lg'
                      title={t('copy hash')}
                    />
                  </CopyToClipboard>
                </Link>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item sx={{ pb: '20px' }} xs={12}>
          <Divider light />
        </Grid>
      </Container>
    </Popup>
  );
}
