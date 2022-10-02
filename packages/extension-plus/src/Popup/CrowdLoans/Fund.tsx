// Copyright 2019-2022 @polkadot/extension-plus authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 *  this component render an individual crowdloan's information
 * */

import { Email, LaunchRounded, SendTimeExtensionOutlined, Twitter } from '@mui/icons-material';
import { Avatar, Button, Divider, Grid, Link, Paper } from '@mui/material';
import { grey } from '@mui/material/colors';
import React from 'react';

import { LinkOption } from '@polkadot/apps-config/endpoints/types';
import { Balance } from '@polkadot/types/interfaces';

import useTranslation from '../../../../extension-ui/src/hooks/useTranslation';
import getLogo from '../../util/getLogo';
import { Crowdloan } from '../../util/plusTypes';
import { amountToHuman, getWebsiteFavico } from '../../util/plusUtils';

interface Props {
  coin: string;
  crowdloan: Crowdloan;
  decimals: number;
  endpoints: LinkOption[];
  isActive?: boolean;
  handleContribute?: (arg0: Crowdloan) => void
  myContributions: Map<string, Balance> | undefined;
}

export default function Fund({ coin, crowdloan, decimals, endpoints, handleContribute, isActive, myContributions }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const getText = (paraId: string): string | undefined => (endpoints.find((e) => e?.paraId === Number(paraId))?.text as string);
  const getHomePage = (paraId: string): string | undefined => (endpoints.find((e) => e?.paraId === Number(paraId))?.homepage as string);
  const getInfo = (paraId: string): string | undefined => (endpoints.find((e) => e?.paraId === Number(paraId))?.info as string);
  const name = crowdloan.identity.info.display || crowdloan.identity.info.legal || getText(crowdloan.fund.paraId);
  const logo = getLogo(getInfo(crowdloan.fund.paraId)) || getWebsiteFavico(crowdloan.identity.info.web || getHomePage(crowdloan.fund.paraId));

  /** FIXME:  new parachains who does not have onchain identity or information in polkadot/apps-config module won't be listed! */
  /** reason: apps-Config needs to be updated regularly buy its developer */
  // if (!name) return (<></>);

  return (
    <Grid item sx={{ pb: '10px' }} xs={12}>
      <Paper elevation={3}>
        <Grid alignItems='center' container sx={{ p: '10px 10px 0px' }}>
          <Grid container item justifyContent='flex-start' sx={{ fontSize: 13, fontWeight: 'fontWeightBold' }} xs={6}>
            <Grid item xs={2}>
              <Avatar
                src={logo}
                sx={{ height: 24, width: 24 }}
              />
            </Grid>

            <Grid container item xs={9}>
              <Grid container item spacing={0.5} xs={12}>
                <Grid item>
                  {name?.slice(0, 15)}
                </Grid>
                {!name && <Grid item sx={{color: grey[600]}}>
                  {t('No on-chain identity')}
                </Grid>
                }
                {(crowdloan.identity.info.web || getHomePage(crowdloan.fund.paraId)) &&
                  <Grid item>
                    <Link
                      href={crowdloan.identity.info.web || getHomePage(crowdloan.fund.paraId)}
                      rel='noreferrer'
                      target='_blank'
                    >
                      <LaunchRounded
                        color='primary'
                        sx={{ fontSize: 15 }}
                      />
                    </Link>
                  </Grid>
                }
                {crowdloan.identity.info.twitter &&
                  <Grid item>
                    <Link href={`https://twitter.com/${crowdloan.identity.info.twitter}`}>
                      <Twitter
                        color='primary'
                        sx={{ fontSize: 15 }}
                      />
                    </Link>
                  </Grid>
                }
                {crowdloan.identity.info.email &&
                  <Grid item>
                    <Link href={`mailto:${crowdloan.identity.info.email}`}>
                      <Email
                        color='secondary'
                        sx={{ fontSize: 15 }}
                      />
                    </Link>
                  </Grid>}
              </Grid>
              <Grid item sx={{ color: crowdloan.fund.hasLeased ? 'green' : '', fontSize: 11 }}>
                {`${t('Parachain Id')}: ${crowdloan.fund.paraId}`}
              </Grid>
            </Grid>
            <Divider flexItem orientation='vertical' variant='fullWidth' />
          </Grid>

          <Grid item sx={{ fontSize: 11, textAlign: 'left' }} xs={2}>
            {t('Lease')}<br />
            {t('End')}<br />
            {t('Raised/Cap')}<br />
            {t('My contribution')}
          </Grid>
          <Grid item sx={{ fontSize: 11, textAlign: 'right' }} xs={4}>
            {String(crowdloan.fund.firstPeriod)} - {String(crowdloan.fund.lastPeriod)}<br />
            {crowdloan.fund.end}<br />
            <b>{Number(amountToHuman(crowdloan.fund.raised, decimals, 0)).toLocaleString()}</b>/{Number(amountToHuman(crowdloan.fund.cap, decimals)).toLocaleString()}{' '} {coin}<br />
            {myContributions?.get(crowdloan.fund.paraId)?.toHuman()}
          </Grid>

          {/* <Grid item sx={{ color: grey[600], fontSize: 11, textAlign: 'left', pl: '5px' }} xs={1}>
            {t('slots')}<br />
            {t('blocks')}<br />
            {coin}s<br />
            {''}
          </Grid> */}

        </Grid>
        <Grid alignItems='center' container justifyContent='center' sx={{ py: '10px' }}>
          {/* <Grid item sx={{ fontSize: 11, pl: '40px' }}>
            {`${t('My contribution')}: ${myContributions?.get(crowdloan.fund.paraId)?.toHuman()}`}
          </Grid> */}

          {isActive && handleContribute &&
            <Grid item>
              <Button
                color='warning'
                endIcon={<SendTimeExtensionOutlined />}
                // eslint-disable-next-line react/jsx-no-bind
                onClick={() => handleContribute(crowdloan)}
                variant='outlined'
              >
                {t('Next')}
              </Button>
            </Grid>
          }
        </Grid>
      </Paper>
    </Grid>
  );
}
