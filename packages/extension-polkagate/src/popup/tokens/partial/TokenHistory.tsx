// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon, IconProps } from 'iconsax-react';
import type { TransactionDetail } from '../../../util/types';

import { Container, Grid, IconButton, Typography } from '@mui/material';
import { ArrowSwapHorizontal, Record, Setting4 } from 'iconsax-react';
import React, { memo, useCallback, useMemo, useReducer, useState } from 'react';

import { SharePopup } from '@polkadot/extension-polkagate/src/partials';

import { DecisionButtons, GradientSwitch } from '../../../components';
import SnowFlake from '../../../components/SVG/SnowFlake';
import { useTranslation } from '../../../hooks';
import HistoryBox from '../../history/newDesign/HistoryBox';
import useTransactionHistory from '../../history/useTransactionHistory';

interface FilterState {
  governance: boolean;
  staking: boolean;
  transfer: boolean;
  apply: boolean;
  reset: boolean;
}

interface FilterAction {
  filter: keyof FilterState;
}

const INITIAL_STATE: FilterState = {
  apply: true,
  governance: true,
  reset: false,
  staking: true,
  transfer: true
};

const filterReducer = (state: FilterState, action: FilterAction): FilterState => {
  if (action.filter === 'apply') {
    return {
      ...state,
      apply: true
    };
  } else if (action.filter === 'reset') {
    return INITIAL_STATE;
  } else {
    return {
      ...state,
      [action.filter]: !state[action.filter],
      apply: false
    };
  }
};

interface FilterItemProps {
  Icon?: Icon;
  Logo?: React.ReactNode;
  name: string;
  onClick: () => void;
  checked: boolean;
  iconVariant?: IconProps['variant'];
}

const FilterItem = ({ Icon, Logo, checked, iconVariant, name, onClick }: FilterItemProps) => {
  return (
    <Grid alignItems='center' container item justifyContent='space-between'>
      <Grid alignItems='center' container item justifyContent='space-between' sx={{ columnGap: '8px', width: 'fit-content' }}>
        {Icon && <Icon color='#AA83DC' size='24' style={{ background: '#05091C', borderRadius: '999px', padding: '3px' }} variant={ iconVariant ?? 'Outline'} />}
        {Logo}
        <Typography color='text.primary' variant='B-1'>
          {name}
        </Typography>
      </Grid>
      <GradientSwitch
        checked={checked}
        onChange={onClick}
      />
    </Grid>
  );
};

interface FilterHistoryProps {
  openMenu: boolean;
  setOpenMenu: React.Dispatch<React.SetStateAction<boolean>>;
  dispatchFilter: React.Dispatch<FilterAction>;
  filter: FilterState;
}

function FilterHistory ({ dispatchFilter, filter, openMenu, setOpenMenu }: FilterHistoryProps) {
  const { t } = useTranslation();

  const closePopup = useCallback(() => {
    setOpenMenu(false);
  }, [setOpenMenu]);

  const onFilters = useCallback((filter: keyof FilterState) => () => {
    dispatchFilter({ filter });
    ['apply', 'reset'].includes(filter) && closePopup();
  }, [closePopup, dispatchFilter]);

  return (
    <SharePopup
      onClose={closePopup}
      open={openMenu}
      popupProps={{ TitleIcon: Setting4, iconSize: 24, pt: 20 }}
      title={t('Filters')}
    >
      <>
        <Container disableGutters sx={{ display: 'flex', flexDirection: 'column', height: '333px', justifyContent: 'flex-start', p: '5px', position: 'relative', pt: '25px', rowGap: '20px', zIndex: 1 }}>
          <FilterItem
            Icon={ArrowSwapHorizontal}
            checked={filter.transfer}
            name={t('Transfers')}
            onClick={onFilters('transfer')}
          />
          <FilterItem
            Icon={Record}
            checked={filter.governance}
            iconVariant='Bulk'
            name={t('Governance')}
            onClick={onFilters('governance')}
          />
          <FilterItem
            Logo={<SnowFlake size='24' style={{ background: '#05091C', borderRadius: '999px', padding: '3px' }} />}
            checked={filter.staking}
            name={t('Staking')}
            onClick={onFilters('staking')}
          />
        </Container>
        <DecisionButtons
          direction='vertical'
          onPrimaryClick={onFilters('apply')}
          onSecondaryClick={onFilters('reset')}
          primaryBtnText={t('Apply')}
          secondaryBtnText={t('Reset Filters')}
        />
      </>
    </SharePopup>
  );
}

interface Props {
  genesisHash: string | undefined;
  address: string | undefined;
  decimal: number | undefined;
  token: string | undefined;
}

function TokenHistory ({ address, decimal, genesisHash, token }: Props): React.ReactElement {
  const { t } = useTranslation();

  const [openMenu, setOpenMenu] = useState<boolean>(false);
  const [filter, dispatchFilter] = useReducer(filterReducer, INITIAL_STATE);

  const { grouped } = useTransactionHistory(address, genesisHash, { governance: filter.governance, staking: filter.staking, transfers: filter.transfer });

  const historyItemsToShow = useMemo(() => {
    if (!grouped) {
      return grouped;
    }

    const result = Object.fromEntries(
      Object.entries(grouped)
        .map(([date, items]) => {
          const filteredItems = items.filter(
            ({ token: historyItemToken }) => historyItemToken === token
          )
            .map((item) => ({ ...item, decimal }));

          return [date, filteredItems];
        })
        .filter(([, filteredItems]) => filteredItems.length > 0)
    ) as Record<string, TransactionDetail[]>;

    // Check if result is an empty object
    return Object.keys(result).length === 0 ? null : result;
  }, [decimal, grouped, token]);

  const openPopup = useCallback(() => setOpenMenu(true), []);

  return (
    <>
      <Grid alignItems='center' columnGap='8px' container item pl='15px'>
        <Typography color='text.primary' variant='B-3'>
          {t('History')}
        </Typography>
        <IconButton onClick={openPopup} sx={{ ':hover': { background: '#674394' }, background: '#2D1E4A', borderRadius: '12px', p: '5px 8px' }}>
          <Setting4 color='#AA83DC' size='18' variant='Bold' />
        </IconButton>
      </Grid>
      <HistoryBox
        historyItems={historyItemsToShow}
        notReady={!genesisHash}
        style={{ margin: '10px 12px 15px', width: 'calc(100% - 24px)' }}
      />
      <FilterHistory
        dispatchFilter={dispatchFilter}
        filter={filter}
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
      />
    </>
  );
}

export default memo(TokenHistory);
