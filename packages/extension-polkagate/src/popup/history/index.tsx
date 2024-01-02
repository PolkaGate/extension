// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Divider, Grid, Tab, Tabs } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { Progress } from '../../components';
import { useChain, useChainName, useDecimal, useFormatted, useToken, useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';
import { getTxTransfers } from '../../util/api/getTransfers';
import { STAKING_ACTIONS, STAKING_CHAINS } from '../../util/constants';
import { TransactionDetail, Transfers } from '../../util/types';
import { getHistoryFromStorage } from '../../util/utils';
import HistoryItem from './partials/HistoryItem';

const TAB_MAP = {
  ALL: 1,
  TRANSFERS: 2,
  STAKING: 3
};

interface RecordTabStatus {
  pageNum: number,
  isFetching?: boolean,
  hasMore?: boolean,
  transactions?: Transfers[]
}

const SINGLE_PAGE_SIZE = 50;
const MAX_PAGE = 4;

const INITIAL_STATE = {
  hasMore: true,
  isFetching: false,
  pageNum: 0,
  transactions: []
};

export default function TransactionHistory(): React.ReactElement<''> {
  const { t } = useTranslation();
  const history = useHistory();
  const { pathname, state } = useLocation();
  const { address } = useParams<{ address: string }>();
  const formatted = useFormatted(address);
  const chain = useChain(address);
  const chainName = useChainName(address);
  const decimal = useDecimal(formatted);
  const token = useToken(formatted);
  const [tabIndex, setTabIndex] = useState<number>(state?.tabIndex ?? 1);
  const [isRefreshing, setRefresh] = useState<boolean>(false);
  const [fetchedHistoriesFromSubscan, setFetchedHistoriesFromSubscan] = React.useState<TransactionDetail[] | []>([]);
  const [tabHistory, setTabHistory] = useState<TransactionDetail[] | null>([]);
  const [localHistories, setLocalHistories] = useState<TransactionDetail[]>([]);

  function stateReducer(state: object, action: RecordTabStatus) {
    return Object.assign({}, state, action);
  }

  const [transfersTx, setTransfersTx] = useReducer(stateReducer, INITIAL_STATE);
  const observerInstance = useRef<IntersectionObserver>();
  const receivingTransfers = useRef<RecordTabStatus>();

  receivingTransfers.current = transfersTx;

  const grouped = useMemo((): Record<string, TransactionDetail[]> | undefined => {
    if (!tabHistory) {
      return undefined;
    }

    const temp = {};
    const options = { day: 'numeric', month: 'short', year: 'numeric' };

    tabHistory?.forEach((h) => {
      const day = new Date(h.date).toLocaleDateString(undefined, options);

      if (!temp[day]) {
        temp[day] = [];
      }

      temp[day].push(h);
    });

    return temp;
  }, [tabHistory]);

  useEffect(() => {
    if (!transfersTx?.transactions?.length) {
      return;
    }

    const historyFromSubscan: TransactionDetail[] = [];

    transfersTx.transactions.forEach((tx: Transfers): void => {
      historyFromSubscan.push({
        action: tx.from === formatted ? 'send' : 'receive',
        amount: tx.amount,
        block: tx.block_num,
        date: tx.block_timestamp * 1000, // to be consistent with the locally saved times
        fee: tx.fee,
        from: { address: tx.from, name: tx.from_account_display?.display },
        success: tx.success,
        to: { address: tx.to, name: tx.to_account_display?.display },
        txHash: tx.hash
      });
    });

    /** fetch some pool tx from subscan  */
    historyFromSubscan.forEach((tx) => {
      if (tx.action === 'send' && tx?.to?.name?.match(/^Pool#\d+/)) {
        tx.action = 'Pool Staking';
        tx.subAction = 'Stake';
      } else if (tx.action === 'receive') {
        if (tx?.from?.name?.match(/^Pool#([0-9]+)\(Reward\)$/)) {
          tx.action = 'Pool Staking';
          tx.subAction = 'Withdraw Rewards';
        } else if (tx?.from?.name?.match(/^Pool#\d+\(Stash\)$/)) {
          tx.action = 'Pool Staking';
          tx.subAction = 'Redeem';
        }
      }
    });

    setFetchedHistoriesFromSubscan(historyFromSubscan);
  }, [formatted, transfersTx]);

  useEffect(() => {
    const filteredLocalHistories = localHistories?.filter((h1) => !fetchedHistoriesFromSubscan.find((h2) => h1.txHash === h2.txHash));

    let history = filteredLocalHistories.concat(fetchedHistoriesFromSubscan);

    history = history.sort((a, b) => b.date - a.date);

    switch (tabIndex) {
      case (TAB_MAP.TRANSFERS):
        history = history.filter((h) => ['send', 'receive'].includes(h.action.toLowerCase()));
        break;
      case (TAB_MAP.STAKING):
        history = history.filter((h) => STAKING_ACTIONS.includes(h.action));
        break;
      default:
        break;
    }

    setTabHistory(history);
    setRefresh(false);
  }, [tabIndex, fetchedHistoriesFromSubscan, localHistories]);

  const onRefresh = useCallback(() => {
    setRefresh(true);
  }, []);

  useEffect(() => {
    formatted && getHistoryFromStorage(String(formatted)).then((h) => {
      setLocalHistories(h || []);
    }).catch(console.error);
  }, [formatted, chainName, isRefreshing]);

  const getTransfers = useCallback(async (outerState: RecordTabStatus): Promise<void> => {
    const { pageNum, transactions } = outerState;

    setTransfersTx({
      isFetching: true,
      pageNum
    });

    const res = await getTxTransfers(chainName, String(formatted), pageNum, SINGLE_PAGE_SIZE);

    const { count, transfers } = res.data || {};
    const nextPageNum = pageNum + 1;

    setTransfersTx({
      hasMore: !(nextPageNum * SINGLE_PAGE_SIZE >= count) && nextPageNum < MAX_PAGE,
      isFetching: false,
      pageNum: nextPageNum,
      transactions: transactions?.concat(transfers || [])
    });
  }, [formatted, chainName]);

  useEffect(() => {
    if (!chainName || !formatted) {
      return;
    }

    const observerCallback = async (): Promise<void> => {
      if (receivingTransfers.current?.isFetching) {
        return;
      }

      if (!receivingTransfers.current?.hasMore) {
        return observerInstance?.current?.disconnect();
      }

      await getTransfers(receivingTransfers.current);
    };

    const options = {
      root: document.getElementById('scrollArea'),
      rootMargin: '0px',
      threshold: 1.0
    };

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    observerInstance.current = new IntersectionObserver(observerCallback, options);
    const target = document.getElementById('observerObj');

    target && observerInstance.current.observe(target);
  }, [chainName, formatted, getTransfers, tabHistory]);

  const _onBack = useCallback(() => {
    history.push({
      pathname: state?.pathname ?? '/'
    });
  }, [history, state?.pathname]);

  const handleTabChange = useCallback((event: React.SyntheticEvent<Element, Event>, tabIndex: number) => {
    setTabIndex(tabIndex);
  }, []);

  return (
    <>
      <HeaderBrand
        isRefreshing={isRefreshing}
        onBackClick={_onBack}
        // onRefresh={grouped && onRefresh}
        showBackArrow
        text={t<string>('Transaction History')}
      />
      <Box sx={{ borderBottom: 1, borderColor: 'secondary.light' }}>
        <Tabs centered onChange={handleTabChange} sx={{ 'span.MuiTabs-indicator': { bgcolor: 'secondary.light', height: '4px' } }} value={tabIndex}>
          <Tab
            label={t<string>('All')}
            sx={{
              ':is(button.MuiButtonBase-root.MuiTab-root.Mui-selected)': {
                color: 'secondary.light',
                fontWeight: 500
              },
              color: 'text.primary',
              fontSize: '18px',
              fontWeight: 400,
              minWidth: '108px',
              textTransform: 'capitalize'
            }}
            value={1}
          />
          <Tab disabled icon={<Divider orientation='vertical' sx={{ backgroundColor: 'text.primary', height: '19px', mx: '5px', my: 'auto' }} />} label='' sx={{ minWidth: '1px', p: '0', width: '1px' }} value={4} />
          <Tab
            label={t<string>('Transfers')}
            sx={{
              ':is(button.MuiButtonBase-root.MuiTab-root.Mui-selected)': {
                color: 'secondary.light',
                fontWeight: 500
              },
              color: 'text.primary',
              fontSize: '18px',
              fontWeight: 400,
              minWidth: '108px',
              textTransform: 'capitalize'
            }}
            value={2}
          />
          {STAKING_CHAINS.includes(chain?.genesisHash) &&
            <Tab disabled icon={<Divider orientation='vertical' sx={{ backgroundColor: 'text.primary', height: '19px', mx: '5px', my: 'auto' }} />} label='' sx={{ minWidth: '1px', p: '0', width: '1px' }} value={5} />
          }
          {STAKING_CHAINS.includes(chain?.genesisHash) &&
            <Tab
              label={t<string>('Staking')}
              sx={{
                ':is(button.MuiButtonBase-root.MuiTab-root.Mui-selected)': {
                  color: 'secondary.light',
                  fontWeight: 500
                },
                color: 'text.primary',
                fontSize: '18px',
                fontWeight: 400,
                minWidth: '108px',
                textTransform: 'capitalize'
              }}
              value={3}
            />
          }
        </Tabs>
      </Box>
      <Grid container item sx={{ gap: '5px', height: '70%', maxHeight: window.innerHeight - 145, overflowY: 'auto', px: '15px' }} xs={12}>
        {Object.keys(grouped).length !== 0
          ? <>
            {Object.entries(grouped)?.map((group) => {
              const [date, info] = group;

              return info.map((h, index) => (
                <HistoryItem
                  anotherDay={index === 0}
                  chainName={chainName}
                  date={date}
                  decimal={decimal}
                  formatted={formatted}
                  info={h}
                  key={index}
                  path={pathname}
                  token={token}
                />
              ));
            })}
            {tabHistory === null &&
              <Grid item mt='50px' textAlign='center'>
                {t('Nothing to show')}
              </Grid>
            }
            <Grid container justifyContent='center'>
              {
                // staking transaction history is saved locally
                tabIndex !== TAB_MAP.STAKING &&
                ((transfersTx?.hasMore)
                  ? 'loading...'
                  : !!tabHistory?.length &&
                  <Box fontSize={11}>
                    {t('No more transactions to load')}
                  </Box>
                )
              }
            </Grid>
          </>
          : <Progress pt='150px' size={50} title={t('Loading history')} />
        }
        <div id='observerObj' />
      </Grid>
    </>
  );
}
