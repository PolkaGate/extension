// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useTheme } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { Checkbox, MnemonicSeed, Warning } from '../../../../extension-ui/src/components';
import useToast from '../../../../extension-ui/src/hooks/useToast';
import useTranslation from '../../../../extension-ui/src/hooks/useTranslation';
import PButton from '../../components/PButton';

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
      <Warning>
        {t<string>('Please write down your wallet’s mnemonic seed and keep it in a safe place. The mnemonic can be used to restore your wallet. Keep it carefully to not lose your assets.')}
      </Warning>
      <Checkbox
        checked={isMnemonicSaved}
        label={t<string>('I have saved my mnemonic seed safely.')}
        onChange={setIsMnemonicSaved}
        style={{ fontSize: '16px', marginTop: '55px' }}
        theme={theme}
      />
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
