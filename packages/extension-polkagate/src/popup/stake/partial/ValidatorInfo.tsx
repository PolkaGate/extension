// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Close as CloseIcon } from '@mui/icons-material';
import { Avatar, Grid, IconButton, Link, Slide, Typography, useTheme } from '@mui/material';
import React, { useCallback, useState, useEffect } from 'react';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';

import { Identity, Label, Progress, ShowBalance } from '../../../components';
import { useTranslation } from '../../../hooks';
import { DeriveAccountInfo, DeriveStakingQuery } from '@polkadot/api-derive/types';
import getLogo from '../../../util/getLogo';

interface Props {
  address: string;
  api: ApiPromise;
  chain: Chain;
  showValidatorInfo: boolean;
  validatorInfo?: DeriveStakingQuery;
  validatorsIdentities?: DeriveAccountInfo[];
  setShowValidatorInfo: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ValidatorInfo({ address, api, chain, setShowValidatorInfo, showValidatorInfo, validatorInfo, validatorsIdentities }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const ValidatorInfoRef = React.useRef(null);

  const [accountInfo, setAccountInfo] = useState<DeriveAccountInfo | undefined>();

  const chainName = chain?.name?.replace(' Relay Chain', '')?.replace(' Network', '');

  const sortedNominators = validatorInfo?.exposure?.others?.sort((a, b) => b.value - a.value);
  const own = api.createType('Balance', validatorInfo?.exposure.own || validatorInfo?.stakingLedger.active);
  const total = api.createType('Balance', validatorInfo?.exposure.total);
  const commission = Number(validatorInfo?.validatorPrefs.commission) / (10 ** 7) < 1 ? 0 : Number(validatorInfo?.validatorPrefs.commission) / (10 ** 7);
  const myIndex = sortedNominators?.findIndex((n) => n.who.toString() === address);

  const _closeMenu = useCallback(
    () => setShowValidatorInfo(false),
    [setShowValidatorInfo]
  );

  useEffect(() => {
    const accountInfo = validatorsIdentities?.find((v) => v.accountId === validatorInfo?.accountId);

    if (accountInfo) {
      return setAccountInfo(accountInfo);
    }

    // eslint-disable-next-line no-void
    void api.derive.accounts.info(validatorInfo.accountId).then((info) => {
      setAccountInfo(info);
    });
  }, [api, validatorInfo, validatorsIdentities]);

  const ValidatorInformation = () => (
    <Grid container direction='column' sx={{ bgcolor: 'backgroung.paper', border: '1px solid', borderColor: 'secondary.main', borderRadius: '5px', p: '10px', pb: '5px', m: '20px auto', width: '92%' }}>
      <Grid container justifyContent='space-between' item sx={{ borderBottom: '1px solid', borderColor: 'secondary.main', mb: '5px', pb: '2px' }}>
        <Grid item width='85%' lineHeight={1}>
          <Identity api={api} accountInfo={accountInfo} address={validatorInfo?.accountId} chain={chain} formatted={validatorInfo?.accountId} identiconSize={25} style={{ fontSize: '16px' }} withShortAddress />
        </Grid>
        <Grid item width='15%'>
          <Link
            height='37px'
            href={`https://${chainName}.subscan.io/account/${validatorInfo?.accountId}`}
            m='auto'
            rel='noreferrer'
            target='_blank'
            underline='none'
          >
            <Avatar
              alt={'subscan'}
              src={getLogo('subscan')}
              sx={{ height: 25, m: '6px auto', width: 25 }}
            />
          </Link>
        </Grid>
      </Grid>
      <Grid container item>
        <Grid container direction='column' item sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main' }} width='50%'>
          <Grid item display='inline-flex'>
            <Typography fontSize='12px' fontWeight={300} lineHeight='22px' pr='5px'>
              {t<string>('Own')}:
            </Typography>
            <ShowBalance
              api={api}
              balance={own}
              decimalPoint={4}
              height={22}
            />
          </Grid>
          <Grid item display='inline-flex'>
            <Typography fontSize='12px' fontWeight={300} lineHeight='16px' pr='5px'>
              {t<string>('Commission')}:
            </Typography>
            <Typography fontSize='12px' fontWeight={300} lineHeight='16px'>
              {commission}
            </Typography>
          </Grid>
        </Grid>
        <Grid container direction='column' item width='50%'>
          <Grid item display='inline-flex' justifyContent='end'>
            <Typography fontSize='12px' fontWeight={300} lineHeight='22px' pr='5px'>
              {t<string>('Total')}:
            </Typography>
            <ShowBalance
              api={api}
              balance={total}
              decimalPoint={4}
              height={22}
            />
          </Grid>
          <Grid item display='inline-flex' justifyContent='end'>
            <Typography fontSize='12px' fontWeight={300} lineHeight='16px' pr='5px'>
              {t<string>('My rank')}:
            </Typography>
            <Typography fontSize='12px' fontWeight={300} lineHeight='16px'>
              {myIndex}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  const stakedValue = (value: Compact<u128>) => {
    const valueToShow = api.createType('Balance', value);

    return valueToShow;
  };

  const percent = (value: Compact<u128>) => {
    const percentToShow = (Number(value.toString()) * 100 / Number(total.toString())).toFixed(2);

    return percentToShow;
  };

  const NominatorTableWithLabel = () => (
    <Label label={`Nominators (${validatorInfo?.exposure?.others?.length})`} style={{ margin: '20px auto', width: '92%' }}>
      <Grid display='block' direction='column' item container sx={{ border: '1px solid', borderColor: 'secondary.main', borderRadius: '5px', maxHeight: '200px', overflowY: 'scroll', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none', width: 0 } }}>
        <Grid container item sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.main' }}>
          <Grid container item width='50%' justifyContent='center' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main' }}>
            <Typography fontSize='12px' fontWeight={300} lineHeight='30px'>
              {t<string>('Account')}
            </Typography>
          </Grid>
          <Grid container item width='30%' justifyContent='center' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main' }}>
            <Typography fontSize='12px' fontWeight={300} lineHeight='30px'>
              {t<string>('Staked')}
            </Typography>
          </Grid>
          <Grid container item width='20%' justifyContent='center'>
            <Typography fontSize='12px' fontWeight={300} lineHeight='30px'>
              {t<string>('Percent')}
            </Typography>
          </Grid>
        </Grid>
        {sortedNominators?.length
          ? (
            sortedNominators?.map(({ value, who }, index) => (
              <Grid key={index} container item sx={{ '> :last-child': { border: 'none' }, borderBottom: '1px solid', borderBottomColor: 'secondary.main', lineHeight: '40px' }}>
                <Grid container item width='50%' justifyContent='center' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main', pl: '10px' }}>
                  <Identity api={api} formatted={who.toString()} chain={chain} identiconSize={25} showShortAddress style={{ fontSize: '16px' }} />
                </Grid>
                <Grid container item width='30%' justifyContent='center' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main' }}>
                  <ShowBalance
                    api={api}
                    balance={stakedValue(value)}
                    decimalPoint={2}
                    height={22}
                  />
                </Grid>
                <Grid container item width='20%' justifyContent='center'>
                  {percent(value)}%
                </Grid>
              </Grid>
            ))
          )
          : (<Typography fontSize='18px' fontWeight={300} lineHeight='40px' textAlign='center'>{t<string>('No nominator found!')}</Typography>)
        }
      </Grid>
    </Label>
  );

  const page = (
    <Grid alignItems='flex-start' bgcolor='background.default' container display='block' item mt='46px' sx={{ borderRadius: '10px 10px 0px 0px', height: 'parent.innerHeight' }} width='100%'>
      <Grid container justifyContent='center' my='20px'>
        <Typography fontSize='28px' fontWeight={400} lineHeight={1.4} sx={{ borderBottom: '2px solid', borderColor: 'secondary.main' }}>
          {t<string>('Validator’s Info')}
        </Typography>
      </Grid>
      <ValidatorInformation />
      <NominatorTableWithLabel />
      <IconButton
        onClick={_closeMenu}
        sx={{
          left: '15px',
          p: 0,
          position: 'absolute',
          top: '65px'
        }}
      >
        <CloseIcon sx={{ color: 'text.primary', fontSize: 35 }} />
      </IconButton>
    </Grid>
  );

  return (
    <Grid
      bgcolor={theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'}
      container
      height='100%'
      justifyContent='end'
      ref={ValidatorInfoRef}
      sx={[{
        mixBlendMode: 'normal',
        overflowY: 'scroll',
        position: 'fixed',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
          display: 'none',
          width: 0
        },
        top: 0
      }]}
      width='357px'
      zIndex={10}
    >
      <Slide
        container={ValidatorInfoRef.current}
        direction='up'
        in={showValidatorInfo}
        mountOnEnter
        unmountOnExit
      >
        {page}
      </Slide>
    </Grid>
  );
}
