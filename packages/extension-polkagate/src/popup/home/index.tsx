// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Grid } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AccountWithChildren } from '@polkadot/extension-base/background/types';
import { AccountsStore } from '@polkadot/extension-base/stores';
import keyring from '@polkadot/ui-keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

import { AccountContext } from '../../components';
import { useChainNames, usePrices, useTranslation } from '../../hooks';
import HeaderBrand from '../../partials/HeaderBrand';
import getNetworkMap from '../../util/getNetworkMap';
import AddAccount from '../welcome/AddAccount';
import AccountsTree from './AccountsTree';
import YouHave from './YouHave';

export default function Home (): React.ReactElement {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('');
  const { hierarchy } = useContext(AccountContext);
  const chainNames = useChainNames();
  const [filteredAccount, setFilteredAccount] = useState<AccountWithChildren[]>([]);
  const [sortedAccount, setSortedAccount] = useState<AccountWithChildren[]>([]);
  const [hideNumbers, setHideNumbers] = useState<boolean>();

  usePrices(chainNames); // get balances for all chains available in accounts
  const [quickActionOpen, setQuickActionOpen] = useState<string | boolean>();

  const networkMap = useMemo(() => getNetworkMap(), []);

  useEffect(() => {
    cryptoWaitReady().then(() => {
      keyring.loadAll({ store: new AccountsStore() });
    }).catch(() => null);
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

  useEffect(() => {
    setSortedAccount(filteredAccount.sort((a, b) => {
      const x = a.name.toLowerCase();
      const y = b.name.toLowerCase();

      if (x < y) {
        return -1;
      }

      if (x > y) {
        return 1;
      }

      return 0;
    }));
  }, [filteredAccount]);

  const _onFilter = useCallback((event: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>) => {
    const filter = event.target.value;

    setFilter(filter.toLowerCase());
  }, []);

  return (
    <>
      {(hierarchy.length === 0)
        ? <AddAccount />
        : (
          <>
            <Grid padding='0px' textAlign='center' xs={12}>
              <HeaderBrand
                showBrand
                showMenu
                text={t<string>('Polkagate')}
              />
            </Grid>
            <YouHave
              hideNumbers={hideNumbers}
              setHideNumbers={setHideNumbers}
            />
            <Container
              disableGutters
              sx={[{
                // '> .tree:first-child': { border: 'none' },
                // backgroundColor: 'background.paper',
                // border: '0.5px solid',
                // borderColor: 'secondary.light',
                // borderRadius: '5px',
                m: 'auto',
                maxHeight: `${self.innerHeight - 165}px`,
                mt: '10px',
                overflowY: 'scroll',
                p: 0,
                width: '92%'
              }]}
            >
              {sortedAccount.map((json, index): React.ReactNode => (
                <AccountsTree
                  {...json}
                  hideNumbers={hideNumbers}
                  key={`${index}:${json.address}`}
                  quickActionOpen={quickActionOpen}
                  setQuickActionOpen={setQuickActionOpen}
                />
              ))}
            </Container>
          </>
        )
      }
    </>
  );
}
