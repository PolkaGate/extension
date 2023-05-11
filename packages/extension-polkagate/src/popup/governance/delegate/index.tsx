// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { Balance } from '@polkadot/types/interfaces';

import { ArrowForwardIos as ArrowForwardIosIcon,Close as CloseIcon } from '@mui/icons-material';
import { Box, Grid, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Modal, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { BN, BN_ONE } from '@polkadot/util';

import { AmountWithOptions, Checkbox2, Convictions, From, Infotip, PButton, ShowBalance } from '../../../components';
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
  const [checked, setChecked] = useState([]);
  const [showExistingVoted, setShowExistingVoted] = useState(false);

  const delegate = api && api.tx.convictionVoting.delegate;

  const handleClose = () => {
    setOpen(false);
  };

  const lockedAmount = useMemo(() => getAlreadyLockedValue(balances), [balances]);
  const unvotedTracks = useMemo(() => accountLocks && tracks && tracks.filter((value) => !accountLocks.find((lock) => lock.classId.eq(value[0]))), [accountLocks, tracks]);
  const existingVotes: Record<string, number> | undefined = useMemo(() => {
    if (tracks && accountLocks) {
      let result = {};

      accountLocks.forEach((lock) => {
        if (!result[lock.classId]) {
          result[lock.classId] = 1;
        } else {
          result[lock.classId]++;
        }
      });

      const replacedKey = Object.keys(result).reduce((acc, key) => {
        const newKey = tracks.find((value) => String(value[0]) === key)?.[1].name; // Convert numeric key to custom key
        acc[newKey] = result[key];

        return acc;
      }, {});

      return replacedKey;
    }
  }, [accountLocks, tracks]);

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

  const onSelectAll = useCallback(() => {
    const checked = unvotedTracks?.map((value) => value[0]) || [];

    setChecked(checked);
  }, [unvotedTracks]);

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
        <Typography fontSize='16px' fontWeight={400} sx={{ pb: '20px', textAlign: 'left' }}>
          {t('Give your voting power to another account.')}
        </Typography>
        <Grid alignItems='center' container justifyContent='space-between' position='relative'>
          <Grid item xs={8.5}>
            <From
              address={address}
              api={api}
              style={{ '> div': { px: '10px' }, '> p': { fontWeight: 400 } }}
              title={t<string>('Delegate from account')}
            />
          </Grid>
          <Grid alignItems='center' container item onClick={() => setShowExistingVoted(!showExistingVoted)} sx={{ cursor: 'pointer', mt: '25px' }} xs={3}>
            {t('Existing votes')}
            <ArrowForwardIosIcon sx={{ color: 'secondary.light', fontSize: 18, m: 'auto', stroke: '#BA2882', strokeWidth: '2px', transform: showExistingVoted ? 'rotate(-90deg)' : 'rotate(90deg)', transitionDuration: '0.3s', transitionProperty: 'transform' }} />
          </Grid>
          {showExistingVoted &&
            <Grid container alignItems='flex-start' sx={{ boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)', bgcolor: 'background.default', border: 1, height: '250px', overflowY: 'scroll', borderRadius: '5px', borderColor: 'primary.main', position: 'absolute', top: '81px', zIndex: 100 }} >
              <Grid container item justifyContent='space-between' sx={{ lineHeight: '40px', fontSize: '18px', fontWeight: 500, borderBottom: 1, borderColor: 'primary.main' }}>
                <Grid item px='25px'>
                  {t('Category')}
                </Grid>
                <Grid item px='25px'>
                  {t('votes')}
                </Grid>
              </Grid>
              {existingVotes && Object.keys(existingVotes).map((key, index) => (
                <Grid container item justifyContent='space-between' key={index} sx={{ lineHeight: '40px', borderBottom: 1, borderColor: 'primary.main' }}>
                  <Grid item px='25px'>
                    {toTitleCase(key)}
                  </Grid>
                  <Grid item px='25px'>
                    {existingVotes[key]}
                  </Grid>
                </Grid>
              ))
              }
            </Grid>
          }
        </Grid>
        <AmountWithOptions
          inputWidth={9}
          label={t<string>('Delegate Vote Value ({{token}})', { replace: { token } })}
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
              <Infotip iconLeft={5} iconTop={2} showInfoMark text={<AlreadyLockedTooltipText accountLocks={accountLocks} address={address} /> || 'Fetching ...'}>
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
        <Grid container justifyContent='space-between'>
          <Grid item>
            <Infotip iconTop={26} showQuestionMark text={'Please select all the categories in which you would like to delegate your votes.'}>
              <Typography fontSize='16px' fontWeight={400} sx={{ pt: '20px', textAlign: 'left' }}>
                {t('Referenda Category')}
              </Typography>
            </Infotip>
          </Grid>
          <Grid item onClick={onSelectAll}>
            <Typography fontSize='16px' fontWeight={400} sx={{ color: theme.palette.mode === 'dark' ? 'text.primary' : 'primary.main', pt: '20px', textAlign: 'left', cursor: 'pointer', textDecorationLine: 'underline' }}>
              {t('Select All')}
            </Typography>
          </Grid>
        </Grid>
        <List sx={{ width: '100%', maxWidth: '100%', border: 1, borderColor: 'primary.main', borderRadius: '5px', height: '200px', overflowY: 'scroll' }}>
          {unvotedTracks
            ? unvotedTracks.map((value, index) => (
              <ListItem
                disablePadding
                key={index}
                sx={{ height: '25px' }}
              >
                <ListItemButton dense onClick={handleToggle(value[0])} role={undefined}>
                  <ListItemText
                    primary={`${toTitleCase(value[1].name)}`}
                  />
                  <ListItemIcon sx={{ minWidth: '20px' }}>
                    <Checkbox2
                      checked={checked.indexOf(value[0]) !== -1}
                      iconStyle={{ transform: 'scale(1.13)' }}
                      label={''}
                    // onChange={}
                    />
                  </ListItemIcon>
                </ListItemButton>
              </ListItem>
            ))
            : <Skeleton height={20} sx={{ display: 'inline-block', fontWeight: 'bold', transform: 'none', width: '95%', my: '5px' }} />
          }
        </List>
        <Grid container justifyContent='flex-end'>
          <PButton
            _mt='10px'
            _width={50}
            disabled={delegateAmount === '0' || !checked?.length}
            text={t<string>('Next')}
          />
        </Grid>
      </Box>
    </Modal>
  );
}
