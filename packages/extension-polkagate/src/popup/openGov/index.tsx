// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { ActionContext } from '../../components';
import { useApi, useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';
import { postData } from '../../util/api';

export default function OpenGov(): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const { address } = useParams<{ address: string }>();
  const api = useApi(address);

  const _onBackClick = useCallback(() => {
    onAction('/');
  }, [onAction]);

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

  return (
    <>
      <HeaderBrand
        onBackClick={_onBackClick}
        showBackArrow
        text={t<string>('Open Governance')}
      />
      <Grid item>
        Hello
      </Grid>
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