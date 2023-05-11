// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';

import { Close as CloseIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { Box, Checkbox, Grid, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Modal, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { BN, BN_ONE } from '@polkadot/util';

import { AmountWithOptions, Convictions, From, Infotip, ShowBalance } from '../../../components';
import { useAccountLocks, useApi, useBalances, useDecimal, useFormatted, useToken, useTracks, useTranslation } from '../../../hooks';
import { MAX_AMOUNT_LENGTH } from '../../../util/constants';
import { amountToHuman, amountToMachine } from '../../../util/utils';
import { toTitleCase } from '../utils/util';
import AlreadyLockedTooltipText, { getAlreadyLockedValue } from './AlreadyLockedTooltipText ';

interface Props {
  api: ApiPromise | undefined;
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
  const accountLocks = useAccountLocks(address, 'referenda', 'convictionVoting', true);

  const balances = useBalances(address, undefined, undefined, true);
  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const [delegateAmount, setDelegateAmount] = useState<string>('0');
  const [conviction, setConviction] = useState<number>(1);
  const [checked, setChecked] = useState([0]);

  const delegate = api && api.tx.convictionVoting.delegate;

  const handleClose = () => {
    setOpen(false);
  };

  const lockedAmount = useMemo(() => getAlreadyLockedValue(balances), [balances]);

  const onLockedAmount = useCallback(() => {
    if (!lockedAmount) {
      return;
    }

    setDelegateAmount(amountToHuman(lockedAmount, decimal));
  }, [decimal, lockedAmount]);

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
    width: 600
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

    maxToHuman && setDelegateAmount(maxToHuman);
  }, [api, balances, decimal, estimatedFee]);

  const onValueChange = useCallback((value: string) => {
    if (!decimal) {
      return;
    }

    if (value.length > decimal - 1) {
      console.log(`The amount digits is more than decimal:${decimal} `);

      return;
    }

    setDelegateAmount(value.slice(0, MAX_AMOUNT_LENGTH));
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
  };

  return (
    <Modal onClose={handleClose} open={open}>
      <Box sx={{ ...style }}>
        <Grid alignItems='center' container justifyContent='space-between' pt='5px'>
          <Grid item>
            <Typography fontSize='22px' fontWeight={700}>
              {t('Delegate Vote (1/3)')}
            </Typography>
          </Grid>
          <Grid item>
            <CloseIcon onClick={handleClose} sx={{ color: 'primary.main', cursor: 'pointer', stroke: theme.palette.primary.main, strokeWidth: 1.5 }} />
          </Grid>
        </Grid>
        <Typography fontSize='16px' fontWeight={400} sx={{ py: '20px', textAlign: 'left' }}>
          {t('Give your voting power to another account.')}
        </Typography>
        <Grid alignItems='center' container justifyContent='space-between'>
          <Grid item xs={8}>
            <From
              address={address}
              api={api}
              style={{ '> div': { px: '10px' }, '> p': { fontWeight: 400 } }}
              title={t<string>('From account')}
            />
          </Grid>
          <Grid alignItems='center' container item sx={{ cursor: 'pointer', mt: '25px' }} xs={3}>
            {t('Existing votes')}
            <ExpandMoreIcon sx={{ color: `${theme.palette.primary.main}`, fontSize: '37px' }} />
          </Grid>
        </Grid>
        <AmountWithOptions
          inputWidth={9}
          label={t<string>(`Value (${token})`)}
          onChangeAmount={onValueChange}
          onPrimary={onMaxAmount}
          onSecondary={onLockedAmount}
          primaryBtnText={t<string>('Max amount')}
          secondaryBtnText={t<string>('Locked amount')}
          style={{
            fontSize: '16px',
            mt: '15px',
            width: '100%'
          }}
          value={delegateAmount}
        />
        <Grid container item xs={9}>
          <Grid container item justifyContent='space-between' sx={{ mt: '10px' }}>
            <Grid item sx={{ fontSize: '16px' }}>
              {t('Available Voting Balance')}
            </Grid>
            <Grid item sx={{ fontSize: '20px', fontWeight: 500 }}>
              <ShowBalance balance={balances?.votingBalance} decimal={decimal} decimalPoint={2} token={token} />
            </Grid>
          </Grid>
          <Grid alignItems='center' container item justifyContent='space-between' sx={{ lineHeight: '20px' }}>
            <Grid item sx={{ fontSize: '16px' }}>
              <Infotip iconLeft={5} iconTop={4} showQuestionMark text={t('The maximum number of tokens that are already locked in the ecosystem')}>
                {t('Already Locked Balance')}
              </Infotip>
            </Grid>
            <Grid item sx={{ fontSize: '20px', fontWeight: 500 }}>
              <Infotip iconLeft={5} iconTop={2} showInfoMark text={<AlreadyLockedTooltipText address={address} /> || 'Fetching ...'}>
                <ShowBalance balance={lockedAmount} decimal={decimal} decimalPoint={2} token={token} />
              </Infotip>
            </Grid>
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
              <ShowBalance balance={amountToMachine(delegateAmount, decimal).muln(conviction)} decimal={decimal} token={token} />
            </Grid>
          </Grid>
        </Convictions>
        <Typography fontSize='16px' fontWeight={400} sx={{ pt: '20px', textAlign: 'left' }}>
          {t('Select tracks to delegate to')}
        </Typography>
        <List sx={{ width: '100%', maxWidth: '100%', border: 1, borderColor: 'primary.main', borderRadius: '10px', height: '300px', overflowY: 'scroll' }}>
          {tracks?.map((value) => (
            <ListItem
              disablePadding
              key={value[0]}
              sx={{ height: '20px' }}
            >
              <ListItemButton dense onClick={handleToggle(value[0])} role={undefined}>
                <ListItemText primary={`${toTitleCase(value[1].name)}`} />
                <ListItemIcon>
                  <Checkbox
                    checked={checked.indexOf(value[0]) !== -1}
                    // disableRipple
                    edge='end'
                    tabIndex={-1}
                  />
                </ListItemIcon>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Modal>
  );
}
