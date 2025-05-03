// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, Typography } from '@mui/material';
import { Folder } from 'iconsax-react';
import React, { useCallback, useContext, useState } from 'react';

import { updateMeta } from '@polkadot/extension-polkagate/src/messaging';

import { AccountContext, DecisionButtons, ExtensionPopup, GradientButton, MyTextField } from '../../components';
import { useCategorizedAccountsInProfiles, useTranslation } from '../../hooks';
import ProfileAccountSelection from './ProfileAccountSelection';
import { PROFILE_MODE } from './type';
import { addProfileTag } from './utils';

interface Props {
  setPopup: React.Dispatch<React.SetStateAction<PROFILE_MODE>>;
}

enum STEP {
  ADD_NAME,
  CHOOSE_ACCOUNTS
}

function NewProfile ({ setPopup }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const categorizedAccounts = useCategorizedAccountsInProfiles();

  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [profileName, setName] = useState<string | null>();
  const [selectedAddresses, setSelectedAddresses] = useState<Set<string>>(new Set());
  const [step, setStep] = useState(STEP.ADD_NAME);

  const handleClose = useCallback(() => setPopup(PROFILE_MODE.NONE), [setPopup]);

  const onNext = useCallback(() => {
    setStep(STEP.CHOOSE_ACCOUNTS);
  }, []);

  const onAdd = useCallback(async () => {
    if (!profileName) { // won't happen
      return;
    }

    setIsBusy(true);

    await Promise.all(accounts?.map(async (account) => {
      let newProfileString;
      let metaData;

      if (selectedAddresses.has(account.address)) {
        newProfileString = addProfileTag(account.profile, profileName);
        metaData = JSON.stringify({
          profile: newProfileString === '' ? null : newProfileString
        });

        await updateMeta(account.address, metaData);
      }
    }) || []).finally(() => {
      setIsBusy(false);
      handleClose();
    });
  }, [accounts, handleClose, profileName, selectedAddresses]);

  const onNameChange = useCallback((name: string | null) => setName(name), []);

  return (
    <ExtensionPopup
      TitleIcon={Folder}
      handleClose={handleClose}
      iconSize={24}
      iconVariant='Bulk'
      maxHeight='100%'
      openMenu={true}
      title={t('New profile')}
      withoutTopBorder
    >
      {step === STEP.ADD_NAME &&
        <Grid alignItems='center' container direction='column' item justifyContent='start' sx={{ height: '450px', pb: '20px', position: 'relative', zIndex: 1 }}>
          <Typography color='#BEAAD8' variant='B-4'>
            {t('Give a name to the profile')}
          </Typography>
          <MyTextField
            Icon={Folder}
            focused
            iconSize={18}
            onEnterPress={onNext}
            onTextChange={onNameChange}
            placeholder={t('Enter a name')}
            style={{ margin: '20px 0 30px' }}
            title={t('Profile name')}
          />
          <GradientButton
            contentPlacement='center'
            disabled={!profileName}
            onClick={onNext}
            style={{
              bottom: '0',
              height: '44px',
              position: 'absolute',
              width: '97%'
            }}
            text={t('Next')}
          />
        </Grid>
      }
      {step === STEP.CHOOSE_ACCOUNTS &&
        <Grid alignItems='center' container direction='column' item justifyContent='start' sx={{ height: '450px', pb: '20px', position: 'relative', zIndex: 1 }}>
          <Typography color='#BEAAD8' variant='B-4'>
            {t('Select the addresses you’d like to include in {{profileLabel}} profile', { replace: { profileLabel: profileName } })}
          </Typography>
          <Stack direction='column' sx={{ height: '350px', mt: '25px', overflow: 'scroll', width: '100%' }}>
            {Object.entries(categorizedAccounts)?.map(([label, accounts]) => {
              return (
                <>
                  {
                    !!accounts?.length &&
                    <ProfileAccountSelection
                      accounts={accounts}
                      key={label}
                      label={label}
                      selectedAddresses={selectedAddresses}
                      setSelectedAddresses={setSelectedAddresses}
                    />
                  }
                </>
              );
            })}
          </Stack>
          <DecisionButtons
            cancelButton
            direction='horizontal'
            disabled={ !selectedAddresses.size}
            isBusy={isBusy}
            onPrimaryClick={onAdd}
            onSecondaryClick={handleClose}
            primaryBtnText={t('Add {{num}} address{{es}}', { replace: { num: selectedAddresses.size, es: selectedAddresses.size > 1 ? 'es' : '' } })}
            secondaryBtnText={t('Skip')}
            style={{ bottom: 0, position: 'absolute' }}
          />
        </Grid>
      }
    </ExtensionPopup>
  );
}

export default NewProfile;
