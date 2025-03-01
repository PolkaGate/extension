// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable react/jsx-max-props-per-line */

import type { BalancesInfo } from '@polkadot/extension-polkagate/util/types';
import type { HexString } from '@polkadot/util/types';
import type { FetchedBalance } from '../../../hooks/useAssetsBalances';
import type { ItemInformation } from '../../nft/utils/types';

import { ArrowForwardIos as ArrowForwardIosIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { Box, Button, Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { getValue } from '@polkadot/extension-polkagate/src/popup/account/util';
import { type BN, noop } from '@polkadot/util';

import { stars5Black, stars5White } from '../../../assets/icons';
import NftManager from '../../../class/nftManager';
import FormatPrice from '../../../components/FormatPrice';
import { useAccount, useCurrency, useIsHideNumbers, usePrices, useTranslation } from '../../../hooks';
import { tieAccount } from '../../../messaging';
import { amountToHuman } from '../../../util/utils';
import AOC from '../../accountDetails/components/AOC';
import { openOrFocusTab } from '../../accountDetails/components/CommonTasks';
import NftGrouped from '../../accountDetails/components/NftGrouped';
import DeriveAccountModal from '../../partials/DeriveAccountModal';
import ExportAccountModal from '../../partials/ExportAccountModal';
import ForgetAccountModal from '../../partials/ForgetAccountModal';
import RenameModal from '../../partials/RenameAccountModal';
import AccountBodyFs from './AccountBodyFs';
import AccountIdenticonIconsFS from './AccountIdenticonIconsFS';
import FullScreenAccountMenu from './FullScreenAccountMenu';

interface AddressDetailsProps {
  accountAssets: FetchedBalance[] | null | undefined;
  address: string | undefined;
  selectedAsset: FetchedBalance | undefined;
  setSelectedAsset: React.Dispatch<React.SetStateAction<FetchedBalance | undefined>>;
  isChild?: boolean;
}

interface AccountButtonType {
  text: string;
  onClick: () => void;
  icon: React.ReactNode;
  collapse?: boolean;
}

export enum POPUPS_NUMBER {
  DERIVE_ACCOUNT,
  EXPORT_ACCOUNT,
  FORGET_ACCOUNT,
  RENAME,
  MANAGE_PROFILE
}

const AccountButton = ({ collapse = false, icon, onClick, text }: AccountButtonType) => {
  const theme = useTheme();

  const collapsedStyle = collapse
    ? {
      '&:first-child': { '> span': { m: 0 }, m: '0px', minWidth: '48px' },
      '> span': { m: 0 }
    }
    : {};

  return (
    <Button
      endIcon={icon}
      onClick={onClick}
      sx={{ ...collapsedStyle, '&:hover': { bgcolor: 'divider' }, color: theme.palette.secondary.light, fontSize: '16px', fontWeight: 400, height: '53px', minWidth: '48px', textTransform: 'none', width: 'fit-content' }}
      variant='text'
    >
      {collapse ? '' : text}
    </Button>
  );
};

const AccountTotal = ({ hideNumbers, totalBalance }: { hideNumbers: boolean | undefined, totalBalance: number | undefined }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Grid alignItems='center' container item xs>
      <Grid alignItems='center' container gap='15px' item justifyContent='center' width='fit-content'>
        <Typography color='secondary.contrastText' fontSize='16px' fontWeight={400} pl='15px'>
          {t('Balance')}:
        </Typography>
        {
          hideNumbers || hideNumbers === undefined
            ? <Box component='img' src={(theme.palette.mode === 'dark' ? stars5White : stars5Black) as string} sx={{ height: '19px', width: '110px' }} />
            : <FormatPrice
              commify
              fontSize='21px'
              fontWeight={700}
              num={totalBalance}
              skeletonHeight={28}
              width='180px'
              withSmallDecimal
            />
        }
      </Grid>
    </Grid>
  );
};

function AccountInformationForHome({ accountAssets, address, isChild, selectedAsset, setSelectedAsset }: AddressDetailsProps): React.ReactElement {
  const nftManager = useMemo(() => new NftManager(), []);

  const { t } = useTranslation();
  const theme = useTheme();
  const pricesInCurrencies = usePrices();
  const currency = useCurrency();
  const account = useAccount(address);
  const { isHideNumbers } = useIsHideNumbers();

  const [displayPopup, setDisplayPopup] = useState<number>();
  const [myNfts, setNfts] = useState<ItemInformation[] | null | undefined>();

  useEffect(() => {
    if (!address) {
      return;
    }

    // Handle updates after initialization
    const handleNftUpdate = (updatedAddress: string, updatedNfts: ItemInformation[]) => {
      if (updatedAddress === address) {
        setNfts(updatedNfts);
      }
    };

    // Waits for initialization
    nftManager.waitForInitialization()
      .then(() => {
        setNfts(nftManager.get(address));
      })
      .catch(console.error);

    // subscribe to the possible nft items for the account
    nftManager.subscribe(handleNftUpdate);

    // Cleanup
    return () => {
      nftManager.unsubscribe(handleNftUpdate);
    };
  }, [address, nftManager]);

  const calculatePrice = useCallback((amount: BN, decimal: number, price: number) => parseFloat(amountToHuman(amount, decimal)) * price, []);

  const assetsToShow = useMemo(() => {
    if (!accountAssets || !pricesInCurrencies) {
      return accountAssets; // null  or undefined
    } else {
      const sortedAssets = accountAssets.sort((a, b) => calculatePrice(b.totalBalance, b.decimal, pricesInCurrencies.prices?.[b.priceId]?.value ?? 0) - calculatePrice(a.totalBalance, a.decimal, pricesInCurrencies.prices?.[a.priceId]?.value ?? 0));

      return sortedAssets.filter((_asset) => !getValue('total', _asset as unknown as BalancesInfo)?.isZero());
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

  const onAssetBoxClicked = useCallback((asset: FetchedBalance | undefined) => {
    address && asset && tieAccount(address, asset.genesisHash as HexString).finally(() => {
      setSelectedAsset(asset);
    }).catch(console.error);
  }, [address, setSelectedAsset]);

  const goToDetails = useCallback((): void => {
    address && openOrFocusTab(`/accountfs/${address}/${selectedAsset?.assetId || '0'}`, true);
  }, [address, selectedAsset?.assetId]);

  return (
    <>
      <Grid alignItems='center' container item sx={{ bgcolor: 'background.paper', border: isChild ? '0.1px dashed' : 'none', borderColor: 'secondary.main', borderRadius: '5px', p: '20px 10px 15px 30px' }}>
        <Grid container item>
          <AccountIdenticonIconsFS
            address={address}
          />
          <AccountBodyFs
            address={address}
            goToDetails={goToDetails}
            gridSize={5.6}
          />
          <AccountTotal
            hideNumbers={isHideNumbers}
            totalBalance={totalBalance}
          />
        </Grid>
        <Grid container item justifyContent='flex-end' minHeight='50px'>
          <Divider sx={{ bgcolor: 'divider', height: '1px', mr: '5px', my: '15px', width: '100%' }} />
          <Grid container item xs>
            <Grid container item xs>
              {(assetsToShow === undefined || (assetsToShow && assetsToShow?.length > 0)) &&
                <AOC
                  accountAssets={assetsToShow}
                  address={address}
                  hideNumbers={isHideNumbers}
                  mode='Home'
                  onclick={onAssetBoxClicked}
                  selectedAsset={selectedAsset}
                />
              }
            </Grid>
            <Grid container item width='fit-content'>
              <NftGrouped
                accountNft={myNfts}
                address={address}
              />
            </Grid>
          </Grid>
          <Grid alignItems='center' container item width='fit-content'>
            <Divider orientation='vertical' sx={{ bgcolor: 'divider', height: '34px', ml: 0, mr: '10px', mx: myNfts ? '5px' : undefined, my: 'auto', width: '1px' }} />
            <FullScreenAccountMenu
              address={address}
              baseButton={
                <AccountButton
                  collapse={!!myNfts}
                  icon={<MoreVertIcon style={{ color: theme.palette.secondary.light, fontSize: '32px' }} />}
                  onClick={noop}
                  text={t('Settings')}
                />
              }
              setDisplayPopup={setDisplayPopup}
            />
            <Divider orientation='vertical' sx={{ bgcolor: 'divider', height: '34px', ml: '5px', mr: myNfts ? '5px' : '15px', my: 'auto', width: '1px' }} />
            <AccountButton
              collapse={!!myNfts}
              icon={<ArrowForwardIosIcon style={{ color: theme.palette.secondary.light, fontSize: '28px' }} />}
              onClick={goToDetails}
              text={t('Details')}
            />
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

export default React.memo(AccountInformationForHome);
