// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component shows an account information in detail
 * */

import '@vaadin/icons';

import type { ApiPromise } from '@polkadot/api';
import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { AccountJson, AccountWithChildren } from '@polkadot/extension-base/background/types';
import type { SettingsStruct } from '@polkadot/ui-settings/types';
import type { KeypairType } from '@polkadot/util-crypto/types';
import type { ThemeProps } from '../../../../extension-ui/src/types';

import { faHistory, faPaperPlane, faQrcode, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon } from '@mui/icons-material';
import { Container, Divider, Grid, IconButton, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { Chain } from '@polkadot/extension-chains/types';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { AccountContext, ActionContext, DropdownWithIcon, HorizontalMenuItem, Identicon, Motion, Select, SettingsContext } from '../../components';
import { useApi, useEndpoint, useEndpoints, useFormatted, useGenesisHashOptions, useMetadata, useProxies, useTranslation } from '../../hooks';
import { getMetadata, tieAccount, updateMeta } from '../../messaging';
import { HeaderBrand } from '../../partials';
import { getPrice } from '../../util/api/getPrice';
import { DEFAULT_TYPE } from '../../util/defaultType';
import getLogo from '../../util/getLogo';
import { FormattedAddressState } from '../../util/types';
import { prepareMetaData } from '../../util/utils';
import AccountBrief from './AccountBrief';
import LabelBalancePrice from './LabelBalancePrice';
import Others from './Others';

interface Props extends ThemeProps {
  className?: string;
}

interface Recoded {
  account: AccountJson | null;
  newFormattedAddress: string | null;
  newGenesisHash?: string | null;
  prefix?: number;
  type: KeypairType;
}

const defaultRecoded = { account: null, newFormattedAddress: null, prefix: 42, type: DEFAULT_TYPE };

// find an account in our list
function findSubstrateAccount(accounts: AccountJson[], publicKey: Uint8Array): AccountJson | null {
  const pkStr = publicKey.toString();

  return accounts.find(({ address }): boolean =>
    decodeAddress(address).toString() === pkStr
  ) || null;
}

// recodes an supplied address using the prefix/genesisHash, include the actual saved account & chain
function recodeAddress(address: string, accounts: AccountWithChildren[], chain: Chain | null, settings: SettingsStruct): Recoded {
  // decode and create a shortcut for the encoded address
  const publicKey = decodeAddress(address);

  // find our account using the actual publicKey, and then find the associated chain
  const account = findSubstrateAccount(accounts, publicKey);
  const prefix = chain ? chain.ss58Format : (settings.prefix === -1 ? 42 : settings.prefix);

  // always allow the actual settings to override the display
  return {
    account,
    newFormattedAddress: account?.type === 'ethereum'
      ? address
      : encodeAddress(publicKey, prefix),
    newGenesisHash: account?.genesisHash,
    prefix,
    type: account?.type || DEFAULT_TYPE
  };
}

export default function AccountDetails({ className }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const history = useHistory();
  const settings = useContext(SettingsContext);
  const onAction = useContext(ActionContext);// added for plus
  const theme = useTheme();
  const { pathname, state } = useLocation();
  const { accounts } = useContext(AccountContext);
  const { address, genesisHash } = useParams<FormattedAddressState>();
  const formatted = useFormatted(address);
  const [{ account, newFormattedAddress, newGenesisHash, prefix, type }, setRecoded] = useState<Recoded>(defaultRecoded);
  const chain = useMetadata(genesisHash, true);

  const [newChain, setNewChain] = useState<Chain | null>(chain);
  const genesisOptions = useGenesisHashOptions();

  const genesis = newChain?.genesisHash ?? chain?.genesisHash;
  const endpointOptions = useEndpoints(genesis);

  const currentChain = newChain ?? chain;
  const endpoint = useEndpoint(address, currentChain);

  const [newEndpoint, setNewEndpoint] = useState<string | undefined>(endpoint);
  const api = useApi(address, state?.api);
  const availableProxiesForTransfer = useProxies(api, formatted, true, ['Any']);

  const [price, setPrice] = useState<number | undefined>();
  const accountName = useMemo((): string => state?.identity?.display || account?.name, [state, account]);
  const [balances, setBalances] = useState<DeriveBalancesAll | undefined | null>(state?.balances as DeriveBalancesAll);
  const [refresh, setRefresh] = useState<boolean | undefined>(false);
  const [showOthers, setShowOthers] = useState<boolean | undefined>(false);

  const chainName = (newChain?.name ?? chain?.name)?.replace(' Relay Chain', '')?.replace(' Network', '');;
  const decimal = api && api.registry.chainDecimals[0];
  const token = api && api.registry.chainTokens[0];

  const resetToDefaults = useCallback(() => {
    setBalances(undefined);
    setNewEndpoint(undefined);
    setRecoded(defaultRecoded);
    setPrice(undefined);
  }, []);

  const onRefreshClick = useCallback(() => !refresh && setRefresh(true), [refresh]);

  useEffect(() => {
    chain && getPrice(chain).then((price) => {
      console.log(`${chain?.name}  ${price}`);
      setPrice(price ?? 0);
    });
  }, [chain]);

  useEffect((): void => {
    if (!address) {
      return setRecoded(defaultRecoded);
    }

    // const account = findAccountByAddress(accounts, address);

    setRecoded(
      // (
      //   chain?.definition.chainType === 'ethereum' ||
      //   account?.type === 'ethereum'
      //   //|| (!account && givenType === 'ethereum')
      // )
      //   ? { account, newFormattedAddress: address, type: 'ethereum' }
      //   :
      recodeAddress(address, accounts, chain, settings)
    );
  }, [accounts, address, chain, settings]);

  const gotToHome = useCallback(() => {
    onAction('/');
  }, [onAction]);

  const goToAccount = useCallback(() => {
    newFormattedAddress && newGenesisHash && onAction(`/account/${newGenesisHash}/${address}/${newFormattedAddress}/`);
  }, [address, newFormattedAddress, newGenesisHash, onAction]);

  useEffect(() => {
    newChain && newGenesisHash && newFormattedAddress && goToAccount();
  }, [goToAccount, newChain, newFormattedAddress, newGenesisHash]);

  const getBalances = useCallback(() => {
    api && formatted &&
      api.derive.balances?.all(formatted).then((b) => {
        setBalances(b);
        setRefresh(false);
      }).catch(console.error);
  }, [api, formatted]);

  useEffect(() => {
    // eslint-disable-next-line no-void
    (endpoint || newEndpoint) && api && (newFormattedAddress === formatted) && String(api.genesisHash) === genesis && !balances && getBalances();
  }, [api, formatted, genesis, newEndpoint, newFormattedAddress, setBalances, getBalances, endpoint, balances]);

  useEffect(() => {
    if (refresh) {
      setBalances(null);
      // eslint-disable-next-line no-void
      // void getBalances();
    }
  }, [refresh, getBalances]);

  const _onChangeGenesis = useCallback((genesisHash?: string | null): void => {
    resetToDefaults();
    tieAccount(address, genesisHash || null).catch(console.error);
    genesisHash && getMetadata(genesisHash, true).then(setNewChain).catch((error): void => {
      console.error(error);
      setNewChain(null);
    });
  }, [address, resetToDefaults]);

  const _onChangeEndpoint = useCallback((newEndpoint?: string | undefined): void => {
    setNewEndpoint(newEndpoint);

    // eslint-disable-next-line no-void
    chainName && void updateMeta(address, prepareMetaData(chainName, 'endpoint', newEndpoint));
  }, [address, chainName]);

  const goToSend = useCallback(() => {
    if (!availableProxiesForTransfer?.length && account?.isExternal) {
      return; // Account is external and does not have any available proxy for transfer funds
    }

    history.push({
      pathname: `/send/${genesisHash}/${address}/${formatted}/`,
      state: { balances, api, price }
    });
  }, [availableProxiesForTransfer?.length, account?.isExternal, history, genesisHash, address, formatted, balances, api, price]);

  const goToReceive = useCallback(() => {
    history.push({
      pathname: `/receive/${address}/`,
      state: { pathname }
    });
  }, [history, address, pathname]);

  const goToStaking = useCallback(() => {
    history.push({
      pathname: `/staking/${address}`,
      state: { api, pathname }
    });
  }, [history, address, api, pathname]);

  const goToHistory = useCallback(() => {
    chainName && formatted && decimal && token &&
      history.push({
        pathname: `/history/${chainName}/${decimal}/${token}/${formatted}`,
        state: { pathname }
      });
  }, [chainName, formatted, decimal, token, history, pathname]);

  const identicon = (
    <Identicon
      iconTheme={chain?.icon || 'polkadot'}
      // isExternal={isExternal}
      // onCopy={_onCopy}
      prefix={chain?.ss58Format ?? 42}
      size={40}
      value={formatted}
    />
  );

  const goToOthers = useCallback(() => {
    setShowOthers(true);
  }, []);

  const OthersRow = (
    <>
      <Grid item py='5px'>
        <Grid alignItems='center' container justifyContent='space-between'>
          <Grid item sx={{ fontSize: '16px', fontWeight: 300, letterSpacing: '-0.015em', lineHeight: '36px' }} xs={3}>
            {t('Others')}
          </Grid>
          <Grid item textAlign='right' xs={1.5}>
            <IconButton
              onClick={goToOthers}
              sx={{ p: 0 }}
            >
              <ArrowForwardIosRoundedIcon sx={{ color: 'secondary.light', fontSize: '26px', stroke: '#BA2882', strokeWidth: 2 }} />
            </IconButton>
          </Grid>
        </Grid>
      </Grid>
    </>
  );

  return (
    <Motion>
      <HeaderBrand
        _centerItem={identicon}
        accountMenuInfo={{ account, chain, formatted, type }}
        noBorder
        onBackClick={gotToHome}
        paddingBottom={0}
        showAccountMenu
        showBackArrow
      />
      <Container disableGutters sx={{ px: '15px' }}>
        <AccountBrief accountName={accountName} address={address} formatted={formatted} isHidden={account?.isHidden} theme={theme} />
        <Grid alignItems='flex-end' container pt='10px'>
          <DropdownWithIcon
            defaultValue={genesisHash}
            icon={getLogo(newChain || chain || undefined)}
            label={t<string>('Chain')}
            onChange={_onChangeGenesis}
            options={genesisOptions}
            style={{ width: '100%' }}
          />
        </Grid>
        <Grid height='20px' item mt='10px' xs>
          {(newEndpoint || endpoint) &&
            <Select
              label={'Remote node'}
              onChange={_onChangeEndpoint}
              options={endpointOptions}
              value={newEndpoint || endpoint}
            />
          }
        </Grid>
        <Grid item pt='50px' xs>
          <LabelBalancePrice api={api} balances={balances} label={'Total'} price={price} />
          <LabelBalancePrice api={api} balances={balances} label={'Available'} price={price} />
          <LabelBalancePrice api={api} balances={balances} label={'Reserved'} price={price} />
          {OthersRow}
        </Grid>
        <Grid
          container
          justifyContent='space-around'
          sx={{
            borderTop: '2px solid',
            borderTopColor: 'secondary.main',
            bottom: 0,
            left: '4%',
            position: 'absolute',
            py: '10px',
            width: '92%'
          }}
        >
          <HorizontalMenuItem
            divider
            icon={
              <FontAwesomeIcon
                color={(!availableProxiesForTransfer?.length && account?.isExternal) ? 'grey' : theme.palette.mode === 'dark' ? 'white' : 'black'}
                icon={faPaperPlane}
                size='lg'
              />
            }
            onClick={goToSend}
            title={t<string>('Send')}
          />
          <HorizontalMenuItem
            divider
            icon={<vaadin-icon icon='vaadin:qrcode' style={{ height: '28px', color: `${theme.palette.text.primary}`, m: 'auto' }} />}
            onClick={goToReceive}
            title={t<string>('Receive')}
          />
          <HorizontalMenuItem
            divider
            icon={<vaadin-icon icon='vaadin:coin-piles' style={{ height: '28px', color: `${theme.palette.text.primary}` }} />}
            onClick={goToStaking}
            title={t<string>('Stake')}
          />
          <HorizontalMenuItem
            divider
            icon={
              <FontAwesomeIcon
                color={theme.palette.mode === 'dark' ? 'white' : 'black'}
                icon={faHistory}
                size='lg'
              />}
            onClick={goToHistory}
            title={t<string>('History')}
          />
          <HorizontalMenuItem
            icon={
              <FontAwesomeIcon
                color={theme.palette.mode === 'dark' ? 'white' : 'black'}
                icon={faRefresh}
                size='lg'
                spin={refresh}
              />}
            onClick={onRefreshClick}
            title={t<string>('Refresh')}
          />
        </Grid>
      </Container>
      {showOthers && balances && chain && api &&
        <Others
          account={account}
          api={api}
          balances={balances}
          chain={chain}
          price={price}
          show={showOthers}
          setShow={setShowOthers}
          formatted={formatted}
        />
      }
    </Motion>
  );
}
