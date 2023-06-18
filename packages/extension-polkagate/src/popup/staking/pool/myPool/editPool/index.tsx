// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { ApiPromise } from '@polkadot/api';
import type { MyPoolInfo } from '../../../../../util/types';

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AccountContext, AddressInput, AutoResizeTextarea, PButton, Popup } from '../../../../../components';
import { useApi, useChain, useFormatted, useTranslation } from '../../../../../hooks';
import { HeaderBrand } from '../../../../../partials';
import getAllAddresses from '../../../../../util/getAllAddresses';
import Review from './Review';

interface Props {
  address: string;
  apiToUse: ApiPromise;
  pool: MyPoolInfo;
  showEdit: boolean;
  setShowEdit: React.Dispatch<React.SetStateAction<boolean>>;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface ChangesProps {
  newPoolName: string | undefined | null;
  newRoles: {
    newRoot: string | undefined | null;
    newNominator: string | undefined | null;
    newBouncer: string | undefined | null;
  } | undefined
}

export default function EditPool({ address, apiToUse, pool, setRefresh, setShowEdit, showEdit }: Props): React.ReactElement {
  const { t } = useTranslation();

  const api = useApi(address, apiToUse);
  const chain = useChain(address);
  const formatted = useFormatted(address);
  const { hierarchy } = useContext(AccountContext);

  const myPoolName = pool?.metadata;
  const myPoolRoles = pool?.bondedPool?.roles;

  const [showReview, setShowReview] = useState<boolean>(false);
  const [changes, setChanges] = useState<ChangesProps | undefined>();
  const [newPoolName, setNewPoolName] = useState<string>();
  const [depositorAddress, setDepositorAddress] = useState<string | null | undefined>();
  const [newRootAddress, setNewRootAddress] = useState<string | null | undefined>();
  const [newNominatorAddress, setNewNominatorAddress] = useState<string | null | undefined>();
  const [newBouncerAddress, setNewBouncerAddress] = useState<string | null | undefined>();

  const allAddresses = getAllAddresses(hierarchy, false, true, chain?.ss58Format);

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
    !depositorAddress && pool?.bondedPool?.roles && setDepositorAddress(pool?.bondedPool?.roles.depositor.toString());
    !newRootAddress && pool?.bondedPool?.roles && setNewRootAddress(pool?.bondedPool?.roles.root?.toString());
    !newNominatorAddress && pool?.bondedPool?.roles && setNewNominatorAddress(pool?.bondedPool?.roles.nominator?.toString());
    !newBouncerAddress && pool?.bondedPool?.roles && setNewBouncerAddress(pool?.bondedPool?.roles.bouncer?.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);// needs to be run only once to initialize

  const getChangedValue = (newValue: string | null | undefined, oldValue: string | undefined): undefined | null | string => {
    if (!newValue && oldValue) {
      return null;
    }

    if (newValue && newValue !== oldValue) {
      return newValue;
    }

    return undefined;
  };

  useEffect(() => {
    setChanges({
      newPoolName: getChangedValue(newPoolName, myPoolName),
      newRoles: {
        newNominator: getChangedValue(newNominatorAddress, myPoolRoles?.nominator?.toString()),
        newRoot: getChangedValue(newRootAddress, myPoolRoles?.root?.toString()),
        newBouncer: getChangedValue(newBouncerAddress, myPoolRoles?.bouncer?.toString())
      }
    });
  }, [myPoolName, myPoolRoles?.bouncer, myPoolRoles?.nominator, myPoolRoles?.root, newBouncerAddress, newNominatorAddress, newPoolName, newRootAddress]);

  const nextBtnDisable = useMemo(() =>
    changes?.newPoolName === undefined &&
    changes?.newRoles?.newNominator === undefined &&
    changes?.newRoles?.newRoot === undefined &&
    changes?.newRoles?.newBouncer === undefined
    , [changes?.newPoolName, changes?.newRoles?.newBouncer, changes?.newRoles?.newNominator, changes?.newRoles?.newRoot]);

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
        <Grid container m='10px auto' width='92%'>
          <AutoResizeTextarea label={t<string>('Pool name')} onChange={_onPoolNameChange} value={newPoolName} />
        </Grid>
        <Typography fontSize='16px' fontWeight={400} m='30px auto 15px' textAlign='center'>
          {t<string>('Roles')}
        </Typography>
        <AddressInput
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
        <AddressInput
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
        <AddressInput
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
        <AddressInput
          address={newBouncerAddress}
          allAddresses={allAddresses}
          chain={chain}
          label={t<string>('Bouncer')}
          setAddress={setNewBouncerAddress}
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
      {showReview && pool && formatted &&
        <Review
          address={address}
          api={api}
          chain={chain}
          changes={changes}
          formatted={formatted}
          pool={pool}
          setRefresh={setRefresh}
          setShow={setShowReview}
          setShowMyPool={setShowEdit}
          show={showReview}
          state={t<string>('Edit')}
        />
      }
    </>
  );
}
