// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropdownOption } from '../util/types';

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import useAccountSelectedChain, { ACCOUNT_SELECTED_CHAIN_NAME_IN_STORAGE } from '@polkadot/extension-polkagate/src/hooks/useAccountSelectedChain';
import { updateStorage } from '@polkadot/extension-polkagate/src/util/index';

import { useSelectedAccount } from '../hooks';
import { DropSelect, GenesisHashOptionsContext } from '.';

const DEFAULT_SELECTED_OPTION: DropdownOption = { text: 'Select a chain', value: '' };

interface Props {
  style?: React.CSSProperties;
  withSelectChainText?: boolean;
}

function ChainDropDown({ style = {}, withSelectChainText = true }: Props): React.ReactElement {
  const options = useContext(GenesisHashOptionsContext);
  const selectedAccount = useSelectedAccount();
  const savedSelectedChain = useAccountSelectedChain(selectedAccount?.address);

  const [selectedChain, setSelectedChain] = useState<number | string>(DEFAULT_SELECTED_OPTION.value);

  useEffect(() => {
    savedSelectedChain && setSelectedChain(savedSelectedChain);
  }, [savedSelectedChain]);

  const chainOptions = useMemo(() => {
    const filteredOptions = options.filter((option) => option.value); // filter out the "Allow on any chain" option

    withSelectChainText && filteredOptions.unshift(DEFAULT_SELECTED_OPTION);

    return filteredOptions;
  }, [options, withSelectChainText]);

  const handleSelectedChain = useCallback((value: number | string) => {
    selectedAccount && updateStorage(ACCOUNT_SELECTED_CHAIN_NAME_IN_STORAGE, { [selectedAccount.address]: value }).then(() => {
      setSelectedChain(value);
    }).catch(console.error);
  }, [selectedAccount]);

  return (
    <DropSelect
      // defaultValue={savedSelectedChain ?? DEFAULT_SELECTED_OPTION.value}
      displayContentType='logo'
      onChange={handleSelectedChain}
      options={chainOptions}
      style={{
        mt: '12px',
        mx: '15px',
        width: 'calc(100% - 30px)',
        ...style
      }}
      value={selectedChain}
    />
  );
}

export default ChainDropDown;
