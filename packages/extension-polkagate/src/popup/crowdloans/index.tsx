// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import '@vaadin/icons';

import type { ApiPromise } from '@polkadot/api';
import type { DeriveOwnContributions } from '@polkadot/api-derive/types';
import type { Balance } from '@polkadot/types/interfaces';

import { Language as LanguageIcon } from '@mui/icons-material';
import { Avatar, Box, Container, Divider, Grid, Link, Typography, useTheme } from '@mui/material';
import { Crowdloan } from 'extension-polkagate/src/util/types';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { createWsEndpoints } from '@polkadot/apps-config';
import { Chain } from '@polkadot/extension-chains/types';
import { SettingsStruct } from '@polkadot/ui-settings/types';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { activeCrowdloanBlack, activeCrowdloanRed, activeCrowdloanWhite, auctionBlack, auctionRed, auctionWhite, pastCrowdloanBlack, pastCrowdloanRed, pastCrowdloanWhite } from '../../assets/icons';
import { ActionContext, HorizontalMenuItem, Identicon, Identity, Progress, ShowBalance, Warning } from '../../components';
import { SettingsContext } from '../../components/contexts';
import { useAccount, useApi, useAuction, useChain, useChainName, useCurrentBlockNumber, useDecimal, useFormatted, useMyAccountIdentity, useToken, useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';
import BouncingSubTitle from '../../partials/BouncingSubTitle';
import getContributions from '../../util/api/getContributions';
import getLogo from '../../util/getLogo';
import { getWebsiteFavico } from '../../util/utils';
import AccountBrief from '../account/AccountBrief';
import ActiveCrowdloans from './ActiveCrowdloans';
import AuctionTab from './Auction';
import blockToDate from './blockToDate';
import PastCrowdloans from './PastCrowdloans';

interface MCS {
  contributionBlock: number;
  contributionTimestamp: number;
  unlockingBlock: number;
}

const TAB_MAP = {
  MY_CONTRIBUTION: 0,
  ACTIVE_CROWDLOANS: 1,
  AUCTION: 2,
  PAST_CROWDLOANS: 3
};

export default function CrowdLoans(): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const theme = useTheme();
  const settings = useContext(SettingsContext);
  const { address } = useParams<{ address: string }>();
  const currentBlockNumber = useCurrentBlockNumber(address);
  const auction = useAuction(address);
  const account = useAccount(address);
  const formatted = useFormatted(address);
  const chain = useChain(address);
  const api = useApi(address);
  const identity = useMyAccountIdentity(address);
  const token = useToken(address);
  const decimal = useDecimal(address);
  const chainName = useChainName(address);
  const [myContributions, setMyContributions] = useState<Map<string, Balance> | undefined>();
  const [contributions, setContributions] = useState<Map<string, Balance> | undefined>();
  const [allContributionAmount, setAllContributionAmount] = useState<Balance | undefined>();
  const [myContributedCrowdloans, setMyContributedCrowdloans] = useState<Crowdloan[] | undefined>();
  const [myContributionsFromSubscan, setMyContributionsFromSubscan] = useState<Map<number, MCS>>();
  const [itemShow, setItemShow] = useState<number>(0);

  const sortingCrowdloans = (a: Crowdloan, b: Crowdloan) => Number(a.fund.paraId) - Number(b.fund.paraId);// oldest first
  const sortingCrowdloansReverse = (a: Crowdloan, b: Crowdloan) => Number(b.fund.paraId) - Number(a.fund.paraId);// newest first
  const activeCrowdloans = useMemo(() => {
    if (auction === undefined || !auction?.crowdloans) {
      return undefined;
    }

    if (auction === null || auction.crowdloans.length === 0) {
      return null;
    }

    const actives = auction.crowdloans.filter((c) => c.fund.end > auction.currentBlockNumber && !c.fund.hasLeased).sort(sortingCrowdloans);

    return actives.length ? actives : null;
  }, [auction]);

  const endedCrowdloans = useMemo(() => {
    if (auction === undefined || !auction?.crowdloans) {
      return undefined;
    }

    if (auction === null || auction.crowdloans.length === 0) {
      return null;
    }

    const endeds = auction.crowdloans.filter((c) => c.fund.end < auction.currentBlockNumber || c.fund.hasLeased).sort(sortingCrowdloansReverse);

    return endeds.length ? endeds : null;
  }, [auction]);

  // const auctionWinners = useMemo(() => auction?.crowdloans?.filter((c) => c.fund.hasLeased).sort(sortingCrowdloans), [auction]);
  console.log('endedCrowdloans:', endedCrowdloans);

  const allEndpoints = createWsEndpoints((key: string, value: string | undefined) => value || key);
  const paraIds = useMemo(() => auction?.crowdloans.map((c: Crowdloan) => c.fund.paraId), [auction?.crowdloans]);
  const crowdloansId = useMemo(() => {
    if (!paraIds || !allEndpoints.length) {
      return;
    }

    const filteredEndpoints = allEndpoints.filter((e) => (e.genesisHashRelay === account?.genesisHash));
    const endpoints = filteredEndpoints.filter((e) => (paraIds?.includes(String(e.paraId))));

    return endpoints;
  }, [account?.genesisHash, allEndpoints, paraIds]);

  const getName = useCallback((paraId: string): string | undefined => (crowdloansId?.find((e) => e?.paraId === Number(paraId))?.text as string), [crowdloansId]);
  // const getText = useCallback((paraId: string): string | undefined => (crowdloansId?.find((e) => e?.paraId === Number(paraId))?.text as string), [crowdloansId]);
  const getHomePage = useCallback((paraId: string): string | undefined => (crowdloansId?.find((e) => e?.paraId === Number(paraId))?.homepage as string), [crowdloansId]);
  const getInfo = useCallback((paraId: string): string | undefined => (crowdloansId?.find((e) => e?.paraId === Number(paraId))?.info as string), [crowdloansId]);
  const logo = useCallback((crowdloan: Crowdloan) => getLogo(getInfo(crowdloan.fund.paraId)) || getWebsiteFavico(getHomePage(crowdloan.fund.paraId)), [getHomePage, getInfo]);
  const date = useCallback((timestamp?: number) => timestamp ? new Date(timestamp * 1000).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A', []);

  const getHexEncodedAddress = (api: ApiPromise, chain: Chain, address: string, settings: SettingsStruct): string => {
    const prefix: number = chain ? chain.ss58Format : (settings.prefix === -1 ? 42 : settings.prefix);
    const publicKey = decodeAddress(address);

    const encodedAddress = encodeAddress(publicKey, prefix);

    return api.createType('AccountId', encodedAddress).toHex();
  };

  useEffect(() => {
    if (!auction || !chain || !settings || !api || !paraIds) {
      return;
    }

    const myHexAddress = getHexEncodedAddress(api, chain, address, settings);
    const myAccountsHex = [myHexAddress];

    Promise.all(paraIds.map((id): Promise<DeriveOwnContributions> => api.derive.crowdloan.ownContributions(id, myAccountsHex)))
      .then((contributions) => {
        const contributionsMap: Map<string, Balance> = new Map();
        const myContributionsMap: Map<string, Balance> = new Map();

        contributions.forEach((m, index) => {
          contributionsMap.set(paraIds[index], m[myHexAddress]);
          !m[myHexAddress].isZero() && myContributionsMap.set(paraIds[index], m[myHexAddress]);
        });

        setContributions(contributionsMap);
        setMyContributions(myContributionsMap);
        let contributedAmount = api?.createType('Balance', 0);
        const filterMyContributedCrowdloans: Crowdloan[] = [];

        myContributionsMap.forEach((item, index) => {
          contributedAmount = contributedAmount?.add(item) as Balance;
          const mCC = auction.crowdloans.find((item) => item.fund.paraId === index);

          mCC && filterMyContributedCrowdloans.push(mCC);
        });

        setMyContributedCrowdloans(filterMyContributedCrowdloans);

        setAllContributionAmount(contributedAmount);
      }).catch(console.error);
  }, [address, chain, settings, auction, api, paraIds]);

  const onBackClick = useCallback(() => {
    const url = chain?.genesisHash ? `/account/${chain.genesisHash}/${address}/` : '/';

    onAction(url);
  }, [address, chain?.genesisHash, onAction]);

  const showActiveCrowdloans = useCallback(() => {
    setItemShow(itemShow !== TAB_MAP.ACTIVE_CROWDLOANS ? TAB_MAP.ACTIVE_CROWDLOANS : TAB_MAP.MY_CONTRIBUTION);
  }, [itemShow]);

  const showAuction = useCallback(() => {
    setItemShow(itemShow !== TAB_MAP.AUCTION ? TAB_MAP.AUCTION : TAB_MAP.MY_CONTRIBUTION);
  }, [itemShow]);

  const showPastCrowdloans = useCallback(() => {
    setItemShow(itemShow !== TAB_MAP.PAST_CROWDLOANS ? TAB_MAP.PAST_CROWDLOANS : TAB_MAP.MY_CONTRIBUTION);
  }, [itemShow]);

  useEffect(() => {
    chainName && formatted && getContributions(chainName, String(formatted)).then((c) => {
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

        setMyContributionsFromSubscan(mCSD);
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

    if (!myContributionsFromSubscan) {
      return myContributedCrowdloans;
    }

    return myContributedCrowdloans.map((crowdloan) => {
      crowdloan.fund = { ...crowdloan.fund, ...(myContributionsFromSubscan.get(Number(crowdloan.fund.paraId)) ?? {}) };

      return crowdloan;
    });
  }, [myContributedCrowdloans, myContributionsFromSubscan]);

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
      <>
        {
          number !== undefined
            ? <Grid container direction='column' lineHeight='30px' m='10px auto' width='92%'>
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
            </Grid>
            : <Progress pt='100px' size={100} title={t('Loading your contribution...')} />
        }
      </>
    );
  };

  const MyContributedCrowdloans = ({ contributedCrowdloans }: { contributedCrowdloans?: Crowdloan[] | null }) => (
    <>
      {contributedCrowdloans !== undefined &&
        <>
          <BouncingSubTitle label={t<string>('Contributed Crowdloans')} style={{ fontSize: '20px', fontWeight: 400 }} />
          {!!contributedCrowdloans?.length &&
            <MyContribution
              amount={allContributionAmount}
              number={myContributions?.size}
            />
          }
          <Grid container sx={{ height: window.innerHeight - 360, m: 'auto', width: '92%' }}>
            {contributedCrowdloans?.length
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
                      {getName(crowdloan.fund.paraId)
                        ? <Grid container item width={getHomePage(crowdloan.fund.paraId) ? '90%' : '100%'}>
                          <Typography fontSize='16px' fontWeight={400} lineHeight='30px' overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap'>
                            {getName(crowdloan.fund.paraId)}
                          </Typography>
                          {getHomePage(crowdloan.fund.paraId) &&
                            <Grid alignItems='center' container item justifyContent='center' lineHeight='15px' width='10%'>
                              <Link href={getHomePage(crowdloan.fund.paraId)} rel='noreferrer' target='_blank'>
                                <LanguageIcon sx={{ color: '#007CC4', fontSize: 17 }} />
                              </Link>
                            </Grid>
                          }
                        </Grid>
                        : <Identity address={crowdloan.fund.depositor} formatted={crowdloan.fund.depositor} api={api} chain={chain} identiconSize={15} noIdenticon />
                      }
                    </Grid>
                  </Grid>
                  <Grid container item sx={{ borderBlock: '1px solid', borderColor: 'secondary.light', height: '28px' }}>
                    <Grid item xs={4}>
                      <Typography fontSize='12px' fontWeight={300} lineHeight='26px' textAlign='center'>
                        {t<string>('Date')}
                      </Typography>
                    </Grid>
                    <Grid item sx={{ borderInline: '1px solid', borderColor: 'secondary.light' }} xs={4}>
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
                  <Grid container height='27px' item>
                    <Grid item xs={4}>
                      <Typography fontSize='14px' fontWeight={400} lineHeight='27px' textAlign='center'>
                        {date(crowdloan.fund.contributionTimestamp)}
                      </Typography>
                    </Grid>
                    <Grid alignItems='center' item sx={{ '> div': { lineHeight: '26px', width: 'auto' }, borderInline: '1px solid', borderColor: 'secondary.light', fontSize: '14px', fontWeight: 400 }} xs={4}>
                      <ShowBalance balance={myContributions?.get(crowdloan.fund.paraId)} decimal={decimal} decimalPoint={2} token={token} />
                    </Grid>
                    <Grid item xs={4}>
                      <Typography fontSize='14px' fontWeight={400} lineHeight='27px' textAlign='center'>
                        {blockToDate(crowdloan.fund.unlockingBlock, currentBlockNumber)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>))
              : contributedCrowdloans === null &&
              <Grid container height='15px' item justifyContent='center' mt='30px'>
                <Warning
                  fontWeight={400}
                  theme={theme}
                >
                  {t<string>('No contribution found.')}
                </Warning>
              </Grid>
            }
          </Grid>
        </>
      }
    </>
  );
  // t<string>(`Action ${auction.auctionCounter}#`) : t<string>('Past Crowdloans')

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
      </Container>
      <Grid container>
        {(auction === undefined || !myContributedCrowdloans)
          ? <Progress pt='105px' size={125} title={t('Loading Auction/Crowdloans...')} />
          : auction === null
            ? <Grid color='red' height='30px' m='auto' pt='50px' width='92%'>
              <Warning
                fontWeight={400}
                isBelowInput
                isDanger
                theme={theme}
              >
                {t<string>('No Auction/Crowdloan found!')}
              </Warning>
            </Grid>
            : <>
              {itemShow === TAB_MAP.MY_CONTRIBUTION &&
                <MyContributedCrowdloans
                  contributedCrowdloans={myContributedCrowdloansToShow}
                />
              }
              {itemShow === TAB_MAP.ACTIVE_CROWDLOANS &&
                <ActiveCrowdloans
                  activeCrowdloans={activeCrowdloans}
                  api={api}
                  chain={chain}
                  contributedCrowdloans={myContributions}
                  crowdloansId={crowdloansId}
                  currentBlockNumber={currentBlockNumber}
                  decimal={decimal}
                  token={token}
                />
              }
              {/* {itemShow === 2 &&
              <AuctionTab />
            } */}
              {itemShow === TAB_MAP.PAST_CROWDLOANS &&
                <PastCrowdloans
                  api={api}
                  chain={chain}
                  contributedCrowdloans={myContributions}
                  crowdloansId={crowdloansId}
                  currentBlockNumber={currentBlockNumber}
                  decimal={decimal}
                  pastCrowdloans={endedCrowdloans}
                  token={token}
                />
              }
            </>
        }
      </Grid>
      <Grid container justifyContent='space-around' sx={{ borderTop: '2px solid', borderTopColor: 'secondary.main', bottom: 0, left: '4%', position: 'absolute', pt: '5px', pb: '3px', width: '92%' }}>
        <HorizontalMenuItem
          divider
          icon={
            <Box
              component='img'
              src={
                itemShow === TAB_MAP.ACTIVE_CROWDLOANS
                  ? activeCrowdloanRed as string
                  : theme.palette.mode === 'light'
                    ? activeCrowdloanBlack as string
                    : activeCrowdloanWhite as string}
              sx={{ height: '35px' }} />
          }
          onClick={showActiveCrowdloans}
          title={t<string>('Active Crowdloans')}
        />
        <HorizontalMenuItem
          divider
          exceptionWidth={85}
          icon={
            <Box
              component='img'
              src={
                itemShow === TAB_MAP.AUCTION
                  ? auctionRed as string
                  : theme.palette.mode === 'light'
                    ? auctionBlack as string
                    : auctionWhite as string}
              sx={{ height: '35px' }} />}
          onClick={showAuction}
          title={t<string>('Auction')}
        />
        <HorizontalMenuItem
          icon={
            <Box
              component='img'
              src={
                itemShow === TAB_MAP.PAST_CROWDLOANS
                  ? pastCrowdloanRed as string
                  : theme.palette.mode === 'light'
                    ? pastCrowdloanBlack as string
                    : pastCrowdloanWhite as string
              }
              sx={{ height: '35px' }} />}
          onClick={showPastCrowdloans}
          title={t<string>('Past Crowdloans')}
        />
      </Grid>
    </>
  );
}
