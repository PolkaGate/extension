// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';

import { Close as CloseIcon } from '@mui/icons-material';
import { Box, Grid, Modal, Typography, useTheme, List, ListItem, ListItemButton, ListItemIcon, Checkbox, ListItemText } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { BN, BN_ONE } from '@polkadot/util';

import { AmountWithOptions, Convictions, From, ShowBalance } from '../../../components';
import { useApi, useBalances, useDecimal, useFormatted, useToken, useTracks, useTranslation } from '../../../hooks';
import { MAX_AMOUNT_LENGTH } from '../../../util/constants';
import { amountToHuman, amountToMachine } from '../../../util/utils';

interface Props {
  api: ApiPromise;
  address: string | undefined;
  open: boolean;
  setOpen: (value: React.SetStateAction<boolean>) => void
}

export function Delegate({ address, open, setOpen }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const token = useToken(address);
  const api = useApi(address);
  const decimal = useDecimal(address);
  const formatted = useFormatted(address);
  const tracks = useTracks(address);

  const balances = useBalances(address, undefined, undefined, true);
  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const [amount, setAmount] = useState<string>('0');
  const [conviction, setConviction] = useState<number>(1);
  const [checked, setChecked] = useState([0]);

  const delegate = api && api.tx.convictionVoting.delegate;

  const handleClose = () => {
    setOpen(false);
  };

  const style = {
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    left: '50%',
    position: 'absolute' as 'absolute',
    pb: 3,
    pt: 2,
    px: 4,
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: 850
  };

  useEffect(() => {
    if (!formatted || !delegate) {
      return;
    }

    if (!api?.call?.transactionPaymentApi) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
    }

    const dummyAddress = 'Cgp9bcq1dGP1Z9B6F2ccTSTHNez9jq2iUX993ZbDVByPSU2';
    const feeDummyParams = [0, dummyAddress, 1, BN_ONE];

    delegate(...feeDummyParams).paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee)).catch(console.error);
  }, [api, formatted, delegate]);

  const onMaxAmount = useCallback(() => {
    if (!api || !balances || !estimatedFee) {
      return;
    }

    const ED = api.consts.balances.existentialDeposit as unknown as BN;
    const max = new BN(balances.votingBalance.toString()).sub(ED.muln(2)).sub(new BN(estimatedFee));
    const maxToHuman = amountToHuman(max.toString(), decimal);

    maxToHuman && setAmount(maxToHuman);
  }, [api, balances, decimal, estimatedFee]);

  const onValueChange = useCallback((value: string) => {
    if (!decimal) {
      return;
    }

    if (value.length > decimal - 1) {
      console.log(`The amount digits is more than decimal:${decimal} `);

      return;
    }

    setAmount(value.slice(0, MAX_AMOUNT_LENGTH));
  }, [decimal]);

  const handleToggle = (value: number) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
    >
      <Box sx={{ ...style }}>
        <Grid alignItems='center' container justifyContent='space-between' pt='5px'>
          <Grid item>
            <Typography fontSize='22px' fontWeight={700}>
              {t('Delegate')}
            </Typography>
          </Grid>
          <Grid item>
            <CloseIcon onClick={handleClose} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
          </Grid>
        </Grid>
        <Typography fontSize='16px' fontWeight={400} sx={{ py: '20px', textAlign: 'left' }}>
          {t('Give your voting power to another account. Your funds will be locked for the delegation period. Once you delegate, you won\'t be able to access your funds until the delegation period ends.')}
        </Typography>
        <Grid container sx={{ pt: '15px' }} item xs={6}>
          <From
            address={address}
            api={api}
            style={{ '> div': { px: '10px' }, '> p': { fontWeight: 400 } }}
            title={t<string>('From account')}
          />
          <AmountWithOptions
            label={t<string>(`Value (${token})`)}
            onChangeAmount={onValueChange}
            onPrimary={onMaxAmount}
            primaryBtnText={t<string>('Max amount')}
            style={{
              fontSize: '16px',
              mt: '15px',
              width: '100%'
            }}
            value={amount}
          />
          <Grid container item justifyContent='space-between' sx={{ mt: '10px' }}>
            <Grid item sx={{ fontSize: '16px' }}>
              {t('Available Voting Balance')}
            </Grid>
            <Grid item sx={{ fontSize: '20px', fontWeight: 500 }}>
              <ShowBalance balance={balances?.votingBalance} decimal={decimal} decimalPoint={2} token={token} />
            </Grid>
          </Grid>
          <Convictions
            address={address}
            conviction={conviction}
            setConviction={setConviction}
          >
            <Grid alignItems='center' container item justifyContent='space-between' sx={{ lineHeight: '24px' }}>
              <Grid item>
                <Typography sx={{ fontSize: '16px' }}>
                  {t('Your final delegated vote power after multiplying')}
                </Typography>
              </Grid>
              <Grid item sx={{ fontSize: '20px', fontWeight: 500 }}>
                <ShowBalance balance={amountToMachine(amount, decimal).muln(conviction)} decimal={decimal} token={token} />
              </Grid>
            </Grid>
          </Convictions>
        </Grid>
        <Grid item xs>
        <Typography fontSize='16px' fontWeight={400} sx={{ pt: '20px', textAlign: 'left' }}>
          {t('Choose tracks to delegate to')}
        </Typography>
          <List sx={{ width: '100%', maxWidth: 360, border: 1, height: '300px', overflowY: 'scroll' }}>
            {tracks?.map((value) => {
              const labelId = `checkbox-list-label-${value}`;

              return (
                <ListItem
                  key={value[0]}
                  // secondaryAction={
                  //   <IconButton edge="end" aria-label="comments">
                  //     <CommentIcon />
                  //   </IconButton>
                  // }
                  disablePadding
                >
                  <ListItemButton role={undefined} onClick={handleToggle(value[0])} dense>
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={checked.indexOf(value[0]) !== -1}
                        tabIndex={-1}
                        disableRipple
                        inputProps={{ 'aria-labelledby': labelId }}
                      />
                    </ListItemIcon>
                    <ListItemText id={labelId} primary={`${value[1].name}`} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Grid>
      </Box>
    </Modal>
  );
}
