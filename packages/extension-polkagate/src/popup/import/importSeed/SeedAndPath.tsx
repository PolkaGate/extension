// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { KeypairType } from '@polkadot/util-crypto/types';

import { useTheme } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { Chain } from '@polkadot/extension-chains/types';
import { objectSpread } from '@polkadot/util';

import { InputWithLabel, PButton, SelectChain, TextAreaWithLabel, Warning } from '../../../components';
import { useGenesisHashOptions, useTranslation } from '../../../hooks';
import { getMetadata, validateSeed } from '../../../messaging';
import getLogo from '../../../util/getLogo';

interface AccountInfo {
  address: string;
  genesis?: string;
  suri: string;
}

interface Props {
  onNextStep: () => void;
  onAccountChange: (account: AccountInfo | null) => void;
  type: KeypairType;
}

export default function SeedAndPath ({ onAccountChange, onNextStep, type }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const genesisOptions = useGenesisHashOptions();
  const [address, setAddress] = useState('');
  const [seed, setSeed] = useState<string | null>(null);
  const [path, setPath] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [genesis, setGenesis] = useState('');
  const [newChain, setNewChain] = useState<Chain | null>(null);

  useEffect(() => {
    // No need to validate an empty seed
    // we have a dedicated error for this
    if (!seed) {
      onAccountChange(null);
      setError('');

      return;
    }

    const suri = `${seed || ''}${path || ''}`;

    validateSeed(suri, type)
      .then((validatedAccount) => {
        setError('');
        setAddress(validatedAccount.address);
        onAccountChange(
          objectSpread<AccountInfo>({}, validatedAccount, { genesis, type })
        );
      })
      .catch(() => {
        setAddress('');
        onAccountChange(null);
        setError(path
          ? t<string>('Invalid mnemonic seed or derivation path')
          : t<string>('Invalid mnemonic seed')
        );
      });
  }, [t, genesis, seed, path, onAccountChange, type]);

  useEffect(() => {
    genesis && getMetadata(genesis, true).then(setNewChain).catch((error): void => {
      console.error(error);
      setNewChain(null);
    });
  }, [genesis]);

  const _onChangeNetwork = useCallback((newGenesisHash: string) => {
    setGenesis(newGenesisHash);
  }, []);

  return (
    <>
      <div style={{ margin: 'auto', width: '92%' }}>
        <TextAreaWithLabel
          fontSize='18px'
          isError={!!error}
          isFocused
          label={t<string>('Existing 12 or 24-word mnemonic seed')}
          onChange={setSeed}
          rowsCount={2}
          value={seed || ''}
        />
        {!!error && !!seed && (
          <Warning
            className='seedError'
            isBelowInput
            isDanger
            theme={theme}
          >
            {error}
          </Warning>
        )}
        <SelectChain
          address={address}
          defaultValue={newChain?.genesisHash || genesisOptions[0].text}
          icon={getLogo(newChain ?? undefined)}
          label={t<string>('Select the chain')}
          onChange={_onChangeNetwork}
          options={genesisOptions}
          style={{ marginTop: !!error && !!seed ? '35px' : '15px', p: 0, pb: '15px' }}
        />
        <InputWithLabel
          isError={!!path && !!error}
          label={t<string>('Derivation path if it is derived account, otherwise ignore')}
          onChange={setPath}
          value={path || ''}
        />
      </div>
      <PButton
        _onClick={onNextStep}
        disabled={!address || !!error}
        text={t<string>('Next')}
      />
    </>
  );
}
