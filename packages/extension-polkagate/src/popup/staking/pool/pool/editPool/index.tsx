// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ApiPromise } from '@polkadot/api';
import type { MyPoolInfo } from '../../../../../util/types';

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { AccountContext, InputWithLabel, InputWithLabelAndIdenticon, PButton, Popup } from '../../../../../components';
import { useApi, useChain, useFormatted, usePool, useTranslation } from '../../../../../hooks';
import { HeaderBrand } from '../../../../../partials';
import getAllAddresses from '../../../../../util/getAllAddresses';
import Review from './Review';

interface Props {
  address: string;
  apiToUse: ApiPromise;
  pool?: MyPoolInfo;
  showEdit: boolean;
  setShowEdit: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface ChangesProps {
  newPoolName?: string;
  newRoles?: {
    newRoot?: string;
    newNominator?: string;
    newStateToggler?: string;
  }
}

export default function EditPool({ address, apiToUse, pool, setShowEdit, showEdit }: Props): React.ReactElement {
  const { t } = useTranslation();

  const api = useApi(address, apiToUse);
  const myPool = usePool(address, undefined, pool);
  const chain = useChain(address);
  const formatted = useFormatted(address);
  const { accounts, hierarchy } = useContext(AccountContext);

  const myPoolName = myPool?.metadata;
  const myPoolRoles = myPool?.bondedPool?.roles;

  const [nextBtnDisable, setNextBtnDisable] = useState<boolean>(false);
  const [showReview, setShowReview] = useState<boolean>(false);
  const [changes, setChanges] = useState<ChangesProps | undefined>();
  const [newPoolName, setNewPoolName] = useState<string>();
  const [depositorAddress, setDepositorAddress] = useState<string | undefined>();
  const [newRootAddress, setNewRootAddress] = useState<string | undefined>();
  const [newNominatorAddress, setNewNominatorAddress] = useState<string | undefined>();
  const [newStateTogglerAddress, setNewStateTogglerAddress] = useState<string | undefined>();

  const allAddresses = getAllAddresses(hierarchy, true, true, chain?.ss58Format, address);

  const backToPool = useCallback(() => {
    setShowEdit(!showEdit);
  }, [setShowEdit, showEdit]);

  const goToEdit = useCallback(() => {
    setShowReview(!showReview);
  }, [showReview]);

  const _onPoolNameChange = useCallback((name: string) => {
    setNewPoolName(name);
  }, []);

  useEffect(() => {
    !newPoolName && myPoolName && setNewPoolName(myPoolName);
    !depositorAddress && myPool?.bondedPool?.roles && setDepositorAddress(myPool?.bondedPool?.roles.depositor.toString());
    !newRootAddress && myPool?.bondedPool?.roles && setNewRootAddress(myPool?.bondedPool?.roles.root?.toString());
    !newNominatorAddress && myPool?.bondedPool?.roles && setNewNominatorAddress(myPool?.bondedPool?.roles.nominator?.toString());
    !newStateTogglerAddress && myPool?.bondedPool?.roles && setNewStateTogglerAddress(myPool?.bondedPool?.roles.stateToggler?.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myPool?.bondedPool?.roles]);

  useEffect(() => {
    setChanges({
      newPoolName: myPoolName !== newPoolName ? newPoolName ?? '' : undefined,
      newRoles: (newRootAddress !== myPoolRoles?.root?.toString() || newNominatorAddress !== myPoolRoles?.nominator?.toString() || newStateTogglerAddress !== myPoolRoles?.stateToggler?.toString())
        ? {
          newNominator: newNominatorAddress !== myPoolRoles?.nominator?.toString() ? newNominatorAddress ?? '' : undefined,
          newRoot: newRootAddress !== myPoolRoles?.root?.toString() ? newRootAddress ?? '' : undefined,
          newStateToggler: newStateTogglerAddress !== myPoolRoles?.stateToggler?.toString() ? newStateTogglerAddress ?? '' : undefined
        }
        : undefined
    });
  }, [newPoolName, newRootAddress, newNominatorAddress, newStateTogglerAddress, myPoolName, myPoolRoles?.root, myPoolRoles?.nominator, myPoolRoles?.stateToggler]);

  useEffect(() => {
    setNextBtnDisable(!(changes?.newPoolName || changes?.newRoles));
  }, [changes]);

  return (
    <>
      <Popup show={showEdit}>
        <HeaderBrand
          onBackClick={backToPool}
          shortBorder
          showBackArrow
          showClose
          text={t<string>('Edit Pool')}
          withSteps={{ current: 1, total: 2 }}
        />
        <Grid container m='20px auto 10px' width='92%'>
          <InputWithLabel label={t<string>('Pool name')} onChange={_onPoolNameChange} value={newPoolName} />
        </Grid>
        <Typography fontSize='18px' fontWeight={300} m='30px auto 15px' textAlign='center'>
          {t<string>('Roles')}
        </Typography>
        <InputWithLabelAndIdenticon
          address={depositorAddress}
          chain={chain}
          disabled
          label={'Depositor'}
          setAddress={setDepositorAddress}
          showIdenticon
          style={{
            m: '15px auto 0',
            width: '92%'
          }}
        />
        <InputWithLabelAndIdenticon
          address={newRootAddress}
          allAddresses={allAddresses}
          chain={chain}
          label={'Root'}
          setAddress={setNewRootAddress}
          showIdenticon
          style={{
            m: '15px auto 0',
            width: '92%'
          }}
        />
        <InputWithLabelAndIdenticon
          address={newNominatorAddress}
          allAddresses={allAddresses}
          chain={chain}
          label={'Nominator'}
          setAddress={setNewNominatorAddress}
          showIdenticon
          style={{
            m: '15px auto 0',
            width: '92%'
          }}
        />
        <InputWithLabelAndIdenticon
          address={newStateTogglerAddress}
          allAddresses={allAddresses}
          chain={chain}
          label={'State toggler'}
          setAddress={setNewStateTogglerAddress}
          showIdenticon
          style={{
            m: '15px auto 0',
            width: '92%'
          }}
        />
        <PButton
          _onClick={goToEdit}
          disabled={nextBtnDisable}
          text={t<string>('Next')}
        />
      </Popup>
      {showReview &&
        <Review address={address} api={api} chain={chain} formatted={formatted} pool={myPool} setShow={setShowReview} setShowMyPool={setShowEdit} show={showReview} changes={changes} />
      }
    </>
  );
}
