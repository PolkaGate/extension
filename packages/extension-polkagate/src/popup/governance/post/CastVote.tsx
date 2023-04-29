// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import { Close as CloseIcon } from '@mui/icons-material';
import { Box, FormControl, FormControlLabel, FormLabel, Grid, Modal, Radio, RadioGroup, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { BN, BN_ONE } from '@polkadot/util';

import { AmountWithOptions, From } from '../../../components';
import { useApi, useBalances, useDecimal, useFormatted, useToken, useTranslation } from '../../../hooks';
import { MAX_AMOUNT_LENGTH } from '../../../util/constants';

interface Props {
  address: string | undefined;
  open: boolean;
  setOpen: (value: React.SetStateAction<boolean>) => void
  referendumIndex: number | undefined;
  trackId: number | undefined;
}

export default function CastVote({ address, open, setOpen }: Props): React.ReactElement {
  const { t } = useTranslation();
  const api = useApi(address);
  const formatted = useFormatted(address);
  const token = useToken(address);
  const decimal = useDecimal(address);
  const balances = useBalances(address);
  const [estimatedFee, setEstimatedFee] = useState<Balance>();

  const [voteAmount, setVoteAmount] = React.useState<string>();
  // api.query.balances.reserves
  const vote = api && api.tx.convictionVoting.vote;
  const [conviction, setConviction] = useState(1);

  // useEffect((): void => {
  //   onChange([id, {
  //     Standard: {
  //       balance,
  //       vote: {
  //         aye: isAye,
  //         conviction
  //       }
  //     }
  //   }]);
  // }, [balance, conviction, id, isAye, onChange]);

//   <ConvictionDropdown
//   label={t<string>('conviction')}
//   onChange={setConviction}
//   value={conviction}
//   voteLockingPeriod={voteLockingPeriod}
// />

  useEffect(() => {
    if (!formatted || !vote) {
      return;
    }

    if (!api?.call?.transactionPaymentApi) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return setEstimatedFee(api?.createType('Balance', BN_ONE));
    }

    const dummyVote = undefined;
    const feeDummyParams = ['1', dummyVote];

    vote(...feeDummyParams).paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee)).catch(console.error);
  }, [api, formatted, vote]);

  const handleClose = () => {
    setOpen(false);
  };

  const onSelectVote = useCallback((event: React.ChangeEvent<HTMLInputElement>, value: 'Staked' | 'Others'): void => {
  }, []);

  const onVoteAmountChange = useCallback((value: string) => {
    if (!decimal) {
      return;
    }

    if (value.length > decimal - 1) {
      console.log(`The amount digits is more than decimal:${decimal}`);

      return;
    }

    setVoteAmount(value.slice(0, MAX_AMOUNT_LENGTH));
  }, [decimal]);

  const onMaxAmount = useCallback(() => {
    if (!api || !balances || !estimatedFee) {
      return;
    }

    const ED = api.consts.balances.existentialDeposit as unknown as BN;
    const max = new BN(balances.votingBalance.toString()).sub(ED.muln(2)).sub(new BN(estimatedFee));
    const maxToHuman = amountToHuman(max.toString(), decimal);

    maxToHuman && setVoteAmount(maxToHuman);
  }, [api, balances, decimal, estimatedFee]);

  const style = {
    bgcolor: 'background.paper',
    border: '2px solid #000',
    borderRadius: '10px',
    boxShadow: 24,
    left: '50%',
    pb: 3,
    position: 'absolute',
    pt: 2,
    px: 4,
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '428px'
  };

  return (
    <Modal onClose={handleClose} open={open}>
      <Box sx={{ ...style }}>
        <Grid container justifyContent='space-between' alignItems='center'>
          <Grid item>
            <Typography fontSize='22px' fontWeight={700}>
              {t('Cast Your Votes')}
            </Typography>
          </Grid>
          <Grid item>
            <CloseIcon onClick={handleClose} sx={{ color: 'primary.main', cursor: 'pointer' }} />
          </Grid>
        </Grid>
        <Grid alignContent='flex-start' alignItems='flex-start' container justifyContent='center' sx={{ mt: '20px', position: 'relative', height: window.innerHeight - 240 }}>
          <From
            address={address}
            api={api}
            title={t<string>('Account')}
          />
          <Grid container justifyContent='flex-start' item mt='15px'>
            <FormControl>
              <FormLabel sx={{ color: 'text.primary', fontSize: '16px', '&.Mui-focused': { color: 'text.primary' }, textAlign: 'left' }}>
                {t('Vote')}
              </FormLabel>
              <RadioGroup onChange={onSelectVote} row>
                <FormControlLabel control={<Radio sx={{ color: 'secondary.main', '& .MuiSvgIcon-root': { fontSize: 28 } }} value='Aye' />} label={<Typography sx={{ fontSize: '28px', fontWeight: 500 }}>{t('Aye')}</Typography>} />
                <FormControlLabel control={<Radio sx={{ color: 'secondary.main', '& .MuiSvgIcon-root': { fontSize: 28 } }} value='Nay' />} label={<Typography sx={{ fontSize: '28px', fontWeight: 500 }}>{t('Nay')}</Typography>} />
                <FormControlLabel control={<Radio sx={{ color: 'secondary.main', '& .MuiSvgIcon-root': { fontSize: 28 } }} value='Abstain' />} label={<Typography sx={{ fontSize: '28px', fontWeight: 500 }}>{t('Abstain')}</Typography>} />
              </RadioGroup>
            </FormControl>
          </Grid>
          <AmountWithOptions
            label={t<string>(`Vote Value (${token})`)}
            onChangeAmount={onVoteAmountChange}
            onPrimary={onMaxAmount}
            primaryBtnText={t<string>('Max amount')}
            style={{
              mt: '30px',
              width: '100%'
            }}
            value={voteAmount}
          />
          {/* <Balance balances={balances} type={'Voting Balance'} /> */}

        </Grid>

      </Box>
    </Modal>
  );
}
