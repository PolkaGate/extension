// Copyright 2019-2023 @polkadot/extension-polkadot authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Avatar, Grid, Link, SxProps, Theme, Typography } from '@mui/material';
import { Circle } from 'better-react-spinkit';
import React, { useMemo } from 'react';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';

import { Identity } from '../../../components';
import { useTranslation } from '../../../hooks';
import getLogo from '../../../util/getLogo';
import { MyPoolInfo } from '../../../util/types';

interface Props {
  api?: ApiPromise
  chain?: Chain;
  pool?: MyPoolInfo;
  label?: string;
  mode: 'Roles' | 'Ids';
  style?: SxProps<Theme> | undefined;
}

export default function ShowRoles({ api, chain, label, mode, pool, style }: Props): React.ReactElement {
  const { t } = useTranslation();
  const chainName = chain?.name?.replace(' Relay Chain', '')?.replace(' Network', '');

  const accountsToShow = useMemo(() => {
    if (!pool) {
      return;
    }

    if (mode === 'Roles') {
      return ([
        { label: t<string>('Root'), address: pool.bondedPool?.roles?.root?.toString() ?? '' },
        { label: t<string>('Depositor'), address: pool.bondedPool?.roles?.depositor.toString() ?? '' },
        { label: t<string>('Nominator'), address: pool.bondedPool?.roles?.nominator?.toString() ?? '' },
        { label: t<string>('State toggler'), address: pool.bondedPool?.roles?.stateToggler?.toString() ?? '' }
      ]);
    }

    return ([
      { label: t<string>('Stash id'), address: pool.accounts?.stashId?.toString() },
      { label: t<string>('Reward id'), address: pool.accounts?.rewardId?.toString() ?? '' }
    ]);
  }, [mode, pool, t]);

  return (
    <>
      <Grid container sx={style}>
        <Typography fontSize='14px' fontWeight={300} sx={{ textAlign: 'left' }} width='100%'>
          {label}
        </Typography>
        <Grid container direction='column' item sx={{ '> :last-child': { border: 'none' }, bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.main', borderRadius: '5px' }}>
          {accountsToShow?.length
            ? accountsToShow.map((acc, index) => (
              <Grid container fontSize='14px' fontWeight={400} item key={index} lineHeight='37px' textAlign='center' sx={{ borderBottom: '1px solid', borderBottomColor: 'secondary.light' }}>
                <Grid alignItems='center' fontSize='12px' fontWeight={400} item justifyContent='center' pl='6px' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main' }} textAlign='left' width='25%'>
                  {acc.label}
                </Grid>
                <Grid alignItems='center' item justifyContent='center' sx={{ borderRight: '1px solid', borderRightColor: 'secondary.main' }} width='65%'>
                  {acc.address
                    ? <Identity address={acc.address} api={api} chain={chain} formatted={acc.address} showSocial identiconSize={25} style={{ fontSize: '14px', pl: '5px' }} showShortAddress />
                    : <Typography fontSize='16px' fontWeight={400} lineHeight='37px'>
                      {'—'}
                    </Typography>
                  }
                </Grid>
                <Grid alignItems='center' item justifyContent='center' width='10%'>
                  {acc.address
                    ? <Link
                      height='37px'
                      href={`https://${chainName}.subscan.io/account/${acc.address}`}
                      m='auto'
                      rel='noreferrer'
                      target='_blank'
                      underline='none'
                    >
                      <Avatar
                        alt={'subscan'}
                        src={getLogo('subscan')}
                        sx={{ height: 22, m: '6px auto', width: 22 }}
                      />
                    </Link>
                    : <Typography fontSize='16px' fontWeight={400} lineHeight='37px'>
                      {'—'}
                    </Typography>
                  }
                </Grid>
              </Grid>
            ))
            : <Grid alignItems='center' container justifyContent='center'>
              <Grid item>
                <Circle color='#99004F' scaleEnd={0.7} scaleStart={0.4} size={25} />
              </Grid>
              <Typography fontSize='13px' lineHeight='59px' pl='10px'>
                {t<string>('Loading pool information...')}
              </Typography>
            </Grid>
          }
        </Grid>
      </Grid>
    </>
  );
}