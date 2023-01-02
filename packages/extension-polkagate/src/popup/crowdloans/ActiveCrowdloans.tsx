// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { Balance } from '@polkadot/types/interfaces';

import { KeyboardDoubleArrowLeft as KeyboardDoubleArrowLeftIcon, KeyboardDoubleArrowRight as KeyboardDoubleArrowRightIcon } from '@mui/icons-material';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import { Crowdloan } from 'extension-polkagate/src/util/types';
import React, { useCallback, useState } from 'react';

import { LinkOption } from '@polkadot/apps-config/endpoints/types';
import { Chain } from '@polkadot/extension-chains/types';
import { AccountId } from '@polkadot/types/interfaces/runtime';

import { Progress, Warning } from '../../components';
import { useTranslation } from '../../hooks';
import BouncingSubTitle from '../../partials/BouncingSubTitle';
import Contribute from './contribute/Contribute';
import ShowCrowdloan from './partials/ShowCrowdloans';

interface Props {
  api?: ApiPromise;
  activeCrowdloans?: Crowdloan[] | null;
  chain?: Chain | null;
  contributedCrowdloans?: Map<string, Balance>;
  crowdloansId?: LinkOption[];
  currentBlockNumber: number | undefined;
  decimal?: number;
  token?: string;
  formatted?: string | AccountId;
  minContribution?: string;
}

interface ArrowsProps {
  onPrevious: () => void;
  onNext: () => void;
}

export default function ActiveCrowdloans({ activeCrowdloans, api, chain, contributedCrowdloans, crowdloansId, currentBlockNumber, decimal, formatted, minContribution, token }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const [itemToShow, setItemToShow] = useState<number>(0);
  const [selectedCrowdloan, setSelectedCrowdloan] = useState<Crowdloan>();
  const [showContribute, setShowContribute] = useState<boolean>(false);

  const getMyContribution = useCallback((paraId: string) => contributedCrowdloans?.get(paraId) ?? '0', [contributedCrowdloans]);

  const contributeToCrowdloan = useCallback(() => {
    setShowContribute(true);
  }, []);

  const Arrows = ({ onNext, onPrevious }: ArrowsProps) => (
    <Grid container justifyContent='space-between' m='10px auto 0'>
      <Grid alignItems='center' container item justifyContent='flex-start' maxWidth='35%' onClick={onPrevious} sx={{ cursor: (!activeCrowdloans?.length || itemToShow === 0) ? 'default' : 'pointer' }} width='fit_content'>
        <KeyboardDoubleArrowLeftIcon sx={{ color: (!activeCrowdloans?.length || itemToShow === 0) ? 'secondary.contrastText' : 'secondary.light', fontSize: '25px' }} />
        <Divider orientation='vertical' sx={{ bgcolor: (!activeCrowdloans?.length || itemToShow === 0) ? 'secondary.contrastText' : 'text.primary', height: '22px', ml: '3px', mr: '7px', my: 'auto', width: '1px' }} />
        <Grid container item xs={7}>
          <Typography color={(!activeCrowdloans?.length || itemToShow === 0) ? 'secondary.contrastText' : 'secondary.light'} fontSize='14px' fontWeight={400}>{t<string>('Previous')}</Typography>
        </Grid>
      </Grid>
      <Grid alignItems='center' container item justifyContent='center' width='30%'>
        {activeCrowdloans?.length &&
          <>
            <Typography fontSize='16px' fontWeight={400}>{`${itemToShow + 1} of ${activeCrowdloans.length}`}</Typography>
          </>
        }
      </Grid>
      <Grid alignItems='center' container item justifyContent='flex-end' maxWidth='35%' onClick={onNext} sx={{ cursor: (!activeCrowdloans?.length || itemToShow === activeCrowdloans?.length - 1) ? 'default' : 'pointer' }} width='fit_content'>
        <Grid container item justifyContent='right' xs={7}>
          <Typography color={(!activeCrowdloans?.length || itemToShow === activeCrowdloans.length - 1) ? 'secondary.contrastText' : 'secondary.light'} fontSize='14px' fontWeight={400} textAlign='left'>{t<string>('Next')}</Typography>
        </Grid>
        <Divider orientation='vertical' sx={{ bgcolor: (!activeCrowdloans?.length || itemToShow === activeCrowdloans.length - 1) ? 'secondary.contrastText' : 'text.primary', height: '22px', ml: '7px', mr: '3px', my: 'auto', width: '1px' }} />
        <KeyboardDoubleArrowRightIcon sx={{ color: (!activeCrowdloans?.length || itemToShow === activeCrowdloans?.length - 1) ? 'secondary.contrastText' : 'secondary.light', fontSize: '25px' }} />
      </Grid>
    </Grid>
  );

  const goNextCrowdloan = useCallback(() => {
    activeCrowdloans && itemToShow !== (activeCrowdloans.length - 1) && setItemToShow(itemToShow + 1);
  }, [activeCrowdloans, itemToShow]);

  const goPreviousCrowdloan = useCallback(() => {
    itemToShow !== 0 && setItemToShow(itemToShow - 1);
  }, [itemToShow]);

  return (
    <>
      <BouncingSubTitle label={t<string>('Active Crowdloans')} style={{ fontSize: '20px', fontWeight: 400 }} />
      <Grid container sx={{ height: window.innerHeight - 360, m: 'auto', width: '92%' }}>
        {activeCrowdloans?.length
          ? <>
            <Arrows onNext={goNextCrowdloan} onPrevious={goPreviousCrowdloan} />
            <ShowCrowdloan
              api={api}
              chain={chain}
              crowdloan={activeCrowdloans[itemToShow]}
              crowdloansId={crowdloansId}
              currentBlockNumber={currentBlockNumber}
              decimal={decimal}
              myContribution={getMyContribution(activeCrowdloans[itemToShow].fund.paraId)}
              onContribute={contributeToCrowdloan}
              setSelectedCrowdloan={setSelectedCrowdloan}
              token={token}
            />
          </>
          : activeCrowdloans === null
            ? <Grid container height='15px' item justifyContent='center' mt='30px'>
              <Warning
                fontWeight={400}
                theme={theme}
              >
                {t<string>('No available active crowdloan.')}
              </Warning>
            </Grid>
            : <Progress pt='95px' size={125} title={t('Loading active crowdloans...')} />
        }
      </Grid>
      {showContribute && selectedCrowdloan &&
        <Contribute
          api={api}
          chain={chain}
          crowdloan={selectedCrowdloan}
          crowdloansId={crowdloansId}
          currentBlockNumber={currentBlockNumber}
          formatted={formatted}
          minContribution={minContribution}
          myContribution={getMyContribution(selectedCrowdloan.fund.paraId)}
          setShowContribute={setShowContribute}
          showContribute={showContribute}
        />
      }
    </>
  );
}
