// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faCopy } from '@fortawesome/free-regular-svg-icons';
import React, { MouseEventHandler } from 'react';

import { useTranslation } from '../hooks';
import ActionText from './ActionText';
import OnActionToolTip from './OnActionToolTip';
import TextAreaWithLabel from './TextAreaWithLabel';

interface Props {
  isCopied: boolean;
  setIsCopied: React.Dispatch<React.SetStateAction<boolean>>;
  seed: string;
  onCopy: MouseEventHandler<HTMLDivElement>;
}

export default function MnemonicSeed({ isCopied, onCopy, seed, setIsCopied }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  return (
    <div style={{ marginTop: '25px' }}>
      <TextAreaWithLabel
        className='mnemonicDisplay'
        isReadOnly
        label={t<string>('Generated 12-word mnemonic seed:')}
        style={{ margin: 'auto', width: '92%' }}
        value={seed}
      />
      <OnActionToolTip
        actionHappened={isCopied}
        setIsHappened={setIsCopied}
        title={t('Copied')}
      >
        <div className='buttonsRow'>
          <ActionText
            className='copyBtn'
            data-seed-action='copy'
            icon={faCopy}
            onClick={onCopy}
            text={t<string>('Copy to clipboard')}
          />
        </div>
      </OnActionToolTip>
    </div>
  );
}
