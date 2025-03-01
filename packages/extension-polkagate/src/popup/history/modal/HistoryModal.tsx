// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TransactionDetail } from '../../../util/types';

import { faHistory, faReceipt } from '@fortawesome/free-solid-svg-icons';
import { Box, Grid } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { Progress } from '../../../components';
import { DraggableModal } from '../../../fullscreen/governance/components/DraggableModal';
import SimpleModalTitle from '../../../fullscreen/partials/SimpleModalTitle';
import { useInfo, useTranslation } from '../../../hooks';
import HistoryTabs, { TAB_MAP } from '../HistoryTabs';
import useTransactionHistory from '../useTransactionHistory';
import HistoryDetailModal from './HistoryDetailModal';
import HistoryItemModal from './HistoryItemModal';

interface Props {
  address: string;
  setDisplayPopup: React.Dispatch<React.SetStateAction<number | undefined>>;
}

export default function HistoryModal({ address, setDisplayPopup }: Props): React.ReactElement {
  const { t } = useTranslation();

  const { chainName, decimal, formatted, token } = useInfo(address);

  const [tabIndex, setTabIndex] = useState<TAB_MAP>(TAB_MAP.ALL);
  const [detailInfo, setDetailInfo] = useState<TransactionDetail>();
  const [showDetail, setShowDetail] = useState<boolean>(false);

  const { governanceTx, grouped, tabHistory, transfersTx } = useTransactionHistory(address, tabIndex);

  const backToAccount = useCallback(() => setDisplayPopup(undefined), [setDisplayPopup]);

  return (
    <DraggableModal blurBackdrop onClose={backToAccount} open>
      <Grid alignItems='center' container justifyContent='center' maxHeight='650px' overflow='hidden'>
        <SimpleModalTitle
          icon={showDetail ? faReceipt : faHistory}
          onClose={backToAccount}
          title={showDetail ? t('Transaction Detail') : t('History')}
        />
        {!showDetail &&
          <>
            <HistoryTabs
              address={address}
              setTabIndex={setTabIndex}
              tabIndex={tabIndex}
            />
            <Grid container id='scrollArea' item sx={{ gap: '5px', height: '70%', maxHeight: 650 - 145, overflowY: 'auto' }}>
              {grouped && Object.keys(grouped).length > 0 &&
                Object.entries(grouped)?.map((group) => {
                  const [date, info] = group;

                  return info.map((h, index) => (
                    <HistoryItemModal
                      anotherDay={index === 0}
                      date={date}
                      decimal={decimal}
                      formatted={formatted ?? ''}
                      info={h}
                      key={index}
                      path={undefined}
                      setDetailInfo={setDetailInfo}
                      setShowDetail={setShowDetail}
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
              <div id='observerObj' style={{ height: '1px' }} />
            </Grid>
          </>
        }
        {showDetail && chainName && token && decimal && detailInfo &&
          <HistoryDetailModal
            chainName={chainName}
            decimal={decimal}
            info={detailInfo}
            setShowDetail={setShowDetail}
            token={token}
          />
        }
      </Grid>
    </DraggableModal>
  );
}
