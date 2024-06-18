// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useLayoutEffect, useState } from 'react';

import { selectableNetworks } from '@polkadot/networks';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { PButton, Select, ShortAddress } from '../components';
import { useChain, useGenesisHashOptions, useTranslation } from '../hooks';

interface Props {
  address: string | undefined;
  setAnchorEl: (value: React.SetStateAction<HTMLButtonElement | null>) => void;
}

function OptionalCopyPopup({ address, setAnchorEl }: Props): React.ReactElement {
  const { t } = useTranslation();
  const chain = useChain(address);
  const options = useGenesisHashOptions();

  const [defaultAddress, setDefaultAddress] = useState<string | undefined>(address);
  const [formattedAddress, setFormattedAddress] = useState<string | undefined>();
  const [selectedNetwork, setSelectedNetwork] = useState<string | undefined>();
  const [copied, setCopied] = useState<boolean>(false);

  const formatAddress = useCallback((prefix: number) => {
    const publicKey = decodeAddress(address);
    const formatted = encodeAddress(publicKey, prefix);

    return formatted;
  }, [address]);

  useLayoutEffect(() => {
    const formatted = formatAddress(chain?.ss58Format ?? 42);

    setDefaultAddress(formatted);
  }, [chain?.ss58Format, formatAddress]);

  const onCopy = useCallback(() => {
    if (formattedAddress || defaultAddress) {
      setCopied(true);
      navigator.clipboard.writeText(formattedAddress ?? defaultAddress ?? address ?? '').catch((err) => console.error('Error copying text: ', err));
      setTimeout(() => setAnchorEl(null), 300);
    }
  }, [address, defaultAddress, formattedAddress, setAnchorEl]);

  const onChangeNetwork = useCallback((value: string) => {
    setSelectedNetwork(value);
    const _selectedNetwork = selectableNetworks.find(({ genesisHash }) => genesisHash.includes(value));
    const prefix = _selectedNetwork?.prefix;

    const formatted = formatAddress(prefix ?? 42);

    setFormattedAddress(formatted);
  }, [formatAddress]);

  return (
    <Grid container item sx={{ bgcolor: 'background.paper', borderRadius: '10px', p: '10px 20px', width: '320px' }}>
      <Typography fontSize='14px' fontWeight={400} pb='15px' textAlign='left'>
        {t('Each blockchain has its own address format. Choose one to view and copy.')}
      </Typography>
      <Select
        defaultValue={chain?.genesisHash ?? options[0].text}
        isDisabled={!address}
        label={t('Select chain')}
        onChange={onChangeNetwork}
        options={options}
        showLogo
        value={selectedNetwork}
      />
      <Grid container item sx={{ bgcolor: 'divider', borderRadius: '5px', my: '15px', p: '5px 10px' }}>
        <ShortAddress address={formattedAddress ?? defaultAddress} charsCount={12} />
      </Grid>
      <PButton
        _ml={0}
        _mt='1px'
        _onClick={onCopy}
        _width={100}
        disabled={copied}
        text={copied
          ? t('Copied')
          : t('Copy address')}
      />
    </Grid>
  );
}

export default React.memo(OptionalCopyPopup);
