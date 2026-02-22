// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Proxy, ProxyItem, ProxyTypes } from '../util/types';

import { Container, Grid, Stack, Typography, useTheme } from '@mui/material';
import { Data, Trash, Warning2 } from 'iconsax-react';
import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';

import { noop } from '@polkadot/util';

import { useIsBlueish, useTranslation } from '../hooks';
import { SharePopup } from '../partials';
import Radio from '../popup/staking/components/Radio';
import StakingActionButton from '../popup/staking/partial/StakingActionButton';
import { PolkaGateIdenticon } from '../style';
import { getSubstrateAddress } from '../util';
import { AccountContext, FadeOnScroll, GradientButton, Identity2, Progress } from '.';

const ResetSelection = ({ onReset }: { onReset: () => void }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isBlueish = useIsBlueish();

  return (
    <Container disableGutters onClick={onReset} sx={{ alignItems: 'center', bgcolor: isBlueish ? '#809ACB26' : '#BFA1FF26', borderRadius: '10px', columnGap: '2px', cursor: 'pointer', display: 'flex', p: '4px 7px', width: 'fit-content' }}>
      <Trash color={isBlueish ? theme.palette.text.highlight : theme.palette.primary.main} size='16' style={{ height: 'fit-content' }} variant='Bulk' />
      <Typography color={isBlueish ? 'text.highlight' : 'primary.main'} textAlign='left' variant='B-2'>
        {t('Reset')}
      </Typography>
    </Container>
  );
};

interface ProxiesItemProps {
  proxy: ProxyItem;
  selectedProxyItem: Proxy | undefined;
  onSelect: (stringifyProxy: string) => void;
  genesisHash: string | null | undefined;
  proxyTypeFilter: ProxyTypes[] | undefined;
}

