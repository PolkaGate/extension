// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component 
 * */

import '@vaadin/icons';

import type { ApiPromise } from '@polkadot/api';
import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { AccountJson, AccountWithChildren } from '@polkadot/extension-base/background/types';
import type { SettingsStruct } from '@polkadot/ui-settings/types';
import type { KeypairType } from '@polkadot/util-crypto/types';
import type { ThemeProps } from '../../../../extension-ui/src/types';

import { faHistory, faPaperPlane, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon } from '@mui/icons-material';
import { Container, Divider, Grid, IconButton, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory, useLocation } from 'react-router-dom';

import { Chain } from '@polkadot/extension-chains/types';
import { BN } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { AccountContext, ActionContext, ChainLogo, Header, Identicon, Motion, Select, SettingsContext, ShowBalance } from '../../components';
import { useApi, useEndpoint, useEndpoints, useGenesisHashOptions, useMetadata, useTranslation } from '../../hooks';
import { getMetadata, tieAccount, updateMeta } from '../../messaging';// added for plus, updateMeta
import { getPrice } from '../../util/api/getPrice';
import { DEFAULT_TYPE } from '../../util/defaultType';
import { FormattedAddressState } from '../../util/types';
import { prepareMetaData } from '../../util/utils';// added for plus
import AccountBrief from './AccountBrief';

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
  const location = useLocation();
  const { accounts } = useContext(AccountContext);
  const { address, formatted, genesisHash } = useParams<FormattedAddressState>();
  const [{ account, newFormattedAddress, newGenesisHash, prefix, type }, setRecoded] = useState<Recoded>(defaultRecoded);
  const chain = useMetadata(genesisHash, true);

  const [newChain, setNewChain] = useState<Chain | null>(chain);
  const genesisOptions = useGenesisHashOptions();

  const genesis = newChain?.genesisHash ?? chain?.genesisHash;
  const endpointOptions = useEndpoints(genesis);

  const currentChain = newChain ?? chain;
  const endpoint = useEndpoint(address, currentChain);

  const [newEndpoint, setNewEndpoint] = useState<string | undefined>(endpoint);
  const api = useApi(newEndpoint);

  const [apiToUse, setApiToUse] = useState<ApiPromise | undefined>(location?.state?.api);
  const [price, setPrice] = useState<number | undefined>();
  const accountName = useMemo((): string => location?.state?.identity?.display || account?.name, [location, account]);
  const [balances, setBalances] = useState<DeriveBalancesAll | undefined>(location?.state?.balances as DeriveBalancesAll);
  const chainName = (newChain?.name ?? chain?.name)?.replace(' Relay Chain', '');

  useEffect(() => {
    api && setApiToUse(api);
  }, [api]);

  const resetToDefaults = () => {
    setBalances(undefined);
    setNewEndpoint(undefined);
    setRecoded(defaultRecoded);
    setPrice(undefined);
  };

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

  const goToAccount = useCallback(() => {
    newFormattedAddress && newGenesisHash && onAction(`/account/${newGenesisHash}/${address}/${newFormattedAddress}/`);
  }, [address, newFormattedAddress, newGenesisHash, onAction]);

  useEffect(() => {
    newChain && newGenesisHash && newFormattedAddress && goToAccount();
  }, [goToAccount, newChain, newFormattedAddress, newGenesisHash]);

  useEffect(() => {
    !newEndpoint && endpointOptions?.length && setNewEndpoint(endpointOptions[0].value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpointOptions]);

  useEffect(() => {
    // eslint-disable-next-line no-void
    newEndpoint && apiToUse && (newFormattedAddress === formatted) && String(apiToUse.genesisHash) === genesis && void apiToUse.derive.balances?.all(formatted).then((b) => {
      setBalances(b);
    });
  }, [apiToUse, formatted, genesis, newEndpoint, newFormattedAddress]);

  const _onChangeGenesis = useCallback((genesisHash?: string | null): void => {
    resetToDefaults();
    tieAccount(address, genesisHash || null).catch(console.error);
    genesisHash && getMetadata(genesisHash, true).then(setNewChain).catch((error): void => {
      console.error(error);
      setNewChain(null);
    });
  }, [address]);

  const _onChangeEndpoint = useCallback((newEndpoint?: string | undefined): void => {
    setNewEndpoint(newEndpoint);

    // eslint-disable-next-line no-void
    chainName && void updateMeta(address, prepareMetaData(chainName, 'endpoint', newEndpoint));
  }, [address, chainName]);

  const goToSend = useCallback(() => {
    balances && history.push({
      pathname: `/send/${genesisHash}/${address}/${formatted}/`,
      state: { balances, api: apiToUse }
    });
  }, [balances, history, genesisHash, address, formatted, apiToUse]);

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

  const MenuItem = ({ icon, noDivider = false, onClick, title }: { icon: any, title: string, noDivider?: boolean, onClick: () => void }) => (
    <>
      <Grid container direction='column' item justifyContent='center' xs={2} mt='5px'>
        <Grid item width='27px'>
          <IconButton
            onClick={onClick}
            sx={{ alignSelf: 'center', transform: 'scale(0.9)', py: 0 }}
          >
            {icon}
          </IconButton>
        </Grid>
        <Grid item textAlign='center'>
          <Typography sx={{ fontSize: '12px', fontWeight: 300, letterSpacing: '-0.015em' }}>
            {title}
          </Typography>
        </Grid>
      </Grid>
      {!noDivider &&
        <Grid alignItems='center' item justifyContent='center' mx='10px'>
          <Divider orientation='vertical' sx={{ borderColor: 'text.primary', height: '30px', mt: '5px', width: '2px' }} />
        </Grid>
      }
    </>
  );

  const Menu = () => (
    <Grid container flexWrap='nowrap' item>
      <MenuItem
        icon={
          <FontAwesomeIcon
            icon={faPaperPlane}
            // onClick={goToSend}
            size='lg'
            color={theme.palette.mode === 'dark' ? 'white' : 'black'}
          />
        }
        title={'Send'}
        onClick={goToSend}
      />
      <MenuItem
        icon={<vaadin-icon icon='vaadin:qrcode' style={{ height: '28px', color: `${theme.palette.text.primary}` }} />
        }
        title={'Receive'}
        onClick={goToSend}
      />
      <MenuItem
        icon={<vaadin-icon icon='vaadin:coin-piles' style={{ height: '28px', color: `${theme.palette.text.primary}` }} />}
        title={'Stake'}
        onClick={goToSend}
      />
      <MenuItem
        icon={
          <FontAwesomeIcon
            icon={faHistory}
            // onClick={goToSend}
            size='lg'
            color={theme.palette.mode === 'dark' ? 'white' : 'black'}
          />
        }
        title={'History'}
        onClick={goToSend}
      />
      <MenuItem
        icon={
          <FontAwesomeIcon
            icon={faRefresh}
            // onClick={goToSend}
            size='lg'
            color={theme.palette.mode === 'dark' ? 'white' : 'black'}
          />
        }
        title={'Refresh'}
        onClick={goToSend}
        noDivider
      />
    </Grid>
  );

  const Balance = ({ balances, type }: { type: string, balances: DeriveBalancesAll | undefined }) => {
    let value: BN | undefined;

    if (type === 'Total' && balances) {
      value = balances.freeBalance.add(balances.reservedBalance);
    }

    if (type === 'Available' && balances) {
      value = balances.availableBalance;
    }

    if (type === 'Reserved' && balances) {
      value = balances.reservedBalance;
    }

    if (type === 'Others' && balances) {
      value = balances.lockedBalance.add(balances.vestingTotal);
    }

    const balanceInUSD = price && value && apiToUse && Number(value) / (10 ** apiToUse.registry.chainDecimals[0]) * price;

    return (
      <>
        <Grid item py='5px'>
          <Grid alignItems='center' container justifyContent='space-between'>
            <Grid item xs={3}>
              <Typography sx={{ fontSize: '16px', fontWeight: 300, letterSpacing: '-0.015em', lineHeight: '36px' }}>
                {type}
              </Typography>
            </Grid>
            <Grid container direction='column' item justifyContent='flex-end' xs>
              <Grid item textAlign='right'>
                <Typography sx={{ fontSize: '20px', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: '20px' }}>
                  <ShowBalance api={apiToUse} balance={value} />
                </Typography>
              </Grid>
              <Grid item pt='6px' textAlign='right'>
                <Typography sx={{ fontSize: '16px', fontWeight: 400, letterSpacing: '-0.015em', lineHeight: '15px' }}>
                  {balanceInUSD !== undefined
                    ? `$${Number(balanceInUSD)?.toLocaleString()}`
                    : <Skeleton sx={{ display: 'inline-block', fontWeight: 'bold', width: '70px' }} />
                  }
                </Typography>
              </Grid>
            </Grid>
            {type === 'Others' &&
              <Grid item textAlign='right' xs={1.5}>
                <IconButton
                  // onClick={_onClick}
                  sx={{ p: 0 }}
                >
                  <ArrowForwardIosRoundedIcon sx={{ color: 'secondary.light', fontSize: '24px', stroke: '#BA2882', strokeWidth: 2 }} />
                </IconButton>
              </Grid>
            }
          </Grid>
        </Grid>
        <Divider sx={{ bgcolor: 'secondary.main', height: type === 'Others' ? '2px' : '1px', my: '5px' }} />
      </>
    );
  };

  return (
    <Motion>
      <Container disableGutters sx={{ px: '15px' }}>
        <Header icon={identicon}>
          <AccountBrief accountName={accountName} address={address} formatted={formatted} isHidden={account?.isHidden} theme={theme} />
        </Header>
        <Grid alignItems='flex-end' container pt='15px'>
          <Grid item xs>
            <Select defaultValue={genesisHash} label={'Select the chain'} onChange={_onChangeGenesis} options={genesisOptions} />
          </Grid>
          <Grid item pl={1}>
            <ChainLogo genesisHash={newChain?.genesisHash ?? chain?.genesisHash} size={31} />
          </Grid>
        </Grid>
        <Grid height='20px' item xs mt='10px'>
          {newEndpoint && <Select defaultValue={newEndpoint} label={'Select the endpoint'} onChange={_onChangeEndpoint} options={endpointOptions} />}
        </Grid>
        <Grid item pt='50px' xs>
          <Balance balances={balances} type={'Total'} />
          <Balance balances={balances} type={'Available'} />
          <Balance balances={balances} type={'Reserved'} />
          <Balance balances={balances} type={'Others'} />
        </Grid>
        <Menu />
      </Container>
    </Motion>

  );
}
