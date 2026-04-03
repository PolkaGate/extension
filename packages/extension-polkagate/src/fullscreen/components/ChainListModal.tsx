// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropdownOption } from '@polkadot/extension-polkagate/src/util/types';

import { Container } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import useAccountSelectedChain from '@polkadot/extension-polkagate/src/hooks/useAccountSelectedChain';
import useUpdateAccountSelectedChain from '@polkadot/extension-polkagate/src/hooks/useUpdateAccountSelectedChain';
import { STAKING_CHAINS } from '@polkadot/extension-polkagate/src/util/constants';
import { isMigratedHub, isMigratedRelay, mapRelayToSystemGenesisIfMigrated } from '@polkadot/extension-polkagate/src/util/migrateHubUtils';
import { isEthereumAddress } from '@polkadot/util-crypto';

import { GradientButton } from '../../components';
import { useGenesisHashOptions, useSelectedAccount, useSelectedChains, useTranslation } from '../../hooks';
import { VelvetBox } from '../../style';
import { toTitleCase } from '../../util';
import ChainPickerList from './ChainPickerList';
import { DraggableModal } from './DraggableModal';

interface ChooseAccountMenuProps {
  open: boolean;
  externalOptions?: DropdownOption[];
  setSelectedChain?: React.Dispatch<React.SetStateAction<DropdownOption>>;
  handleClose: () => void;
}

export default function ChainListModal({ externalOptions, handleClose, open, setSelectedChain }: ChooseAccountMenuProps): React.ReactElement {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const selectedChains = useSelectedChains();
  const selectedAccount = useSelectedAccount();
  const isSelectedAccountEthereum = isEthereumAddress(selectedAccount?.address);
  const allChains = useGenesisHashOptions({ isEthereum: isSelectedAccountEthereum });
  const selectedAccountChain = useAccountSelectedChain(selectedAccount?.address);

  const [maybeSelected, setMayBeSelected] = useState<DropdownOption>();
  const [appliedGenesis, setAppliedGenesis] = useState<DropdownOption>();

  const _handleClose = useCallback(() => {
    setMayBeSelected(undefined);
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

  const initialChainsGenesisHashes = useMemo(() => {
    if (pathname?.includes('stake')) {
      return STAKING_CHAINS;
    }

    if (pathname?.includes('send')) {
      return selectedChains?.map((g) => mapRelayToSystemGenesisIfMigrated(g))?.filter((g) => !isMigratedRelay(g ?? ''));
    }

    return selectedChains;
  }, [pathname, selectedChains]);

  const chainsOptions = useMemo(() => {
    if (!initialChainsGenesisHashes) {
      return [];
    }

    const _options = externalOptions ?? allChains.filter(({ value }) => initialChainsGenesisHashes.includes(String(value)));

    return _options.map((o) => {
      o.value = String(o.value);

      return o;
    });
  }, [allChains, externalOptions, initialChainsGenesisHashes]);
  const onItemClick = useCallback((chain: DropdownOption) => {
    setMayBeSelected(chain);
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
        <VelvetBox style={{ margin: '5px 0 15px' }}>
          <ChainPickerList
            // eslint-disable-next-line react/jsx-no-bind
            getLabel={({ text, value }) => {
              const normalizedChainName = isMigratedHub(String(value)) ? text.replace('Asset Hub', '') : text.replace('Relay Chain', '');

              return toTitleCase(normalizedChainName) ?? t('Unknown');
            }}
            itemTextColor='#EAEBF1'
            itemTextVariant='B-1'
            logoSize={24}
            maxHeight='388px'
            maybeSelectedText={maybeSelected?.text}
            minHeight='88px'
            nothingFoundStyle={{ paddingTop: '80px' }}
            onDoubleClick={onApply}
            onSelect={onItemClick}
            options={chainsOptions}
            searchPlaceholder={t('🔍 Search networks')}
            selectedValue={(maybeSelected?.value?.toString() ?? selectedAccountChain) as string | undefined}
            showSelectedCheck
            showTopPadding
          />
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
