// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountBalance as TreasuryIcon, AdminPanelSettings as AdminsIcon, BorderAll as All, Cancel, Close, Groups as FellowshipIcon, HowToVote as ReferendaIcon, Hub as Root } from '@mui/icons-material/';
import { Box, Button, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { logoBlack, logoWhite } from '../../assets/logos';
import { useApi, useTranslation } from '../../hooks';
import { postData } from '../../util/api';

export default function OpenGov(): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { address } = useParams<{ address: string }>();
  const api = useApi(address);

  useEffect(() => {
    console.log('*******************************************************');
    getReferendumVotes('kusama', 124);
  }, []);

  useEffect(() => {
    if (!api) {
      return;
    }

    if (!api.consts.referenda) {
      console.log('OpenGov is not supported on this chain');

      return;
    }

    console.log('getting info ...');

    console.log('Maximum size of the referendum queue for a single track:', api.consts.referenda.maxQueued.toString());
    console.log('minimum amount to be used as a deposit :', api.consts.referenda.submissionDeposit.toString());
    console.log('*******************************************************');
    console.log('Information concerning the different referendum tracks:', api.consts.referenda.tracks.toString());
    console.log('*******************************************************');
    console.log('blocks after submission that a referendum must begin decided by.', api.consts.referenda.undecidingTimeout.toString());

    console.log('*******************************************************');
    console.log('*******************************************************');

    api.query.referenda.referendumCount().then((count) => {
      console.log('total referendum count:', count.toString());

      const latestReferendumNumber = count.toNumber() - 2;
      api.query.referenda.referendumInfoFor(latestReferendumNumber).then((res) => {
        console.log(`referendumInfoFor referendum ${latestReferendumNumber} :, ${res}`);
      });
    }).catch(console.error);

    const trackId_mediumSpender = 33;
    api.query.referenda.decidingCount(trackId_mediumSpender).then((res) => {
      console.log('total referendum being decided in trackId_mediumSpender:', res.toString());
    }).catch(console.error);

    api.query.referenda.trackQueue(trackId_mediumSpender).then((res) => {
      console.log('trackQueue for trackId_mediumSpender:', res.toString());
    }).catch(console.error);
  }, [api]);

  useEffect(() => {
    /** to change app width to full screen */
    const root = document.getElementById('root');

    root.style.width = '100%';
  }, []);

  const [selectedTopMenu, setSelectedTopMenu] = useState('Referenda');
  const onTopMenuMenuClick = useCallback((item: 'Referenda' | 'Fellowship') => {
    setSelectedTopMenu(item);
  }, []);

  function TopMenu({ item }: { item: 'Referenda' | 'Fellowship' }): React.ReactElement<{ item: 'Referenda' | 'Fellowship' }> {
    return (
      <Grid alignItems='center' container item justifyContent='center' onClick={() => onTopMenuMenuClick(item)} sx={{ px: '5px', bgcolor: selectedTopMenu === item ? 'background.paper' : 'primary.main', color: selectedTopMenu === item ? 'primary.main' : 'text.secondary', width: '150px', height: '51.5px', cursor: 'pointer' }}>
        <Typography sx={{ display: 'inline-block', fontWeight: 500, fontSize: '20px' }}>
          {item}
        </Typography>
        {item === 'Fellowship'
          ? <FellowshipIcon sx={{ fontSize: 29, ml: '10px' }} />
          : <ReferendaIcon sx={{ fontSize: 29, ml: '10px', transform: 'scaleX(-1)' }} />
        }
      </Grid>
    );
  }

  function MenuItem({ borderWidth = '2px', icon, item, width = '13.5%', fontWeight, clickable = true }: { item: string, icon?: React.ReactElement, width?: string, borderWidth?: string, fontWeight?: number, clickable?: boolean }): React.ReactElement {
    return (
      <Grid alignItems='center' container item sx={{ cursor: clickable && 'pointer', fontSize: '18px', width, borderBottom: `${borderWidth} solid`, borderColor: 'primary.main', mr: '37px', py: '5px', '&:hover': clickable && { color: 'primary.main', fontWeight: 700 } }}>
        <Typography sx={{ display: 'inline-block', fontWeight: fontWeight || 'inherit' }}>
          {item}
        </Typography>
        {icon}
      </Grid>
    );
  }

  return (
    <>
      <Grid alignItems='center' container id='header' sx={{ bgcolor: '#180710', height: '85px', color: 'text.secondary', fontSize: '42px', fontWeight: 400, fontFamily: 'Eras' }}>
        <Box
          component='img'
          src={theme.palette.mode === 'light' ? logoBlack as string : logoWhite as string}
          sx={{ height: 50, width: 50, ml: '50px', mr: '8.5px' }}
        />
        Polkagate
      </Grid>
      <Grid alignItems='center' container id='menu' justifyContent='space-between' sx={{ bgcolor: 'primary.main', height: '51.5px', color: 'text.secondary', fontSize: '20px', fontWeight: 500, pl: '50px' }}>
        <Grid container item width='50%'>
          <TopMenu item={'Referenda'} />
          <TopMenu item={'Fellowship'} />
        </Grid>
        <Grid container item justifyContent='flex-end' sx={{ pr: '50px' }} width='50%'>
          <Button
            // disabled={disabled}
            // onClick={_onClick}
            sx={{
              backgroundColor: 'background.paper',
              borderRadius: '5px',
              color: 'primary.main',
              fontSize: '18px',
              fontWeight: 500,
              height: '36px',
              textTransform: 'none',
              width: '208px',
              '&:hover': {
                backgroundColor: '#fff',
                color: '#3c52b2'
              }
            }}
            variant='contained'
          >
            Multirole Delegate
          </Button>
          <Button
            // disabled={disabled}
            // onClick={_onClick}
            sx={{
              backgroundColor: 'background.paper',
              borderRadius: '5px',
              color: 'primary.main',
              fontSize: '18px',
              fontWeight: 500,
              height: '36px',
              textTransform: 'none',
              ml: '15px',
              width: '208px',
              '&:hover': {
                backgroundColor: '#fff',
                color: '#3c52b2'
              }
            }}
            variant='contained'
          >
            Submit Referendum
          </Button>
        </Grid>
      </Grid>
      {selectedTopMenu === 'Referenda' &&
        <Grid alignItems='flex-start' container item sx={{ bgcolor: 'background.paper', px: '50px', py: '15px' }}>
          <MenuItem
            fontWeight={500}
            icon={<All sx={{ fontSize: 20, fontWeight: 500, ml: '10px' }} />}
            item='All'
          />
          <MenuItem
            fontWeight={500}
            icon={<Root sx={{ fontSize: 20, ml: '10px' }} />}
            item='Root'
          />
          <MenuItem
            fontWeight={500}
            icon={<Close sx={{ fontSize: 20, ml: '10px' }} />}
            item='Referendum Canceler'
          />
          <MenuItem
            fontWeight={500}
            icon={<Cancel sx={{ fontSize: 20, ml: '10px' }} />}
            item='Referendum Killer'
          />
          <Grid container item sx={{ width: '15%' }}>
            <MenuItem
              clickable={false}
              fontWeight={500}
              icon={<AdminsIcon sx={{ fontSize: 20, ml: '10px' }} />}
              item='Admins'
              width='100%'
            />
            <MenuItem
              borderWidth='1px'
              item='Auction Admin'
              width='100%'
            />
            <MenuItem
              borderWidth='1px'
              item='General Admin'
              width='100%'
            />
            <MenuItem
              borderWidth='1px'
              item='Lease Admin'
              width='100%'
            />
            <MenuItem
              borderWidth='2px'
              item='Staking Admin'
              width='100%'
            />
          </Grid>
          <Grid container item sx={{ width: '15%' }}>
            <MenuItem
              clickable={false}
              fontWeight={500}
              icon={<TreasuryIcon sx={{ fontSize: 20, ml: '10px' }} />}
              item='Treasury'
              width='100%'
            />
            <MenuItem
              borderWidth='1px'
              item='Treasurer'
              width='100%'
            />
            <MenuItem
              borderWidth='1px'
              item='small Tipper'
              width='100%'
            />
            <MenuItem
              borderWidth='1px'
              item='Big Tipper'
              width='100%'
            />
            <MenuItem
              borderWidth='1px'
              item='Small Spender'
              width='100%'
            />
            <MenuItem
              borderWidth='1px'
              item='Medium Spender'
              width='100%'
            />
            <MenuItem
              borderWidth='2px'
              item='Big Spender'
              width='100%'
            />
          </Grid>
        </Grid>
      }
    </>
  );
}

export async function getReferendumVotes(chainName: string, referendumIndex: number | undefined): Promise<string | null> {
  if (!referendumIndex) {
    console.log('referendumIndex is undefined getting Referendum Votes ');

    return null;
  }

  console.log(`Getting referendum ${referendumIndex} votes from subscan ... `);

  return new Promise((resolve) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      postData('https://' + chainName + '.api.subscan.io/api/scan/referenda/votes',
        {
          page: 2,
          referendum_index: referendumIndex,
          row: 99
        })
        .then((data: { message: string; data: { count: number, list: string[]; } }) => {
          if (data.message === 'Success') {
            console.log(data.data)


            resolve(data.data);
          } else {
            console.log(`Fetching message ${data.message}`);
            resolve(null);
          }
        });
    } catch (error) {
      console.log('something went wrong while getting referendum votes ');
      resolve(null);
    }
  });
}