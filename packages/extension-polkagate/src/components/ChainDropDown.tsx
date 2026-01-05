// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropdownOption } from '../util/types';

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import useAccountSelectedChain from '@polkadot/extension-polkagate/src/hooks/useAccountSelectedChain';
import { updateStorage } from '@polkadot/extension-polkagate/src/util/index';

import { useSelectedAccount } from '../hooks';
import { STORAGE_KEY } from '../util/constants';
import { DropSelect, GenesisHashOptionsContext } from '.';

const DEFAULT_SELECTED_OPTION: DropdownOption = { text: 'Select a chain', value: '' };

interface Props {
  style?: React.CSSProperties;
  withSelectAChainText?: boolean;
}

function ChainDropDown ({ style = {}, withSelectAChainText = true }: Props): React.ReactElement {
  const options = useContext(GenesisHashOptionsContext);
  const selectedAccount = useSelectedAccount();
  const savedSelectedChain = useAccountSelectedChain(selectedAccount?.address);

  const [selectedChain, setSelectedChain] = useState<number | string>(DEFAULT_SELECTED_OPTION.value);

  const handleSetChain = useCallback((value: string) => {
    setSelectedChain(value);
  }, []);

  useEffect(() => {
    savedSelectedChain && handleSetChain(savedSelectedChain);
  }, [handleSetChain, savedSelectedChain]);

  const chainOptions = useMemo(() => {
    const filteredOptions = options.filter((option) => option.value); // filter out the "Allow on any chain" option

    withSelectAChainText && filteredOptions.unshift(DEFAULT_SELECTED_OPTION);

    return filteredOptions;
  }, [options, withSelectAChainText]);

  const handleSelectedChain = useCallback((value: number | string) => {
    selectedAccount && updateStorage(STORAGE_KEY.ACCOUNT_SELECTED_CHAIN, { [selectedAccount.address]: value }).then(() => {
      handleSetChain(String(value));
    }).catch(console.error);
  }, [handleSetChain, selectedAccount]);

  return (
    <DropSelect
      displayContentType='logo'
      onChange={handleSelectedChain}
      options={chainOptions}
      style={{
        margin: '12px 15px',
        width: 'calc(100% - 30px)',
        ...style
      }}
      value={selectedChain}
    />
  );
}

export default ChainDropDown;
