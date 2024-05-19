// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faSquare, faSquareCheck } from '@fortawesome/free-regular-svg-icons';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Checkbox, FormControlLabel, Grid, Skeleton, SxProps, Theme, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo } from 'react';

import { ApiPromise } from '@polkadot/api';
import { Chain } from '@polkadot/extension-chains/types';

import { Identity, Label, Progress } from '../../../components';
import { useIsExtensionPopup, useTranslation } from '../../../hooks';

interface Props {
  api: ApiPromise | undefined;
  chain: Chain | undefined;
  label: string;
  style?: SxProps<Theme>;
  maxHeight?: string;
  minHeight?: string;
  proxiedAccounts: string[] | null | undefined;
  selectedProxied: string[];
  setSelectedProxied: React.Dispatch<React.SetStateAction<string[]>>
}

export default function ProxiedTable ({ api, chain, label, maxHeight = '120px', minHeight = '70px', proxiedAccounts, selectedProxied, setSelectedProxied, style }: Props): React.ReactElement {
  const { t } = useTranslation();
  const isExtensionMode = useIsExtensionPopup();
  const theme = useTheme();

  const isDarkMode = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode]);

  // const isAvailable = useCallback((proxy: Proxy): NameAddress | undefined =>
  //   accounts?.find((a) => a.address === getSubstrateAddress(proxy.delegate) && (proxyTypeFilter ? proxyTypeFilter.includes(proxy.proxyType) : true))
  //   , [accounts, proxyTypeFilter]);

  const handleSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const proxied = proxiedAccounts && proxiedAccounts[Number(event.target.value)];
    const alreadyAdded = selectedProxied.includes(proxied as string);

    if (proxied && alreadyAdded) {
      setSelectedProxied(selectedProxied.filter((selected) => selected !== proxied));
    } else if (proxied && !alreadyAdded) {
      setSelectedProxied([...selectedProxied, proxied]);
    }
  }, [proxiedAccounts, selectedProxied, setSelectedProxied]);

  const Select = ({ index, proxied }: { proxied: string, index: number }) => (
    <FormControlLabel
      checked={selectedProxied.includes(proxied)}
      control={
        <Checkbox
          onChange={handleSelect}
          size='medium'
          sx={{ '&.Mui-disabled': { color: 'text.disabled' }, color: 'secondary.main' }}
          value={index}
        />
      }
      label=''
      sx={{ m: 'auto' }}
      value={index}
    />
  );

  const onSelect = useCallback((selectAll: boolean) => () => {
    proxiedAccounts && setSelectedProxied(selectAll ? proxiedAccounts : []);
  }, [proxiedAccounts, setSelectedProxied]);

  const SelectDeselectButton = ({ allSelected, disable }: { allSelected: boolean, disable?: boolean }) => (
    <Button
      disabled={disable}
      endIcon={
        <FontAwesomeIcon
          color={theme.palette.secondary.light}
          fontSize='20px'
          icon={allSelected ? faSquare : faSquareCheck}
        />
      }
      onClick={onSelect(!allSelected)}
      style={{ color: theme.palette.text.primary, textDecoration: 'underline' }}
      sx={{ '&:hover': { bgcolor: 'unset' }, '&:onclick': { bgcolor: 'unset' }, '> span': { mr: 0 }, fontSize: '14px', fontWeight: 400, p: 0, textTransform: 'none', width: 'fit-content' }}
      variant='text'
    >
      {allSelected ? t('Deselect') : t('Select all')}
    </Button>
  );

  // const fade = (toCheck: ProxyItem) => {
  //   if (mode === 'Delete') {
  //     return (toCheck.status === 'remove');
  //   }

  //   if (mode === 'Availability' || mode === 'Select') {
  //     return !(isAvailable(toCheck.proxy));
  //   }

  //   return false;
  // };

  return (
    <Grid container item sx={{ ...style }}>
      <Label label={label} style={{ fontWeight: isExtensionMode ? 300 : 400, position: 'relative', width: '100%' }}>
        <Grid container direction='column' item sx={{ '> div:not(:last-child:not(:only-child))': { borderBottom: '1px solid', borderBottomColor: 'secondary.light' }, bgcolor: 'background.paper', border: isExtensionMode || isDarkMode ? '1px solid' : 'none', borderColor: 'secondary.light', borderRadius: isExtensionMode ? '5px' : '0px', boxShadow: !isExtensionMode && !isDarkMode ? 'rgba(0, 0, 0, 0.1) 2px 3px 4px 0px' : 'none', display: 'block', maxHeight, minHeight, overflowY: 'scroll', textAlign: 'center' }}>
          <Grid container item sx={{ '> div:not(:last-child)': { borderRight: '1px solid', borderRightColor: 'secondary.light' }, textAlign: 'center' }}>
            <Grid container item xs={isExtensionMode ? 10 : 11}>
              <Typography fontSize={isExtensionMode ? '12px' : '14px'} fontWeight={isExtensionMode ? 300 : 400} lineHeight={isExtensionMode ? '25px' : '35px'} pl='20px'>
                {t('Account')}
              </Typography>
            </Grid>
            <Grid container item xs={isExtensionMode ? 2 : 1}>
              <Typography fontSize={isExtensionMode ? '12px' : '14px'} fontWeight={isExtensionMode ? 300 : 400} lineHeight={isExtensionMode ? '25px' : '35px'} sx={{ textAlign: 'center', width: '100%' }}>
                {t('Select')}
              </Typography>
            </Grid>
          </Grid>
          {proxiedAccounts === undefined &&
            <Grid alignItems='center' container justifyContent='center'>
              <Progress gridSize={isExtensionMode ? 50 : 90} pt={isExtensionMode ? '10px' : '20px'} title={t('Looking for proxied accounts ...')} type='grid' />
            </Grid>
          }
          {(proxiedAccounts === null || (proxiedAccounts && proxiedAccounts.length === 0)) &&
            <Grid display='inline-flex' p='10px'>
              <FontAwesomeIcon className='warningImage' icon={faExclamationTriangle} />
              <Typography fontSize={isExtensionMode ? '12px' : '16px'} fontWeight={400} lineHeight='20px' pl='8px'>
                {t('This isn\'t a proxy account on {{chainName}}!', { replace: { chainName: chain?.name } })}
              </Typography>
            </Grid>
          }
          {proxiedAccounts && proxiedAccounts.length > 0 && proxiedAccounts.map((proxiedAccount, index) =>
            <Grid container item key={index} sx={{ '> div:not(:last-child)': { borderRight: '1px solid', borderRightColor: 'secondary.light' }, height: isExtensionMode ? '41px' : '50px', textAlign: 'center' }}>
              <Grid alignItems='center' container item justifyContent='left' pl='10px' xs={isExtensionMode ? 10 : 11}>
                <Identity api={api} chain={chain} formatted={proxiedAccount} identiconSize={25} showShortAddress showSocial={false} style={{ fontSize: isExtensionMode ? '12px' : '16px', maxWidth: '100%' }} subIdOnly />
              </Grid>
              <Grid alignItems='center' container height='100%' item justifyContent='center' xs={isExtensionMode ? 2 : 1}>
                <Select index={index} proxied={proxiedAccount} />
              </Grid>
            </Grid>
          )}
        </Grid>
      </Label>
      <Grid container item justifyContent='space-between' p='5px 10px 0'>
        {proxiedAccounts
          ? <Typography fontSize='14px' fontWeight={400}>
            {t('{{selectedCount}} of {{proxiedCount}} is selected', { replace: { proxiedCount: proxiedAccounts.length, selectedCount: selectedProxied.length } })}
          </Typography>
          : <Skeleton animation='wave' height='30px' width='100px' />
        }
        <SelectDeselectButton allSelected={selectedProxied.length === proxiedAccounts?.length} disable={!proxiedAccounts} />
      </Grid>
    </Grid>
  );
}
