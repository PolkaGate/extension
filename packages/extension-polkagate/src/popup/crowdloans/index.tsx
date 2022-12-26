// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import type { ApiPromise } from '@polkadot/api';
import type { DeriveOwnContributions } from '@polkadot/api-derive/types';
import type { Balance } from '@polkadot/types/interfaces';

import { Avatar, Box, Container, Divider, Grid, Typography, useTheme } from '@mui/material';
import { Crowdloan } from 'extension-polkagate/src/util/types';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { createWsEndpoints } from '@polkadot/apps-config';
import { Chain } from '@polkadot/extension-chains/types';
import { SettingsStruct } from '@polkadot/ui-settings/types';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { auction, crowdloanActive, pastCrowdloan } from '../../assets/icons'
import { ActionContext, HorizontalMenuItem, Identicon, Identity, Progress, ShowBalance, Warning } from '../../components';
import { SettingsContext } from '../../components/contexts';
import { useAccount, useApi, useAuction, useChain, useChainName, useFormatted, useMyAccountIdentity, useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';
import BouncingSubTitle from '../../partials/BouncingSubTitle';
import getContributions from '../../util/api/getContributions';
import getLogo from '../../util/getLogo';
import { getWebsiteFavico } from '../../util/utils';
import AccountBrief from '../account/AccountBrief';

interface MCS {
  contributionBlock: number;
  contributionTimestamp: number;
  unlockingBlock: number;
}

export default function CrowdLoans(): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const theme = useTheme();
  const settings = useContext(SettingsContext);
  const { address } = useParams<{ address: string }>();
  const account = useAccount(address);
  const formatted = useFormatted(address);
  const chain = useChain(address);
  const api = useApi(address);
  const identity = useMyAccountIdentity(address);
  const auctions = useAuction(address);
  const token = (api && api.registry.chainTokens[0]);
  const decimal = (api && api.registry.chainDecimals[0]);
  const chainName = useChainName(address);
  const [myContributions, setMyContributions] = useState<Map<string, Balance> | undefined>();
  const [contributions, setContributions] = useState<Map<string, Balance> | undefined>();
  const [allContributionAmount, setAllContributionamount] = useState<Balance | undefined>();
  const [myContributedCrowdloans, setMyContributedCrowdloans] = useState<Crowdloan[] | undefined>();
  const [myContributionsSubscan, setMyContributionsSubscan] = useState<Map<number, MCS>>();
  const [currentBlockNumber, setCurrentBlockNumber] = useState<number>();

  const allEndpoints = createWsEndpoints((key: string, value: string | undefined) => value || key);
  const paraIds = useMemo(() => auctions?.crowdloans.map((c: Crowdloan) => c.fund.paraId), [auctions?.crowdloans]);
  const crowdloansID = useMemo(() => {
    if (!paraIds || !allEndpoints.length) {
      return;
    }

    const filteredEndpoints = allEndpoints.filter((e) => (e.genesisHashRelay === account?.genesisHash));
    const endpoints = filteredEndpoints.filter((e) => (paraIds?.includes(String(e.paraId))));

    return endpoints;
  }, [account?.genesisHash, allEndpoints, paraIds]);

  const getName = useCallback((paraId: string): string | undefined => (crowdloansID?.find((e) => e?.paraId === Number(paraId))?.text as string), [crowdloansID]);
  // const getText = useCallback((paraId: string): string | undefined => (crowdloansID?.find((e) => e?.paraId === Number(paraId))?.text as string), [crowdloansID]);
  const getHomePage = useCallback((paraId: string): string | undefined => (crowdloansID?.find((e) => e?.paraId === Number(paraId))?.homepage as string), [crowdloansID]);
  const getInfo = useCallback((paraId: string): string | undefined => (crowdloansID?.find((e) => e?.paraId === Number(paraId))?.info as string), [crowdloansID]);
  const logo = useCallback((crowdloan: Crowdloan) => getLogo(getInfo(crowdloan.fund.paraId)) || getWebsiteFavico(crowdloan.identity.info.web || getHomePage(crowdloan.fund.paraId)), [getHomePage, getInfo]);
  const date = useCallback((timestamp?: number) => timestamp ? new Date(timestamp * 1000).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A', []);
  const releaseDate = useCallback((blockNumber?: number, currentBlock?: number) => {
    if (!blockNumber || !currentBlock) {
      return 'N/A';
    }

    if (blockNumber >= currentBlock) {
      const time = (blockNumber - currentBlock) * 6000;
      const now = Date.now();

      return new Date(now + time).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    const diff = (currentBlock - blockNumber) * 6000;
    const now = Date.now();

    return new Date(now - diff).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }, []);

  const getHexEncodedAddress = (api: ApiPromise, chain: Chain, address: string, settings: SettingsStruct): string => {
    const prefix: number = chain ? chain.ss58Format : (settings.prefix === -1 ? 42 : settings.prefix);
    const publicKey = decodeAddress(address);

    const encodedAddress = encodeAddress(publicKey, prefix);

    return api.createType('AccountId', encodedAddress).toHex();
  };

  useEffect(() => {
    api && api.rpc.chain.getHeader().then((h) => setCurrentBlockNumber(h.number.unwrap()))
  }, [api]);

  useEffect(() => {
    if (!auctions || !chain || !settings || !api || !paraIds) {
      return;
    }

    const myHexAddress = getHexEncodedAddress(api, chain, address, settings);
    const myAccountsHex = [myHexAddress];

    Promise.all(paraIds.map((id): Promise<DeriveOwnContributions> => api.derive.crowdloan.ownContributions(id, myAccountsHex)))
      .then((contributions) => {
        const contibutionsMap: Map<string, Balance> = new Map();
        const myContibutionsMap: Map<string, Balance> = new Map();

        contributions.forEach((m, index) => {
          contibutionsMap.set(paraIds[index], m[myHexAddress]);
          !m[myHexAddress].isZero() && myContibutionsMap.set(paraIds[index], m[myHexAddress]);
        });

        setContributions(contibutionsMap);
        setMyContributions(myContibutionsMap);
        let contributedAmount = api?.createType('Balance', 0);
        const filterMyContributedCrowdloans: Crowdloan[] = [];

        myContibutionsMap.forEach((item, index) => {
          contributedAmount = contributedAmount?.add(item) as Balance;
          const mCC = auctions.crowdloans.find((item) => item.fund.paraId === index);

          mCC && filterMyContributedCrowdloans.push(mCC);
        });

        setMyContributedCrowdloans(filterMyContributedCrowdloans);

        setAllContributionamount(contributedAmount);
      }).catch(console.error);
  }, [address, chain, settings, auctions, api, paraIds]);

  const onBackClick = useCallback(() => {
    const url = chain?.genesisHash ? `/account/${chain.genesisHash}/${address}/` : '/';

    onAction(url);
  }, [address, chain?.genesisHash, onAction]);

  const goToNominations = useCallback(() => {
    console.log('true');
  }, []);

  const goToInfo = useCallback(() => {
    console.log('true');
  }, []);

  const goToPool = useCallback(() => {
    console.log('true');
  }, []);

  useEffect(() => {
    // eslint-disable-next-line no-void
    chainName && formatted && void getContributions(chainName, String(formatted)).then((c) => {
      const mCS = c.data.list;

      if (mCS?.length) {
        const mCSD: Map<number, MCS> = new Map();

        mCS.forEach((cs) => {
          mCSD.set(cs.para_id, {
            contributionBlock: cs.block_num,
            contributionTimestamp: cs.block_timestamp,
            unlockingBlock: cs.unlocking_block
          });
        });

        setMyContributionsSubscan(mCSD);
      }
    });
  }, [chainName, formatted]);

  const myContributedCrowdloansToShow = useMemo(() => {
    if (myContributedCrowdloans === undefined) {
      return undefined;
    }

    if (!myContributedCrowdloans.length) {
      return null;
    }

    if (!myContributionsSubscan) {
      return myContributedCrowdloans;
    }

    const result = myContributedCrowdloans.map((crowdloan) => {
      crowdloan.fund = { ...crowdloan.fund, ...(myContributionsSubscan.get(Number(crowdloan.fund.paraId)) ?? {}) };

      return crowdloan;
    });

    return result;
  }, [myContributedCrowdloans, myContributionsSubscan]);

  const identicon = (
    <Identicon
      iconTheme={chain?.icon || 'polkadot'}
      judgement={identity?.judgements}
      prefix={chain?.ss58Format ?? 42}
      size={40}
      value={formatted}
    />
  );

  const MyContribution = ({ amount, number }: { amount: Balance | undefined, number?: number }) => {
    return (
      <Grid container direction='column' lineHeight='30px' m='10px auto' width='92%'>
        <Grid container justifyContent='space-between'>
          <Typography fontSize='16px' fontWeight={300} width='fit-content'>
            {t<string>('Amount')}
          </Typography>
          <Grid fontSize='20px' fontWeight={400} item>
            <ShowBalance balance={amount} decimal={decimal} decimalPoint={2} token={token} />
          </Grid>
        </Grid>
        <Divider sx={{ bgcolor: 'secondary.light', height: '1px', my: '7px' }} />
        <Grid container justifyContent='space-between'>
          <Typography fontSize='16px' fontWeight={300} width='fit-content'>
            {t<string>('Contributed parachains')}
          </Typography>
          <Typography fontSize='20px' fontWeight={400} width='fit-content'>
            {number}
          </Typography>
        </Grid>
      </Grid>);
  };

  const MyContributedCrowdloans = ({ contributedCrowdloans }: { contributedCrowdloans?: Crowdloan[] }) => (
    <Grid container sx={{ height: window.innerHeight - 350, m: '10px auto 0', width: '92%' }}>
      {contributedCrowdloans
        ? contributedCrowdloans.map((crowdloan, index) => (
          <Grid container direction='column' height='87px' item key={index} sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.light', borderRadius: '5px' }}>
            <Grid container height='30px' item lineHeight='30px'>
              <Grid alignItems='center' container item justifyContent='center' xs={1.5}>
                <Avatar
                  src={logo(crowdloan)}
                  sx={{ height: 20, width: 20 }}
                />
              </Grid>
              <Grid item xs={10.5}>
                {!crowdloan.identity.info.display
                  ? <Typography fontSize='16px' fontWeight={400} lineHeight='30px' overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap'>
                    {getName(crowdloan.fund.paraId)}
                  </Typography>
                  : <Identity address={crowdloan.fund.depositor} api={api} chain={chain} identiconSize={15} noIdenticon />
                }
              </Grid>
            </Grid>
            <Grid container item sx={{ borderBlock: '1px solid', borderBlockColor: 'secondary.light', height: '28px' }}>
              <Grid item xs={4}>
                <Typography fontSize='12px' fontWeight={300} lineHeight='26px' textAlign='center'>
                  {t<string>('Date')}
                </Typography>
              </Grid>
              <Grid item sx={{ borderInline: '1px solid', borderInlineColor: 'secondary.light' }} xs={4}>
                <Typography fontSize='12px' fontWeight={300} lineHeight='26px' textAlign='center'>
                  {t<string>('Amount')}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography fontSize='12px' fontWeight={300} lineHeight='26px' textAlign='center'>
                  {t<string>('Release date')}
                </Typography>
              </Grid>
            </Grid>
            <Grid container item height='27px'>
              <Grid item xs={4}>
                <Typography fontSize='14px' fontWeight={400} lineHeight='27px' textAlign='center'>
                  {date(crowdloan.fund.contributionTimestamp)}
                </Typography>
              </Grid>
              <Grid item alignItems='center' sx={{ '> div': { lineHeight: '26px', width: 'auto' }, borderInline: '1px solid', borderInlineColor: 'secondary.light', fontSize: '14px', fontWeight: 400 }} xs={4}>
                <ShowBalance balance={myContributions?.get(crowdloan.fund.paraId)} decimal={decimal} decimalPoint={2} token={token} />
              </Grid>
              <Grid item xs={4}>
                <Typography fontSize='14px' fontWeight={400} lineHeight='27px' textAlign='center'>
                  {releaseDate(crowdloan.fund.unlockingBlock, currentBlockNumber)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>))
        : contributedCrowdloans === null &&
        <Grid container item>
          <Typography fontSize='16px' fontWeight={400} m='100px auto 0' textAlign='center' width='75%'>
            {t<string>('You haven\'t contributed to any crowdloans yet.')}
          </Typography>
        </Grid>
      }
    </Grid>
  );

  return (
    <>
      <HeaderBrand
        _centerItem={identicon}
        noBorder
        onBackClick={onBackClick}
        paddingBottom={0}
        showBackArrow
        showClose
      />
      <Container disableGutters sx={{ px: '15px' }}>
        <AccountBrief address={address} identity={identity} />
        <BouncingSubTitle label={t<string>('Contributed Crowdloans')} style={{ fontSize: '20px', fontWeight: 400 }} />
      </Container>
      <Grid container>
        {auctions === undefined &&
          <Progress pt='95px' size={125} title={t('Loading Auction/Crowdloans...')} />}
        {auctions === null &&
          <Grid color='red' height='30px' m='auto' pt='50px' width='92%'>
            <Warning
              fontWeight={400}
              isBelowInput
              isDanger
              theme={theme}
            >
              {t<string>('No Auction/Crowdloan found!')}
            </Warning>
          </Grid>
        }
        {auctions &&
          <>
            <MyContribution amount={allContributionAmount} number={myContributions?.size} />
            <MyContributedCrowdloans contributedCrowdloans={myContributedCrowdloansToShow} />
          </>
        }
      </Grid>
      <Grid container justifyContent='space-around' sx={{ borderTop: '2px solid', borderTopColor: 'secondary.main', bottom: 0, left: '4%', position: 'absolute', pt: '5px', pb: '3px', width: '92%' }}>
        <HorizontalMenuItem
          divider
          icon={<Box component='img' src={crowdloanActive as string} sx={{ height: '35px' }} />}
          onClick={goToNominations}
          title={t<string>('Active Crowdloans')}
        />
        <HorizontalMenuItem
          divider
          exceptionWidth={85}
          icon={<Box component='img' src={auction as string} sx={{ height: '35px' }} />}
          onClick={goToPool}
          title={t<string>('Auction')}
        />
        <HorizontalMenuItem
          icon={<Box component='img' src={pastCrowdloan as string} sx={{ height: '35px' }} />}
          onClick={goToInfo}
          title={t<string>('Past Crowdloans')}
        />
      </Grid>
    </>
  );
}
