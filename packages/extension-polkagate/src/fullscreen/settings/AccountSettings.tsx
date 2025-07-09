// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Stack, Typography } from '@mui/material';
import { Broom, Edit, ExportCurve, type Icon, ImportCurve, LogoutCurve, ShieldSecurity } from 'iconsax-react';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import RemoveAccount from '@polkadot/extension-polkagate/src/partials/RemoveAccount';
import { ExtensionPopups } from '@polkadot/extension-polkagate/src/util/constants';

import { Motion } from '../../components';
import { useSelectedAccount, useTranslation } from '../../hooks';
import { WebsitesAccess } from '../../partials';
import { VelvetBox } from '../../style';
import DeriveAccount from '../home/DeriveAccount';
import ExportAllAccounts from '../home/ExportAllAccounts';
import RenameAccount from '../home/RenameAccount';

interface ActionBoxProps {
  Icon: Icon;
  label: string;
  path?: string;
  onClick?: () => void;
}

function ActionBox ({ Icon, label, onClick, path }: ActionBoxProps): React.ReactElement {
  const navigate = useNavigate();

  const _onClick = useCallback(async () => {
    onClick
      ? onClick()
      : path && await navigate(path);
  }, [navigate, onClick, path]);

  return (
    <Stack direction='column' justifyContent='start' onClick={_onClick} rowGap='8px' sx={{ '&:hover': { bgcolor: '#2D1E4A', transform: 'translateY(-4px)' }, bgcolor: '#05091C', borderRadius: '14px', cursor: 'pointer', height: '86px', minWidth: '141px', px: '10px', transition: 'all 250ms ease-out', width: 'fit-content' }}>
      <Icon color='#AA83DC' size='24' style={{ marginTop: '17px' }} variant='Bulk' />
      <Typography sx={{ display: 'flex', fontWeight: 700, width: 'fit-content' }} variant='B-2'>
        {label}
      </Typography>
    </Stack>
  );
}

function AccountSettings (): React.ReactElement {
  const { t } = useTranslation();
  const selectedAccount = useSelectedAccount();

  const [popup, setPopup] = useState<ExtensionPopups>(ExtensionPopups.NONE);

  return (
    <Motion variant='slide'>
      <VelvetBox>
        <Stack alignItems='start' direction='column' justifyContent='flex-start' sx={{ backgroundColor: 'background.paper', borderRadius: '14px', height: '600px', pl: '20px', position: 'relative', width: '100%' }}>
          <Typography color='text.primary' fontSize='22px' mt='30px' sx={{ display: 'block', textAlign: 'left', textTransform: 'uppercase' }} variant='H-4'>
            {t('Actions')}
          </Typography>
          <VelvetBox childrenStyle={{ columnGap: '4px', display: 'flex', flexDirection: 'row' }} style={{ width: 'fit-content', margin: '20px 0' }}>
            <ActionBox
              Icon={Edit}
              label={t('Rename Account')}
              onClick={() => setPopup(ExtensionPopups.RENAME)}
            />
            <ActionBox
              Icon={ExportCurve}
              label={t('Export Accounts')}
              onClick={() => setPopup(ExtensionPopups.EXPORT)}
            />
            <ActionBox
              Icon={ImportCurve}
              label={t('Import Accounts')}
              path='/account/have-wallet'
            />
            <ActionBox
              Icon={ShieldSecurity}
              label={t('Manage Website Access')}
              onClick={() => setPopup(ExtensionPopups.DAPPS)}
            />
            <ActionBox
              Icon={Broom}
              label={t('Derive from Account')}
              onClick={() => setPopup(ExtensionPopups.DERIVE)}
            />
          </VelvetBox>
          <Stack alignItems='center' columnGap='5px' direction='row' onClick={() => setPopup(ExtensionPopups.REMOVE)} sx={{ bottom: '20px', cursor: 'pointer', position: 'absolute' }}>
            <LogoutCurve color='#AA83DC' size={18} variant='Bulk' />
            <Typography sx={{ '&:hover': { color: '#AA83DC' }, color: '#BEAAD8', transition: 'all 250ms ease-out' }} variant='B-1'>
              {t('Remove account')}
            </Typography>
          </Stack>
        </Stack>
        {
          popup === ExtensionPopups.RENAME &&
        <RenameAccount
          address={selectedAccount?.address}
          open={popup}
          setPopup={setPopup}
        />
        }
        {popup === ExtensionPopups.EXPORT &&
        <ExportAllAccounts
          open={popup === ExtensionPopups.EXPORT}
          setPopup={setPopup}
        />
        }
        {
          popup === ExtensionPopups.REMOVE &&
        <RemoveAccount
          open={popup === ExtensionPopups.REMOVE}
          setPopup={setPopup}
        />
        }
        {
          popup === ExtensionPopups.DAPPS &&
        <WebsitesAccess
          open={popup === ExtensionPopups.DAPPS}
          setPopup={setPopup}
        />
        }
        {popup === ExtensionPopups.DERIVE &&
        <DeriveAccount
          open={popup === ExtensionPopups.DERIVE}
          setPopup={setPopup}
        />
        }
      </VelvetBox>
    </Motion>
  );
}

export default React.memo(AccountSettings);
