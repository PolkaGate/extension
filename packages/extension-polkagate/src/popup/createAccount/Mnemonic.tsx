// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { Checkbox2 as Checkbox, MnemonicSeed, PButton, Warning } from '../../components';
import { useToast, useTranslation } from '../../hooks';

interface Props {
  onNextStep: () => void;
  seed: string;
}

const onCopy = (): void => {
  const mnemonicSeedTextElement = document.querySelector('textarea');

  if (!mnemonicSeedTextElement) {
    return;
  }

  mnemonicSeedTextElement.select();
  document.execCommand('copy');
};

function Mnemonic({ onNextStep, seed }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();
  const [isMnemonicSaved, setIsMnemonicSaved] = useState(false);
  const { show } = useToast();

  const _onCopy = useCallback((): void => {
    onCopy();
    show(t('Copied'));
  }, [show, t]);

  return (
    <>
      <MnemonicSeed
        onCopy={_onCopy}
        seed={seed}
      />
      <Warning iconDanger marginTop= {43} theme={theme}>
        {t<string>('Please write down your wallet’s mnemonic seed and keep it in a safe place. The mnemonic can be used to restore your wallet. Keep it carefully to not lose your assets.')}
      </Warning>
      <Grid item sx={{ mt: '55px', ml: '5px' }}>
        <Checkbox
          checked={isMnemonicSaved}
          iconStyle={{ transform: 'scale:(1.13)' }}
          label={t<string>('I have saved my mnemonic seed safely.')}
          labelStyle={{ fontSize: '16px', marginLeft: '7px' }}
          onChange={() => setIsMnemonicSaved(!isMnemonicSaved)}
          style={{ ml: '15px', width: '92%' }}
        />
      </Grid>
      <PButton
        _onClick={onNextStep}
        _variant='contained'
        disabled={!isMnemonicSaved}
        text={t<string>('Next')}
      />
    </>
  );
}

export default React.memo(Mnemonic);
