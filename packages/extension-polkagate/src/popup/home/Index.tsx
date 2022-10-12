// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../../../../extension-ui/src/types';

import { Container, Grid } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AccountWithChildren } from '@polkadot/extension-base/background/types';
import { AccountsStore } from '@polkadot/extension-base/stores';
import getNetworkMap from '@polkadot/extension-ui/util/getNetworkMap';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { AccountContext } from '../../components';
import useTranslation from '../../hooks/useTranslation';
import HeaderBrand from '../../partials/HeaderBrand';
import { Price } from '../../util/plusTypes';
import AddAccount from '../welcome/AddAccount';
import AccountsTree from './AccountsTree';
import YouHave from './YouHave';

interface Props extends ThemeProps {
  className?: string;
}

export default function Home ({ className }: Props): React.ReactElement {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('');
  const [filteredAccount, setFilteredAccount] = useState<AccountWithChildren[]>([]);
  const { hierarchy } = useContext(AccountContext);
  const networkMap = useMemo(() => getNetworkMap(), []);
  const [allPrices, setAllPrices] = useState<Price[] | undefined>();

  useEffect(() => {
    // eslint-disable-next-line no-void
    void cryptoWaitReady().then(() => {
      keyring.loadAll({ store: new AccountsStore() });
    }).catch(null);
  }, []);

  useEffect(() => {
    setFilteredAccount(
      filter
        ? hierarchy.filter((account) =>
          account.name?.toLowerCase().includes(filter) ||
          (account.genesisHash && networkMap.get(account.genesisHash)?.toLowerCase().includes(filter))
        )
        : hierarchy
    );
  }, [filter, hierarchy, networkMap]);

  const _onFilter = useCallback((event: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>) => {
    const filter = event.target.value;

    setFilter(filter.toLowerCase());
  }, []);

  console.log('home');

  return (
    <>
      {(hierarchy.length === 0)
        ? <AddAccount />
        : (
          <>
            <Grid
              padding='0px'
              textAlign='center'
              xs={12}
            >
              <HeaderBrand
                showSettings
                text={t<string>('Polkagate')}
              />
            </Grid>
            <YouHave allPrices={allPrices} />
            <Container
              disableGutters
              sx={[{
                '&::-webkit-scrollbar': {
                  display: 'none',
                  width: 0
                },
                '> .tree:last-child': { border: 'none' },
                backgroundColor: 'background.paper',
                border: '0.5px solid',
                borderColor: 'secondary.light',
                borderRadius: '5px',
                m: 'auto',
                maxHeight: `${self.innerHeight - 170}px`,
                mt: '10px',
                overflowY: 'scroll',
                p: 0,
                scrollbarWidth: 'none',
                width: '92%'
              }]}
            >
              {filteredAccount.map((json, index): React.ReactNode => (
                <AccountsTree
                  {...json}
                  allPrices={allPrices}
                  key={`${index}:${json.address}`}
                  setAllPrices={setAllPrices}
                />
              ))}
            </Container>
          </>
        )
      }
    </>
  );
}
