// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { MyPoolInfo } from '../../../../../util/types';

import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Option } from '@polkadot/types';

import { AccountContext, AddressInput, AutoResizeTextarea, Input, PButton, Popup, ShowValue } from '../../../../../components';
import { useApi, useChain, useFormatted, useTranslation } from '../../../../../hooks';
import { HeaderBrand } from '../../../../../partials';
import getAllAddresses from '../../../../../util/getAllAddresses';
import CollapseIt from './CollapseIt';
import Review from './Review';

interface Props {
  address: string;
  pool: MyPoolInfo;
  showEdit: boolean;
  setShowEdit: React.Dispatch<React.SetStateAction<boolean>>;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface ChangesProps {
  commission: {
    payee: string | undefined | null;
    value: number | undefined | null;
  },
  newPoolName: string | undefined | null;
  newRoles: {
    newRoot: string | undefined | null;
    newNominator: string | undefined | null;
    newBouncer: string | undefined | null;
  } | undefined
}

export default function EditPool({ address, pool, setRefresh, setShowEdit, showEdit }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const api = useApi(address);
  const chain = useChain(address);
  const formatted = useFormatted(address);
  const { hierarchy } = useContext(AccountContext);

  const myPoolName = pool?.metadata;
  const myPoolRoles = pool?.bondedPool?.roles;
  const depositorAddress = pool?.bondedPool?.roles?.depositor?.toString();

  const maybeCommissionPayee = pool?.bondedPool?.commission?.current?.[1]?.toString() as string | undefined;
  const mayBeCommission = (pool?.bondedPool?.commission?.current?.[0] || 0) as number;
  const commissionValue = Number(mayBeCommission) / (10 ** 7) < 1 ? 0 : Number(mayBeCommission) / (10 ** 7);

  const [showReview, setShowReview] = useState<boolean>(false);
  const [changes, setChanges] = useState<ChangesProps | undefined>();
  const [newPoolName, setNewPoolName] = useState<string>();
  const [newRootAddress, setNewRootAddress] = useState<string | null | undefined>();
  const [newNominatorAddress, setNewNominatorAddress] = useState<string | null | undefined>();
  const [newBouncerAddress, setNewBouncerAddress] = useState<string | null | undefined>();
  const [collapsedName, setCollapsed] = useState<'Roles' | 'Commission' | undefined>();
  const [newCommissionPayee, setNewCommissionPayee] = useState<string | null | undefined>();
  const [newCommissionValue, setNewCommissionValue] = useState<number | undefined>();
  const [maxCommission, setMaxCommission] = useState<number | undefined>();

  const open = useCallback((title: 'Roles' | 'Commission') => {
    setCollapsed(title === collapsedName ? undefined : title);
  }, [collapsedName]);

  const allAddresses = getAllAddresses(hierarchy, false, true, chain?.ss58Format);

  useEffect(() => {
    !newPoolName && myPoolName && setNewPoolName(myPoolName);
    !newRootAddress && pool?.bondedPool?.roles && setNewRootAddress(pool?.bondedPool?.roles.root?.toString());
    !newNominatorAddress && pool?.bondedPool?.roles && setNewNominatorAddress(pool?.bondedPool?.roles.nominator?.toString());
    !newBouncerAddress && pool?.bondedPool?.roles && setNewBouncerAddress(pool?.bondedPool?.roles.bouncer?.toString());

    !newCommissionPayee && maybeCommissionPayee && setNewCommissionPayee(maybeCommissionPayee);
    !newCommissionPayee && commissionValue && setNewCommissionValue(commissionValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);// needs to be run only once to initialize

  useEffect(() => {
    setChanges({
      commission: {
        payee: getChangedValue(newCommissionPayee, maybeCommissionPayee),
        value: (newCommissionPayee || maybeCommissionPayee) ? getChangedValue(newCommissionValue, commissionValue) : undefined
      },
      newPoolName: getChangedValue(newPoolName, myPoolName),
      newRoles: {
        newBouncer: getChangedValue(newBouncerAddress, myPoolRoles?.bouncer?.toString()),
        newNominator: getChangedValue(newNominatorAddress, myPoolRoles?.nominator?.toString()),
        newRoot: getChangedValue(newRootAddress, myPoolRoles?.root?.toString())
      }
    });
  }, [commissionValue, maybeCommissionPayee, myPoolName, myPoolRoles, newBouncerAddress, newCommissionPayee, newCommissionValue, newNominatorAddress, newPoolName, newRootAddress]);

  useEffect(() => {
    api && api.query.nominationPools.globalMaxCommission().then((res: Option) => {
      if (res.isSome) {
        setMaxCommission(res.unwrap());
        console.log('res:', res.unwrap());
      }
    });
  }, [api]);

  const getChangedValue = (newValue: string | number | null | undefined, oldValue: number | string | null | undefined): undefined | null | string => {
    if ((newValue === null || newValue === undefined) && oldValue) {
      return null;
    }

    if ((newValue !== null || newValue !== undefined) && newValue !== oldValue) {
      return newValue;
    }

    return undefined;
  };

  const backToPool = useCallback(() => {
    setShowEdit(!showEdit);
  }, [setShowEdit, showEdit]);

  const goToEdit = useCallback(() => {
    setShowReview(!showReview);
  }, [showReview]);

  const _onPoolNameChange = useCallback((name: string) => {
    setNewPoolName(name);
  }, []);

  const nextBtnDisable = changes && Object.values(changes).every((value) => {
    if (typeof value === 'object' && value !== null) {
      return Object.values(value as { [s: string]: unknown }).every((nestedValue) => nestedValue === undefined);
    }

    return value === undefined;
  });

  const onNewCommission = useCallback((e) => {
    const value = Number(e.target.value);

    if (value !== commissionValue) {
      setNewCommissionValue(value > 100 ? 100 : value);
    } else {
      setNewCommissionValue(undefined);
    }
  }, [commissionValue]);

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
        <CollapseIt
          open={open}
          show={collapsedName === 'Roles'}
          title={t('Roles')}
        >
          <>
            <AddressInput
              address={depositorAddress}
              chain={chain}
              disabled
              label={'Depositor'}
              // setAddress={setDepositorAddress}
              showIdenticon
              style={{
                m: '15px auto 0',
                width: '98%'
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
                width: '98%'
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
                width: '98%'
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
                m: '15px auto 10px 0',
                width: '98%'
              }}
            />
          </>
        </CollapseIt>
        <CollapseIt
          open={open}
          show={collapsedName === 'Commission'}
          title={t('Commission')}
        >
          <>
            <Grid container item>
              <Grid container item>
                <Typography fontSize='14px' fontWeight={400} lineHeight='25px' overflow='hidden' mt='10px' textOverflow='ellipsis' whiteSpace='nowrap'>
                  {t('Percent')}
                </Typography>
              </Grid>
              <Input
                autoCapitalize='off'
                autoCorrect='off'
                fontSize='18px'
                height='32px'
                margin='auto 0 3px'
                max={100}
                onChange={(e) => onNewCommission(e)}
                padding='0px'
                placeholder={`${commissionValue}%`}
                spellCheck={false}
                textAlign='center'
                theme={theme}
                type='number'
                width='62%'
              />
              <Grid alignItems='center' container item justifyContent='flex-start' sx={{ fontWeight: 500, pl: '10px', textDecorationLine: 'underLine', width: '35%' }}>
                <Grid item pr='5px'>
                  {t('Max')}:
                </Grid>
                <Grid item>
                  <ShowValue value={maxCommission?.toHuman()} width='58px' />
                </Grid>
              </Grid>
            </Grid>
            <AddressInput
              address={newCommissionPayee}
              allAddresses={allAddresses}
              chain={chain}
              label={t('Payee')}
              setAddress={setNewCommissionPayee}
              showIdenticon
              style={{
                m: '15px auto 0',
                width: '98%'
              }}
            />
          </>
        </CollapseIt>
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
          formatted={String(formatted)}
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
