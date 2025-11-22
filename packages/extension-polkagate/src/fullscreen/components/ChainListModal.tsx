// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-first-prop-new-line */

import type { DropdownOption } from '@polkadot/extension-polkagate/src/util/types';

import { Container, Grid, Stack, Typography } from '@mui/material';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import useAccountSelectedChain from '@polkadot/extension-polkagate/src/hooks/useAccountSelectedChain';
import useUpdateAccountSelectedChain from '@polkadot/extension-polkagate/src/hooks/useUpdateAccountSelectedChain';
import { NothingFound } from '@polkadot/extension-polkagate/src/partials';
import { PROXY_CHAINS, STAKING_CHAINS } from '@polkadot/extension-polkagate/src/util/constants';
import { isMigratedHub, isMigratedRelay, mapRelayToSystemGenesisIfMigrated, migratedRelays } from '@polkadot/extension-polkagate/src/util/migrateHubUtils';

import { ChainLogo, GlowCheck, GradientButton, SearchField } from '../../components';
import { useGenesisHashOptions, useSelectedAccount, useSelectedChains, useTranslation } from '../../hooks';
import { VelvetBox } from '../../style';
import { toTitleCase } from '../../util';
import { DraggableModal } from './DraggableModal';

interface ChooseAccountMenuProps {
  open: boolean;
  externalOptions?: DropdownOption[];
  setSelectedChain?: React.Dispatch<React.SetStateAction<DropdownOption>>;
  handleClose: () => void;
}

export default function ChainListModal ({ externalOptions, handleClose, open, setSelectedChain }: ChooseAccountMenuProps): React.ReactElement {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const selectedChains = useSelectedChains();
  const allChains = useGenesisHashOptions(false);
  const selectedAccount = useSelectedAccount();
  const selectedAccountChain = useAccountSelectedChain(selectedAccount?.address);
  const refContainer = useRef<HTMLDivElement>(null);

  const [maybeSelected, setMayBeSelected] = useState<DropdownOption>();
  const [appliedGenesis, setAppliedGenesis] = useState<DropdownOption>();
  const [searchKeyword, setSearchKeyword] = useState<string>();

  const _handleClose = useCallback(() => {
    setMayBeSelected(undefined);
    setSearchKeyword(undefined);
    setAppliedGenesis(undefined);
    handleClose();
  }, [handleClose]);

  useUpdateAccountSelectedChain(selectedAccount?.address, appliedGenesis?.value ? String(appliedGenesis.value) : undefined, true, _handleClose);

  const onApply = useCallback(() => {
    if (setSelectedChain) {
      maybeSelected && setSelectedChain(maybeSelected);
      _handleClose();

      return;
    }

    if (!maybeSelected || !selectedAccount?.address) {
      return _handleClose();
    }

    selectedAccount && setAppliedGenesis(maybeSelected);
  }, [setSelectedChain, maybeSelected, selectedAccount, _handleClose]);

  const onSearch = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
  }, []);

  const initialChainsGenesisHashes = useMemo(() => {
    if (pathname?.includes('stake')) {
      return STAKING_CHAINS;
    }

    if (pathname?.includes('send')) {
      return selectedChains?.map((g) => mapRelayToSystemGenesisIfMigrated(g))?.filter((g) => !isMigratedRelay(g ?? ''));
    }

    if (pathname?.includes('proxyManagement')) {
      return PROXY_CHAINS.filter((chain) => !migratedRelays.includes(chain));
    }

    return selectedChains;
  }, [pathname, selectedChains]);

  const chainsOptions = useMemo(() => {
    if (!initialChainsGenesisHashes) {
      return [];
    }

    return externalOptions ?? allChains.filter(({ value }) => initialChainsGenesisHashes.includes(String(value)));
  }, [allChains, externalOptions, initialChainsGenesisHashes]);

  const filteredChainsToList = useMemo(() => {
    if (!chainsOptions) {
      return [];
    }

    if (!searchKeyword) {
      return chainsOptions;
    }

    const keyword = searchKeyword.trim().toLowerCase();

    return chainsOptions.filter(({ text }) => text.toLowerCase().includes(keyword));
  }, [searchKeyword, chainsOptions]);

  const onItemClick = useCallback((text: string, value: string) => () => {
    setMayBeSelected({ text, value });
  }, []);

  return (
    <DraggableModal
      closeOnAnyWhereClick
      onClose={_handleClose}
      open={open}
      showBackIconAsClose
      style={{ backgroundColor: '#1B133C', minHeight: '600px', padding: ' 20px 10px 10px' }}
      title={t('Select network')}
    >
      <Container disableGutters sx={{ display: 'block', height: '505px', mt: '10px', pb: '50px', position: 'relative', width: 'initial', zIndex: 1 }}>
        <SearchField
          focused
          onInputChange={onSearch}
          placeholder={t('🔍 Search networks')}
        />
        <VelvetBox style={{ margin: '5px 0 15px' }}>
          <Stack ref={refContainer} style={{ gap: '4px', maxHeight: '388px', minHeight: '88px', overflow: 'hidden', overflowY: 'auto', position: 'relative' }}>
            {filteredChainsToList.map(({ text, value }, index) => {
              const normalizedChainName = isMigratedHub(String(value)) ? text.replace('Asset Hub', '') : text.replace('Relay Chain', '');

              return (
                <Grid alignItems='center' container item justifyContent='space-between' key={index}
                  onClick={onItemClick(text, String(value))}
                  onDoubleClick={onApply}
                  sx={{ '&:hover': { bgcolor: '#6743944D' }, borderRadius: '12px', cursor: 'pointer', p: '10px 7px' }}
                >
                  <Stack alignItems='center' direction='row'>
                    <ChainLogo chainName={text} genesisHash={value as string} size={24} />
                    <Typography color='#EAEBF1' ml='8px' sx={{ userSelect: 'none' }} variant='B-1'>
                      {toTitleCase(normalizedChainName)}
                    </Typography>
                  </Stack>
                  <GlowCheck
                    show={maybeSelected?.value === value || maybeSelected?.text === text || (!maybeSelected && selectedAccountChain === value)}
                    size='24px'
                    timeout={100}
                  />
                </Grid>
              );
            })}
            <NothingFound
              show={filteredChainsToList.length === 0}
              style={{ pt: '80px' }}
              text={t('Network Not Found')}
            />
          </Stack>
        </VelvetBox>
        <GradientButton
          contentPlacement='center'
          disabled={!maybeSelected}
          onClick={onApply}
          style={{
            bottom: '10px',
            height: '44px',
            margin: '0 1%',
            position: 'absolute',
            width: '98%'
          }}
          text={t('Apply')}
        />
      </Container>
    </DraggableModal>
  );
}