const ProxiesItem = ({ genesisHash, onSelect, proxy, proxyTypeFilter, selectedProxyItem }: ProxiesItemProps) => {
  const { accounts } = useContext(AccountContext);
  const isBlueish = useIsBlueish();

  const isAvailable = useMemo(() => {
    if (!proxy) {
      return false;
    }

    const typeMatch = proxyTypeFilter ? proxyTypeFilter.some((type) => type.toLowerCase() === proxy.proxy.proxyType.toLowerCase()) : true;

    const found = accounts.find((account) => account.address === getSubstrateAddress(proxy.proxy.delegate));

    const condition = Boolean(!found || found.isHardware || found.isQR || found.isExternal);

    return !condition && typeMatch;
  }, [accounts, proxy, proxyTypeFilter]);

  const isChecked = useMemo(() => {
    if (!selectedProxyItem) {
      return false;
    }

    return (
      selectedProxyItem.delegate === proxy.proxy.delegate &&
      selectedProxyItem.proxyType === proxy.proxy.proxyType &&
      selectedProxyItem.delay === proxy.proxy.delay);
  }, [proxy.proxy.delay, proxy.proxy.delegate, proxy.proxy.proxyType, selectedProxyItem]);

  const handleSelect = useCallback(() => {
    if (!isAvailable) {
      return;
    }

    const stringifyProxy = JSON.stringify(proxy);

    onSelect(stringifyProxy);
  }, [isAvailable, onSelect, proxy]);

  return (
    <Container disableGutters onClick={handleSelect} sx={{ alignItems: 'center', bgcolor: '#05091C', border: '2px solid', borderColor: isChecked ? isBlueish ? '#3988FF' : 'menuIcon.hover' : '#222442', borderRadius: '18px', cursor: isAvailable ? 'pointer' : 'default', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', p: '12px', position: 'relative' }}>
      <Grid container item sx={{ alignItems: 'center', columnGap: '6px', width: 'fit-content' }}>
        <PolkaGateIdenticon
          address={proxy.proxy.delegate}
          size={32}
        />
        <Grid container flexDirection='column' item sx={{ width: 'fit-content' }}>
          <Identity2
            address={proxy.proxy.delegate}
            genesisHash={genesisHash ?? ''}
            noIdenticon
            showShortAddress
            style={{ width: '230px' }}
          />
          <Grid container flexDirection='row' item sx={{ alignItems: 'center', columnGap: '4px', width: 'fit-content' }}>
            <Typography color='txt.highlight' variant='B-1'>
              {proxy.proxy.proxyType}
            </Typography>
            <Typography color='#82FFA5' sx={{ bgcolor: '#82FFA526', borderRadius: '7px', p: '1px 3px' }} variant='S-1'>
              {proxy.proxy.delay * 6}sec
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Radio
        checked={isChecked}
        disabled={!isAvailable}
        onChange={noop}
        value={JSON.stringify(proxy)}
      />
      {!isAvailable && <Grid sx={{ backdropFilter: 'blur(1px)', bgcolor: 'rgba(0,0,0, 0.3)', borderRadius: '18px', height: '100%', inset: 0, position: 'absolute', width: '100%', zIndex: 1 }} />}
    </Container>
  );
};

interface Props {
  openMenu: boolean;
  handleClose: () => void;
  proxies: Proxy[] | undefined;
  genesisHash: string | null | undefined;
  setSelectedProxy: React.Dispatch<React.SetStateAction<Proxy | undefined>>;
  selectedProxy: Proxy | undefined;
  proxyTypeFilter: ProxyTypes[] | undefined;
}

export default function SignUsingProxy({ genesisHash, handleClose, openMenu, proxies, proxyTypeFilter, selectedProxy, setSelectedProxy }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const refContainer = useRef(null);
  const isBlueish = useIsBlueish();

  const [proxyItem, setProxyItem] = useState<Proxy | undefined>(selectedProxy);

  const proxyItems = useMemo(() => {
    return (proxies ?? []).map((p: Proxy) => ({ proxy: p, status: 'current' })) as ProxyItem[];
  }, [proxies]);

  const noProxyAvailable = useMemo(() => proxies && proxies.length === 0, [proxies]);
  const loadingProxy = useMemo(() => proxies === undefined, [proxies]);

  const handleSelectedProxy = useCallback((stringifyProxy: string) => {
    const selected = JSON.parse(stringifyProxy) as ProxyItem;

    const found = proxies?.find((proxy) => proxy.delegate === selected.proxy.delegate && proxy.proxyType === selected.proxy.proxyType && proxy.delay === selected.proxy.delay);

    setProxyItem(found);
  }, [proxies]);

  const onApply = useCallback(() => {
    setSelectedProxy(proxyItem);
    handleClose();
  }, [handleClose, proxyItem, setSelectedProxy]);

  const onReset = useCallback(() => setProxyItem(undefined), []);

  const onClosePopup = useCallback(() => {
    onReset();
    handleClose();
  }, [handleClose, onReset]);

  return (
    <SharePopup
      RightItem={<ResetSelection onReset={onReset} />}
      modalProps={{
        dividerStyle: { margin: '5px 0 5px' },
        showBackIconAsClose: true
      }}
      modalStyle={{ minHeight: '200px' }}
      onClose={onClosePopup}
      open={openMenu}
      popupProps={{
        TitleIcon: Data,
        iconColor: theme.palette.text.highlight,
        iconSize: 25,
        maxHeight: '450px',
        withoutTopBorder: true
      }}
      title={t('Select Proxy')}
    >
      <Stack direction='column' sx={{ height: '450px', position: 'relative', width: '100%' }}>
        <Typography color={isBlueish ? 'text.highlight' : 'primary.main'} sx={{ p: '10px 15% 0', width: '100%' }} variant='B-4'>
          {t('Choose a suitable proxy for the account to conduct the transaction on its behalf')}
        </Typography>
        <Stack direction='column' ref={refContainer} sx={{ gap: '8px', maxHeight: '375px', mb: '70px', mt: '25px', overflow: 'hidden', overflowY: 'auto' }}>
          {proxyItems.map((item, index) => (
            <ProxiesItem
              genesisHash={genesisHash}
              key={`${index} ${item.proxy.delegate}`}
              onSelect={handleSelectedProxy}
              proxy={item}
              proxyTypeFilter={proxyTypeFilter}
              selectedProxyItem={proxyItem}
            />
          ))}
        </Stack>
        <FadeOnScroll containerRef={refContainer} height='50px' ratio={0.05} style={{ bottom: '58px' }} />
        {noProxyAvailable &&
          <Container disableGutters sx={{ alignItems: 'center', columnGap: '8px', display: 'flex', justifyContent: 'center', mt: '90px' }}>
            <Warning2 color='#FF4FB9' size='22' style={{ height: 'fit-content' }} variant='Bold' />
            <Typography color='#FF4FB9' textAlign='left' variant='B-4'>
              {t('No proxy available')}
            </Typography>
          </Container>}
        {proxies === undefined &&
          <Progress
            style={{ marginTop: '90px' }}
            title={t('Loading proxy accounts')}
          />
        }
        {isBlueish
          ? (
            <StakingActionButton
              disabled={noProxyAvailable || loadingProxy || proxyItem === selectedProxy}
              onClick={onApply}
              style={{ bottom: '15px', left: 0, padding: '0 15px', position: 'absolute', right: 0, width: '100%' }}
              text={t('Apply')}
            />)
          : (
            <GradientButton
              contentPlacement='center'
              disabled={noProxyAvailable || loadingProxy || proxyItem === selectedProxy}
              onClick={onApply}
              style={{
                bottom: '0',
                height: '44px',
                position: 'absolute',
                width: '100%'
              }}
              text={t('Apply')}
            />)
        }
      </Stack>
    </SharePopup>
  );
}
