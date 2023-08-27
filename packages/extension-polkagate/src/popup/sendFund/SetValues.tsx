// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState, useMemo } from 'react';

import { Balance } from '@polkadot/types/interfaces';
import { BN, BN_ZERO } from '@polkadot/util';

import { AmountWithOptions, FullscreenChain, InputAccount, ShowBalance } from '../../components';
import { useTranslation } from '../../components/translate';
import { useApi, useChain, useDecimal, useFormatted, useTeleport } from '../../hooks';
import { CHAINS_WITH_BLACK_LOGO } from '../../util/constants';
import getLogo from '../../util/getLogo';
import { BalancesInfo, DropdownOption } from '../../util/types';
import { amountToHuman, amountToMachine } from '../../util/utils';
import { toTitleCase } from '../governance/utils/util';

interface Props {
  address: string
  balances: BalancesInfo | undefined;
  assetId: number | undefined
}

export default function SetValues({ address, assetId, balances }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const api = useApi(address);
  const decimal = useDecimal(address);
  const formatted = useFormatted(address);
  const chain = useChain(address);
  const teleportState = useTeleport(address);

  console.log('teleportState:',teleportState)
  const destinationGenesisHashes = useMemo((): DropdownOption[] => {
    const currentChainOption = chain ? [{ text: chain.name, value: chain.genesisHash }] : [];
    const mayBeTeleportDestinations = teleportState?.destinations?.map(({ paraId, info }) => {
      return { text: toTitleCase(info), value: paraId };
    });

    return currentChainOption.concat(mayBeTeleportDestinations || []);
  }, [chain, teleportState?.destinations]);

  const [display, setDisplay] = useState<string | undefined>();
  const [amount, setAmount] = useState<string | undefined>();
  const [estimatedFee, setEstimatedFee] = useState<Balance>();
  const [recipientAddress, setRecipientAddress] = useState<string>();
  const [recipientChainGenesisHash, setRecipientChainGenesisHash] = useState<string>();

  useEffect(() => {
    const value = amount ? amountToMachine(amount, decimal) : BN_ZERO;

    api && formatted && assetId !== undefined && api.tx.assets && api.tx.assets.transferKeepAlive(assetId, formatted, value).paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee)).catch(console.error);
    api && formatted && assetId === undefined && api.tx.balances && api.tx.balances.transferKeepAlive(formatted, value).paymentInfo(formatted).then((i) => setEstimatedFee(i?.partialFee)).catch(console.error);
  }, [amount, api, assetId, decimal, formatted]);

  const onAllAmount = useCallback(() => {
    const allAmount = amountToHuman(balances?.freeBalance ? balances.freeBalance.toString() : 0, decimal);

    setAmount(allAmount);
  }, [balances?.freeBalance, decimal]);

  return (
    <Grid container item sx={{ display: 'block', px: '10%' }}>
      <Grid alignItems='baseline' container item spacing={1}>
        <Grid item>
          <FontAwesomeIcon
            color={theme.palette.text.primary}
            icon={faPaperPlane}
            size='xl'
            style={{ paddingBottom: '5px' }}
          />
        </Grid>
        <Grid item>
          <Typography fontSize='30px' fontWeight={700} pb='20px' pt='30px'>
            {t<string>('Send Fund')}
          </Typography>
        </Grid>
      </Grid>
      <Typography fontSize='16px' fontWeight={400}>
        {t<string>('Please enter the amount you wish to transfer. For cross-chain transfers, adjust the recipient chain and take into account the applicable cross-chain fee.')}
      </Typography>
      <Grid alignItems='center' borderBottom='1px rgba(99, 54, 77, 0.2) solid' container item justifyContent='space-between' m='auto' pb='15px' pt='18px'>
        <Grid container item justifyContent='space-between'>
          <Grid item md={6} xs={12}>
            <Typography fontSize='14px'>
              {t<string>('Transferable amount')}
            </Typography>
            <Grid alignItems='center' container item sx={{ border: 1, height: '48px', p: '0 5px', fontSize: '18px', borderColor: 'rgba(75, 75, 75, 0.3)' }}>
              <ShowBalance balance={balances?.freeBalance} decimal={balances?.decimal} token={balances?.token} />
            </Grid>
          </Grid>
          <Grid item md={5.5} xs={12}>
            <Typography fontSize='14px'>
              {t<string>('Chain')}
            </Typography>
            <Grid alignItems='center' container item sx={{ border: 1, height: '48px', p: '0 5px', fontSize: '18px', borderColor: 'rgba(75, 75, 75, 0.3)' }}>
              <Avatar src={getLogo(chain)} sx={{ filter: (CHAINS_WITH_BLACK_LOGO.includes(chain) && theme.palette.mode === 'dark') ? 'invert(1)' : '', borderRadius: '50%', height: 29, width: 29 }} variant='square' />
              <Typography fontSize='14px' pl='5px'>
                {chain?.name}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <AmountWithOptions
          inputWidth={8.4}
          label={t<string>('Amount')}
          onChangeAmount={setAmount}
          onPrimary={onAllAmount}
          primaryBtnText={t<string>('All amount')}
          style={{
            fontSize: '16px',
            mt: '25px',
            width: '71.5%'
          }}
          value={amount}
        />
        <Grid alignItems='center' container item justifyContent='space-between' sx={{ width: '50%', height: '38px' }}>
          <Typography fontSize='16px' fontWeight={400}>
            {t<string>('Network Fee')}
          </Typography>
          <ShowBalance api={api} balance={estimatedFee} />
        </Grid>
      </Grid>
      <Typography fontSize='20px' fontWeight={500} pt='10px'>
        {t<string>('To')}
      </Typography>
      <Grid container item justifyContent='space-between'>
        <Grid item md={6} xs={12}>
          <InputAccount
            address={recipientAddress}
            chain={chain}
            label={t('Account')}
            setAddress={setRecipientAddress}
            style={{ height: '50px', pt: '10px', width: '100%' }}
          />
        </Grid>
        <Grid item md={5.5} xs={12}>
          <FullscreenChain
            address={address}
            defaultValue={chain?.genesisHash}
            label={t<string>('Chain')}
            onChange={setRecipientChainGenesisHash}
            options={destinationGenesisHashes}
            style={{ pt: '10px', width: '100%' }}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
