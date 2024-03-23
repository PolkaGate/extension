// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable react/jsx-max-props-per-line */

import { ArrowForwardIos as ArrowForwardIosIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { Box, Button, Divider, Grid, IconButton, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';
import { BN } from '@polkadot/util';

import { stars6Black, stars6White } from '../../../assets/icons';
import { ActionContext, Identicon, Identity, Infotip, ShortAddress2 } from '../../../components';
import { nFormatter } from '../../../components/FormatPrice';
import { useAccount, useCurrency, usePrices3, useTranslation } from '../../../hooks';
import { FetchedBalance } from '../../../hooks/useAssetsBalances';
import { showAccount, tieAccount } from '../../../messaging';
import ExportAccountModal from '../../../popup/export/ExportAccountModal';
import ForgetAccountModal from '../../../popup/forgetAccount/ForgetAccountModal';
import DeriveAccountModal from '../../../popup/newAccount/deriveAccount/modal/DeriveAccountModal';
import RenameModal from '../../../popup/rename/RenameModal';
import { BalancesInfo } from '../../../util/types';
import { amountToHuman } from '../../../util/utils';
import AccountIcons from '../../accountDetailsFullScreen/components/AccountIcons';
import AOC from '../../accountDetailsFullScreen/components/AOC';
import FullScreenAccountMenu from './FullScreenAccountMenu';

interface AddressDetailsProps {
  accountAssets: FetchedBalance[] | null | undefined;
  address: string | undefined;
  api: ApiPromise | undefined;
  selectedAsset: FetchedBalance | undefined;
  balances: BalancesInfo | undefined;
  chain: Chain | null | undefined;
  chainName: string | undefined;
  formatted: string | undefined;
  hideNumbers: boolean | undefined
  setSelectedAsset: React.Dispatch<React.SetStateAction<FetchedBalance | undefined>>;
  isChild?: boolean;
}

type AccountButtonType = { text: string, onClick: () => void, icon: React.ReactNode };

export const POPUPS_NUMBER = {
  DERIVE_ACCOUNT: 4,
  EXPORT_ACCOUNT: 3,
  FORGET_ACCOUNT: 1,
  RENAME: 2
};

export default function AccountInformation ({ accountAssets, address, api, balances, chain, chainName, formatted, hideNumbers, isChild, selectedAsset, setSelectedAsset }: AddressDetailsProps): React.ReactElement {
  const { t } = useTranslation();
  const pricesInCurrencies = usePrices3();
  const currency = useCurrency();
  const account = useAccount(address);
  const theme = useTheme();
  const onAction = useContext(ActionContext);

  const [balanceToShow, setBalanceToShow] = useState<BalancesInfo>();
  const [displayPopup, setDisplayPopup] = useState<number>();

  const calculatePrice = useCallback((amount: BN, decimal: number, price: number) => parseFloat(amountToHuman(amount, decimal)) * price, []);

  const assetsToShow = useMemo(() => {
    if (!accountAssets || !pricesInCurrencies) {
      return accountAssets; // null  or undefined
    } else {
      return accountAssets.sort((a, b) => calculatePrice(b.totalBalance, b.decimal, pricesInCurrencies.prices?.[b.priceId]?.value ?? 0) - calculatePrice(a.totalBalance, a.decimal, pricesInCurrencies.prices?.[a.priceId]?.value ?? 0));
    }
  }, [accountAssets, calculatePrice, pricesInCurrencies]);

  const totalBalance = useMemo(() => {
    if (accountAssets && pricesInCurrencies && currency) {
      const t = accountAssets.reduce((accumulator, { decimal, priceId, totalBalance }) => (accumulator + calculatePrice(totalBalance, decimal, pricesInCurrencies.prices?.[priceId]?.value ?? 0)), 0);

      return t;
    } else if (accountAssets === null) {
      return 0;
    }

    return undefined;
    /** we need currency as a dependency to update balance by changing currency*/
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountAssets, calculatePrice, currency, pricesInCurrencies]);

  useEffect(() => {
    if (balances?.chainName === chainName) {
      return setBalanceToShow(balances);
    }

    setBalanceToShow(undefined);
  }, [balances, chainName]);

  const AccountTotal = () => (
    <Grid alignItems='center' container item xs>
      <Grid alignItems='center' container gap='15px' item justifyContent='center' width='fit-content'>
        <Typography fontSize='16px' fontWeight={400} pl='15px'>
          {t('Total')}:
        </Typography>
        {
          hideNumbers || hideNumbers === undefined
            ? <Box component='img' src={(theme.palette.mode === 'dark' ? stars6White : stars6Black) as string} sx={{ height: '36px', width: '154px' }} />
            : totalBalance !== undefined
              ? <Typography fontSize='32px' fontWeight={700}>
                {`${currency?.sign ?? ''}${nFormatter(totalBalance ?? 0, 2)}`}
              </Typography>
              : <Skeleton animation='wave' height={22} sx={{ my: '2.5px', transform: 'none' }} variant='text' width={180} />
        }
      </Grid>
    </Grid>
  );

  const AccountButton = ({ icon, onClick, text }: AccountButtonType) => (
    <Button endIcon={icon} onClick={onClick} sx={{ '&:hover': { bgcolor: 'divider' }, color: theme.palette.secondary.main, fontSize: '16px', fontWeight: 400, height: '53px', textTransform: 'none', width: 'fit-content' }} variant='text'>
      {text}
    </Button>
  );

  const onAssetBoxClicked = useCallback((asset: FetchedBalance | undefined) => {
    address && asset && tieAccount(address, asset.genesisHash).finally(() => {
      setSelectedAsset(asset);
    }).catch(console.error);
  }, [address, setSelectedAsset]);

  const toggleVisibility = useCallback((): void => {
    address && showAccount(address, account?.isHidden || false).catch(console.error);
  }, [account?.isHidden, address]);

  const openSettings = useCallback((): void => {
    address && onAction();
  }, [onAction, address]);

  const goToDetails = useCallback((): void => {
    address && onAction(`/account/${address}/`);
  }, [onAction, address]);

  return (
    <>
      <Grid alignItems='center' container item sx={{ bgcolor: 'background.paper', border: isChild ? '1px dashed' : theme.palette.mode === 'dark' ? '1px solid' : 'none', borderColor: 'secondary.light', borderRadius: '5px', p: '20px 10px 15px 30px' }}>
        <Grid container item>
          <Grid container item sx={{ borderRight: '1px solid', borderRightColor: 'divider', pr: '8px', width: 'fit-content' }}>
            <Grid container item pr='7px' sx={{ '> div': { height: 'fit-content' }, m: 'auto', width: 'fit-content' }}>
              <Identicon
                iconTheme={chain?.icon ?? 'polkadot'}
                prefix={chain?.ss58Format ?? 42}
                size={70}
                value={formatted || address}
              />
            </Grid>
            <AccountIcons
              address={address}
              api={api}
              formatted={formatted}
            />          </Grid>
          <Grid container direction='column' item sx={{ borderRight: '1px solid', borderRightColor: 'divider', px: '7px' }} xs={5.5}>
            <Grid container item justifyContent='space-between'>
              <Identity
                address={address}
                api={api}
                chain={chain}
                noIdenticon
                onClick={goToDetails}
                style={{ width: 'calc(100% - 40px)' }}
                subIdOnly
              />
              <Grid item width='40px'>
                <Infotip text={account?.isHidden && t('This account is hidden from websites')}>
                  <IconButton onClick={toggleVisibility} sx={{ height: '20px', ml: '7px', mt: '13px', p: 0, width: '28px' }}>
                    <vaadin-icon icon={account?.isHidden ? 'vaadin:eye-slash' : 'vaadin:eye'} style={{ color: `${theme.palette.secondary.light}`, height: '20px' }} />
                  </IconButton>
                </Infotip>
              </Grid>
            </Grid>
            <Grid alignItems='center' container item sx={{ '> div div:last-child': { width: 'auto' } }} xs>
              <ShortAddress2 address={formatted || address} charsCount={40} showCopy style={{ fontSize: '10px', fontWeight: 300 }} />
            </Grid>
          </Grid>
          <AccountTotal />
        </Grid>
        <Grid container item justifyContent='flex-end' minHeight='50px'>
          <Divider sx={{ bgcolor: 'divider', height: '1px', mr: '5px', my: '15px', width: '100%' }} />
          <Grid container item xs>
            {(assetsToShow === undefined || (assetsToShow && assetsToShow?.length > 0)) &&
              <AOC
                account={account}
                accountAssets={assetsToShow}
                api={api}
                balanceToShow={balanceToShow}
                mode='Home'
                onclick={onAssetBoxClicked}
                selectedAsset={selectedAsset}
              />
            }
          </Grid>
          <Grid alignItems='center' container item width='fit-content'>
            <Divider orientation='vertical' sx={{ bgcolor: 'divider', height: '34px', ml: 0, mr: '10px', my: 'auto', width: '1px' }} />
            <FullScreenAccountMenu
              address={address}
              baseButton={
                <AccountButton icon={<MoreVertIcon style={{ color: theme.palette.secondary.light, fontSize: '32px' }} />} onClick={openSettings} text={t<string>('Settings')} />
              }
              setDisplayPopup={setDisplayPopup}
            />
            <Divider orientation='vertical' sx={{ bgcolor: 'divider', height: '34px', ml: '5px', mr: '15px', my: 'auto', width: '1px' }} />
            <AccountButton icon={<ArrowForwardIosIcon style={{ color: theme.palette.secondary.light, fontSize: '28px' }} />} onClick={goToDetails} text={t<string>('Details')} />
          </Grid>
        </Grid>
      </Grid>
      {displayPopup === POPUPS_NUMBER.FORGET_ACCOUNT && account &&
        <ForgetAccountModal
          account={account}
          setDisplayPopup={setDisplayPopup}
        />
      }
      {displayPopup === POPUPS_NUMBER.DERIVE_ACCOUNT && address &&
        <DeriveAccountModal
          parentAddress={address}
          setDisplayPopup={setDisplayPopup}
        />
      }
      {displayPopup === POPUPS_NUMBER.RENAME && address &&
        <RenameModal
          address={address}
          setDisplayPopup={setDisplayPopup}
        />
      }
      {displayPopup === POPUPS_NUMBER.EXPORT_ACCOUNT && address &&
        <ExportAccountModal
          address={address}
          setDisplayPopup={setDisplayPopup}
        />
      }
    </>
  );
}
