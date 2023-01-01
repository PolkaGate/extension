// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Close as CloseIcon } from '@mui/icons-material';
import { Avatar, Grid, IconButton, Link, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { DeriveAccountInfo, DeriveStakingQuery } from '@polkadot/api-derive/types';
import { Chain } from '@polkadot/extension-chains/types';
import { BN } from '@polkadot/util';

import { Identity, Label, ShowBalance, SlidePopUp } from '../../../components';
import { useTranslation } from '../../../hooks';
import getLogo from '../../../util/getLogo';

interface Props {
  api: ApiPromise;
  stakerAddress?: string;
  chain: Chain;
  staked: BN | undefined;
  showValidatorInfo: boolean;
  validatorInfo?: DeriveStakingQuery;
  validatorsIdentities?: DeriveAccountInfo[];
  setShowValidatorInfo: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ValidatorInfo({ api, chain, setShowValidatorInfo, showValidatorInfo, staked, stakerAddress, validatorInfo, validatorsIdentities }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [accountInfo, setAccountInfo] = useState<DeriveAccountInfo | undefined>();

  const chainName = chain?.name?.replace(' Relay Chain', '')?.replace(' Network', '');

  const sortedNominators = validatorInfo?.exposure?.others?.sort((a, b) => b.value - a.value);
  const own = api.createType('Balance', validatorInfo?.exposure.own || validatorInfo?.stakingLedger.active);
  const total = api.createType('Balance', validatorInfo?.exposure.total);
  const commission = Number(validatorInfo?.validatorPrefs.commission) / (10 ** 7) < 1 ? 0 : Number(validatorInfo?.validatorPrefs.commission) / (10 ** 7);
  const myIndex = sortedNominators?.findIndex((n) => n.who.toString() === stakerAddress);
  const myPossibleIndex = staked && myIndex === -1 ? sortedNominators.findIndex((n) => new BN(isHex(n.value) ? hexToBn(n.value) : n.value).lt(staked)) : -1;

  const closeMenu = useCallback(
    () => setShowValidatorInfo(false),
    [setShowValidatorInfo]
  );

  useEffect(() => {
    const accountInfo = validatorsIdentities?.find((v) => v.accountId === validatorInfo?.accountId);

    if (accountInfo) {
      return setAccountInfo(accountInfo);
    }

    // eslint-disable-next-line no-void
    void api.derive.accounts.info(validatorInfo?.accountId).then((info) => {
      setAccountInfo(info);
    });
  }, [api, validatorInfo, validatorsIdentities]);

  const ValidatorInformation = () => (
    <Grid container direction='column' sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.main', borderRadius: '5px', m: '20px auto', p: '10px', pb: '5px', width: '92%' }}>
      <Grid alignItems='center' container item justifyContent='space-between' sx={{ borderBottom: '1px solid', borderColor: 'secondary.main', mb: '5px', pb: '2px' }}>
        <Grid item lineHeight={1} width='85%'>
          <Identity accountInfo={accountInfo} address={validatorInfo?.accountId} api={api} chain={chain} formatted={validatorInfo?.accountId?.toString()} identiconSize={25} style={{ fontSize: '16px' }} withShortAddress />
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
          <Grid display='inline-flex' fontSize='12px' fontWeight={400} item>
            <Typography fontSize='12px' fontWeight={300} lineHeight='25px' pr='5px'>
              {t<string>('Own')}:
            </Typography>
            <ShowBalance
              api={api}
              balance={own}
              decimalPoint={4}
              height={22}
            />
          </Grid>
          <Grid display='inline-flex' item>
            <Typography fontSize='12px' fontWeight={300} lineHeight='16px' pr='5px'>
              {t<string>('Commission')}:
            </Typography>
            <Typography fontSize='12px' fontWeight={400} lineHeight='16px'>
              {commission} %
            </Typography>
          </Grid>
        </Grid>
        <Grid container direction='column' item justifyContent='center' width='50%'>
          <Grid display='inline-flex' fontSize='12px' fontWeight={400} item justifyContent='flex-end'>
            <Typography fontSize='12px' fontWeight={300} lineHeight='25px' pr='5px'>
              {t<string>('Total')}:
            </Typography>
            {total.isZero()
              ? <Typography fontSize='12px' fontWeight={400} lineHeight='22px' pr='5px'>
                {t<string>('N/A')}
              </Typography>
              : <ShowBalance
                api={api}
                balance={total}
                decimalPoint={4}
                height={22}
              />
            }
          </Grid>
          {!staked?.isZero() &&
            <Grid display='inline-flex' item justifyContent='end'>
              <Typography fontSize='12px' fontWeight={300} lineHeight='16px' pr='5px'>
                {t<string>(`${myIndex !== -1 ? 'My rank' : 'My possible rank'}`)}:
              </Typography>
              <Typography fontSize='12px' fontWeight={400} lineHeight='16px'>
                {myIndex !== -1 ? (myIndex + 1) : myPossibleIndex !== -1 ? (myPossibleIndex + 1) : 'N/A'}
              </Typography>
            </Grid>}
        </Grid>
      </Grid>
    </Grid>
  );

  const stakedValue = (value: string) => {
    const valueToShow = api.createType('Balance', value);

    return valueToShow;
  };

  const percent = (value: string) => {
    const percentToShow = (Number(value) * 100 / Number(total.toString())).toFixed(2);

    return percentToShow;
  };

  const label = validatorInfo?.exposure?.others?.length
    ? t('Nominators ({{count}})', { replace: { count: validatorInfo?.exposure?.others?.length } })
    : t('Nominators');

  const NominatorTableWithLabel = () => (
    <Label
      label={label}
      style={{ margin: '20px auto', width: '92%' }}
    >
      <Grid container direction='column' display='block' item sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.main', borderRadius: '5px', maxHeight: parent.innerHeight * 1 / 2, overflowY: 'scroll', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none', width: 0 } }}>
        {sortedNominators?.length
          ? (<>
            <Grid container item sx={{ '> :last-child': { border: 'none' }, borderBottom: '1px solid', borderBottomColor: 'secondary.main' }}>
              <Grid container item justifyContent='center' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main' }} width='50%'>
                <Typography fontSize='12px' fontWeight={300} lineHeight='30px'>
                  {t<string>('Account')}
                </Typography>
              </Grid>
              <Grid container item justifyContent='center' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main' }} width='30%'>
                <Typography fontSize='12px' fontWeight={300} lineHeight='30px'>
                  {t<string>('Staked')}
                </Typography>
              </Grid>
              <Grid container item justifyContent='center' width='20%'>
                <Typography fontSize='12px' fontWeight={300} lineHeight='30px'>
                  {t<string>('Percent')}
                </Typography>
              </Grid>
            </Grid>
            {sortedNominators?.map(({ value, who }, index) => (
              <Grid container item key={index} sx={{ '> :last-child': { border: 'none' }, bgcolor: index === myIndex ? 'rgba(153, 0, 79, 0.4)' : 'transparent', borderBottom: '1px solid', borderBottomColor: 'secondary.main', lineHeight: '40px' }}>
                <Grid container item justifyContent='center' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main', pl: '10px' }} width='50%'>
                  <Identity api={api} chain={chain} formatted={who.toString()} identiconSize={25} showShortAddress style={{ fontSize: '16px' }} />
                </Grid>
                <Grid container item justifyContent='center' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main' }} width='30%'>
                  <ShowBalance
                    api={api}
                    balance={stakedValue(String(value))}
                    decimalPoint={2}
                    height={22}
                  />
                </Grid>
                <Grid container item justifyContent='center' width='20%'>
                  {percent(String(value))}%
                </Grid>
              </Grid>
            ))}
          </>
          )
          : (<Typography fontSize='16px' fontWeight={400} m='auto' py='20px' textAlign='center' width='92%'>
            {t<string>('The list of nominators is not available to be displayed as this validator is in the waiting status.')}
          </Typography>)
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
        onClick={closeMenu}
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
    <SlidePopUp show={showValidatorInfo}>
      {page}
    </SlidePopUp>
  );
}
