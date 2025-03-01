// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Box, Grid } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { Progress } from '../../components';
import { useInfo, useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';
import HistoryItem from './partials/HistoryItem';
import HistoryTabs, { TAB_MAP } from './HistoryTabs';
import useTransactionHistory from './useTransactionHistory';

export default function TransactionHistory(): React.ReactElement {
  const { t } = useTranslation();
  const history = useHistory();
  const { state } = useLocation<{ tabIndex: number; pathname?: string }>();
  const { address } = useParams<{ address: string }>();
  const { chainName, decimal, formatted, token } = useInfo(address);

  const [tabIndex, setTabIndex] = useState<TAB_MAP>(state?.tabIndex ?? TAB_MAP.ALL);

  const { governanceTx, grouped, tabHistory, transfersTx } = useTransactionHistory(address, tabIndex);

  const onBack = useCallback(() => {
    history.push({
      pathname: state?.pathname ?? '/'
    });
  }, [history, state?.pathname]);

  return (
    <>
      <HeaderBrand
        onBackClick={onBack}
        showBackArrow
        text={t('Transaction History')}
      />
      <HistoryTabs
        address={address}
        setTabIndex={setTabIndex}
        tabIndex={tabIndex}
      />
      <Grid container id='scrollArea' item sx={{ gap: '5px', height: '70%', maxHeight: window.innerHeight - 145, overflowY: 'auto', px: '15px' }}>
        {grouped && Object.keys(grouped).length > 0 &&
          Object.entries(grouped)?.map((group) => {
            const [date, info] = group;

            return info.map((h, index) => (
              <HistoryItem
                anotherDay={index === 0}
                chainName={chainName}
                date={date}
                decimal={decimal}
                formatted={formatted ?? ''}
                info={h}
                key={index}
                path={undefined}
                token={h.token ?? token}
              />
            ));
          })}
        {grouped === null && transfersTx.isFetching === false && governanceTx.isFetching === false &&
          <Grid item mt='50px' mx='auto' textAlign='center'>
            {t('Nothing to show')}
          </Grid>
        }
        {(grouped === undefined || ((transfersTx.isFetching || governanceTx.isFetching) && tabHistory?.length === 0)) &&
          <Progress pt='150px' size={50} title={t('Loading history')} type='grid' />
        }
        <div id='observerObj' style={{ height: '1px' }} />
        {grouped &&
          <Grid container justifyContent='center'>
            {
              // staking transaction history is saved locally
              tabIndex !== TAB_MAP.STAKING &&
              ((transfersTx?.hasMore)
                ? <Progress
                  direction='row'
                  pt='5px'
                  size={15}
                  title={t('Loading...')}
                  titlePaddingLeft={5}
                  titlePaddingTop={0}
                  type='wordpress'
                />
                : !!tabHistory?.length &&
                <Box fontSize={11}>
                  {t('No more transactions to load')}
                </Box>
              )
            }
          </Grid>}
      </Grid>
    </>
  );
}
