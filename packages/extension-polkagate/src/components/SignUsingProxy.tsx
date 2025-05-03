// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Proxy, ProxyItem } from '../util/types';

import { Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import { Data } from 'iconsax-react';
import React, { useCallback, useMemo } from 'react';

import { useTranslation } from '../hooks';
import Radio from '../popup/staking/components/Radio';
import { PolkaGateIdenticon } from '../style';
import { ExtensionPopup, Identity2 } from '.';

interface ProxiesItemProps {
  proxy: ProxyItem;
  selectedProxyItem: ProxyItem;
  onSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  genesisHash: string | null | undefined;
}

const ProxiesItem = ({ genesisHash, onSelect, proxy, selectedProxyItem }: ProxiesItemProps) => {
  const isChecked = useMemo(() => (
    selectedProxyItem.proxy.delegate === proxy.proxy.delegate &&
    selectedProxyItem.proxy.proxyType === proxy.proxy.proxyType &&
    selectedProxyItem.proxy.delay === proxy.proxy.delay
  ), [proxy.proxy.delay, proxy.proxy.delegate, proxy.proxy.proxyType, selectedProxyItem.proxy.delay, selectedProxyItem.proxy.delegate, selectedProxyItem.proxy.proxyType]);

  return (
    <Container disableGutters sx={{ alignItems: 'center', border: '4px solid ##3988FF', borderRadius: '18px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', p: '16px 12px' }}>
      <Grid container item sx={{ width: 'fit-content' }}>
        <PolkaGateIdenticon
          address={proxy.proxy.delegate}
          size={32}
        />
        <Grid container flexDirection='column' item sx={{ width: 'fit-content' }}>
          <Identity2
            address={proxy.proxy.delegate}
            genesisHash={genesisHash ?? ''}
            noIdenticon
          />
          <Grid container flexDirection='row' item sx={{ width: 'fit-content' }}>
            <Typography color='txt.highlight' variant='B-1'>
              {proxy.proxy.proxyType}
            </Typography>
            <Typography color='#82FFA5' sx={{ bgcolor: '#82FFA526', borderRadius: '7px' }} variant='S-1'>
              {proxy.proxy.delay}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Radio
        checked={isChecked}
        onChange={onSelect}
        value={proxy}
      />
    </Container>
  );
};

interface Props {
  openMenu: boolean;
  handleClose: () => void;
  proxies: Proxy[] | undefined;
  genesisHash: string | null | undefined;
  setSelectedProxy: React.Dispatch<React.SetStateAction<Proxy | undefined>>;
}

export default function SignUsingProxy ({ genesisHash, handleClose, openMenu, proxies, setSelectedProxy }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  const proxyItems = useMemo(() => (proxies ?? []).map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[], [proxies]);

  const handleSelectedProxy = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.value;
    const found = proxies?.find((proxy) => proxy.delegate === selected);

    setSelectedProxy(found);
  }, [proxies, setSelectedProxy]);

  return (
    <ExtensionPopup
      TitleIcon={Data}
      handleClose={handleClose}
      iconColor={theme.palette.text.highlight}
      iconSize={25}
      openMenu={openMenu}
      title={t('Select Proxy')}
    >
      <Stack direction='column' sx={{ height: '415px', position: 'relative', width: '100%' }}>
        <Typography color='text.highlight' sx={{ px: '15%', width: '100%' }} variant='B-4'>
          {t('Choose a suitable proxy for the account to conduct the transaction on its behalf')}
        </Typography>
        <Stack direction='column'>
          {proxyItems.map((item, index) => (
            <ProxiesItem
              genesisHash={genesisHash}
              key={index}
              onSelect={handleSelectedProxy}
              proxy={item}
              selectedProxyItem={item}
            />
          ))}
        </Stack>
      </Stack>
    </ExtensionPopup>
  );
}
