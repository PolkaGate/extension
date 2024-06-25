// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

import type { Chain } from '@polkadot/extension-chains/types';

import React, { useCallback, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';

import { AccountNamePasswordCreation, ActionContext, Address, Loading, SelectChain } from '../../../components';
import { useGenesisHashOptions, useMetadata, useTranslation } from '../../../hooks';
import { createAccountSuri, createSeed, getMetadata, validateSeed } from '../../../messaging';
import HeaderBrand from '../../../partials/HeaderBrand';
import { DEFAULT_TYPE } from '../../../util/defaultType';
import getLogo from '../../../util/getLogo';
import Mnemonic from './Mnemonic';

function CreateAccount(): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const options = useGenesisHashOptions();
  const [isBusy, setIsBusy] = useState(false);
  const [newChain, setNewChain] = useState<Chain | null>(null);
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState<string>();
  const [seed, setSeed] = useState<null | string>(null);
  const [type, setType] = useState(DEFAULT_TYPE);
  const [name, setName] = useState('');
  const [genesisHash, setGenesis] = useState<string | undefined>();
  const chain = useMetadata(genesisHash, true);

  useEffect((): void => {
    createSeed(undefined)
      .then(({ address, seed }): void => {
        setAddress(address);
        setSeed(seed);
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect((): void => {
    if (seed) {
      const type = chain && chain.definition.chainType === 'ethereum'
        ? 'ethereum'
        : DEFAULT_TYPE;

      setType(type);
      validateSeed(seed, type)
        .then(({ address }) => setAddress(address))
        .catch(console.error);
    }
  }, [seed, chain]);

  const _onCreate = useCallback(
    (name: string, password: string): void => {
      // this should always be the case
      if (name && password && seed) {
        setIsBusy(true);

        createAccountSuri(name, password, seed, type, genesisHash)
          .then(() => onAction('/'))
          .catch((error: Error): void => {
            setIsBusy(false);
            console.error(error);
          });
      }
    },
    [genesisHash, onAction, seed, type]
  );

  const _onNextStep = useCallback(
    () => setStep((step) => step + 1),
    []
  );

  const _onPreviousStep = useCallback(
    () => setStep((step) => step - 1),
    []
  );

  const _onChangeNetwork = useCallback((newGenesisHash: string) => {
    const availableGenesisHash = newGenesisHash.startsWith('0x') ? newGenesisHash : undefined;

    setGenesis(availableGenesisHash);

    !availableGenesisHash && setNewChain(null);
  }, []);

  const _onBackClick = useCallback(() => {
    step === 1 ? onAction('/') : _onPreviousStep();
  }, [_onPreviousStep, onAction, step]);

  useEffect(() => {
    genesisHash && getMetadata(genesisHash, true).then(setNewChain).catch((error): void => {
      console.error(error);
      setNewChain(null);
    });
  }, [genesisHash]);

  return (
    <>
      <HeaderBrand
        onBackClick={_onBackClick}
        showBackArrow
        text={t<string>('Create an Account')}
        withSteps={{
          current: `${step}`,
          total: 2
        }}
      />
      <Loading>
        <div>
          <Address
            address={address}
            genesisHash={genesisHash}
            name={name}
          />
        </div>
        {seed && (
          step === 1
            ? (
              <Mnemonic
                onNextStep={_onNextStep}
                seed={seed}
              />
            )
            : (
              <>
                <SelectChain
                  address={address}
                  defaultValue={newChain?.genesisHash || options[0].text}
                  icon={getLogo(newChain ?? undefined)}
                  label={t<string>('Select the chain')}
                  onChange={_onChangeNetwork}
                  options={options}
                  style={{ margin: 'auto', p: 0, width: '92%' }}
                />
                <AccountNamePasswordCreation
                  buttonLabel={t<string>('Create account')}
                  isBusy={isBusy}
                  onCreate={_onCreate}
                  onNameChange={setName}
                />
              </>
            )
        )}
      </Loading>
    </>
  );
}

export default styled(CreateAccount)`
  margin-bottom: 16px;

  label::after {
    right: 36px;
  }
`;
