// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';

import { Chain } from '@polkadot/extension-chains/types';

import { ActionContext, Loading } from '../../../../extension-ui/src/components';
import AccountNamePasswordCreation from '../../../../extension-ui/src/components/AccountNamePasswordCreation';
import useGenesisHashOptions from '../../../../extension-ui/src/hooks/useGenesisHashOptions';
import useMetadata from '../../../../extension-ui/src/hooks/useMetadata';
import useTranslation from '../../../../extension-ui/src/hooks/useTranslation';
import { createAccountSuri, createSeed, getMetadata, validateSeed } from '../../../../extension-ui/src/messaging';
import { DEFAULT_TYPE } from '../../../../extension-ui/src/util/defaultType';
import PAddress from '../../components/Address';
import DropdownWithIcon from '../../components/DropdownWithIcon';
import HeaderBrand from '../../partials/HeaderBrand';
import getLogo from '../../util/getLogo';
import Mnemonic from './Mnemonic';

interface Props {
  className?: string;
}

function CreateAccount({ className }: Props): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);
  const [isBusy, setIsBusy] = useState(false);
  const [newChain, setNewChain] = useState<Chain | null>(null);
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState<null | string>(null);
  const [seed, setSeed] = useState<null | string>(null);
  const [type, setType] = useState(DEFAULT_TYPE);
  const [name, setName] = useState('');
  const options = useGenesisHashOptions();
  const [genesisHash, setGenesis] = useState('');
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

  const _onChangeNetwork = useCallback(
    (newGenesisHash: string) => setGenesis(newGenesisHash),
    []
  );

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
        showSettings
        text={t<string>('Create an account')}
      />
      <Loading>
        <div>
          <PAddress
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
                <DropdownWithIcon
                  defaultValue={options[0].text}
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
