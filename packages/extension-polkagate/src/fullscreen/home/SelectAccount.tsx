// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Stack, Typography, useTheme } from '@mui/material';
import { ArrowCircleDown } from 'iconsax-react';
import React, { useCallback, useContext, useMemo, useState } from 'react';

import { noop } from '@polkadot/util';

import { AccountContext, GradientButton, GradientDivider, Identity2, Motion, Radio } from '../../components';
import { useTranslation } from '../../hooks';
import { DraggableModal } from '../components/DraggableModal';

interface ChooseAccountMenuProps {
  openMenu: boolean;
  handleClose: () => void;
  genesisHash: string | undefined | null;
  setSelectedAccount: React.Dispatch<React.SetStateAction<string | undefined>>;
  selectedAccount: string | undefined;
}

const AccountsListToSelect = ({ genesisHash, handleClose, openMenu, selectedAccount, setSelectedAccount }: ChooseAccountMenuProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { accounts } = useContext(AccountContext);

  const handleSelect = useCallback((acc: string) => () => {
    setSelectedAccount(acc);
  }, [setSelectedAccount]);

  const filteredAccounts = useMemo(() => {
    return accounts?.filter(({ isExternal }) => !isExternal);
  }, [accounts]);

  return (
    <DraggableModal
      onClose={handleClose}
      open={openMenu}
      showBackIconAsClose
      style={{ height: '460px', padding: '20px' }}
      title={t('Select Parent Account')}
    >
      <Motion style={{ display: 'flex', flexDirection: 'column', height: '91%', position: 'relative', rowGap: '17px', textAlign: 'left', width: '100%' }} variant='zoom'>
        <Typography color='text.secondary' letterSpacing='1px' textTransform='uppercase' variant='S-1' width='fit-content'>
          {t('My Accounts')}
        </Typography>
        <Stack direction='column' sx={{ maxHeight: '390px', mb: '65px', overflowY: 'auto', rowGap: '12px' }}>
          {filteredAccounts.map(({ address }) => {
            const checked = address === selectedAccount;

            return (
              <>
                <Container disableGutters key={address} onClick={handleSelect(address)} sx={{ alignItems: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Identity2
                    address={address}
                    addressStyle={{ color: theme.palette.primary.main }}
                    genesisHash={genesisHash ?? ''}
                    identiconSize={24}
                    socialStyles={{ mt: 0 }}
                    style={{
                      color: checked ? '#3988FF' : 'text.primary',
                      fontSize: '12px',
                      fontWeight: 500,
                      variant: 'B-4',
                      width: '80%'
                    }}
                    withShortAddress
                  />
                  <Radio
                    checked={checked}
                    onChange={noop}
                    value={address}
                  />
                </Container>
                <GradientDivider />
              </>
            );
          })}
        </Stack>
        <GradientButton
          onClick={handleClose}
          style={{
            bottom: '10px',
            height: '44px',
            left: '0',
            position: 'absolute',
            right: '0',
            width: '100%'
          }}
          text={t('Close')}
        />
      </Motion>
    </DraggableModal>
  );
};

interface Props {
  genesisHash: string | undefined | null;
  setSelectedAccount: React.Dispatch<React.SetStateAction<string | undefined>>;
  selectedAccount: string | undefined;
  style?: React.CSSProperties;
}

export default function SelectAccount ({ genesisHash, selectedAccount, setSelectedAccount, style = {} }: Props): React.ReactElement {
  const theme = useTheme();

  const [openMenu, setOpenMenu] = useState<boolean>(false);
  const [hovered, setHovered] = useState(false);

  const handleToggleMenu = useCallback(() => setOpenMenu((isMenuOpen) => !isMenuOpen), []);

  return (
    <>
      <Container disableGutters sx={{ alignItems: 'center', bgcolor: 'background.default', borderRadius: '14px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '10px', ...style }}>
        <Identity2
          address={selectedAccount}
          addressStyle={{ color: 'primary.main', variant: 'B-1' }}
          charsCount={14}
          genesisHash={genesisHash ?? ''}
          identiconSize={30}
          identiconStyle={{ marginRight: '5px' }}
          showSocial={false}
          socialStyles={{ mt: 0 }}
          style={{ variant: 'B-2' }}
          withShortAddress
        />
        <ArrowCircleDown
          color={hovered ? '#DC45A0' : theme.palette.primary.main}
          onClick={handleToggleMenu}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          size='32'
          style={{ cursor: 'pointer' }}
          variant='Bulk'
        />
      </Container>
      <AccountsListToSelect
        genesisHash={genesisHash}
        handleClose={handleToggleMenu}
        openMenu={openMenu}
        selectedAccount={selectedAccount}
        setSelectedAccount={setSelectedAccount}
      />
    </>
  );
}
