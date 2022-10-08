// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ThemeProps } from '../types';

import { faCopy } from '@fortawesome/free-regular-svg-icons';
import React, { MouseEventHandler } from 'react';
import styled from 'styled-components';

import ActionText from '../../../extension-polkagate/src/components/ActionText';
import useTranslation from '../../../extension-ui/src/hooks/useTranslation';
import TextAreaWithLabel from './TextAreaWithLabel';

interface Props {
  seed: string;
  onCopy: MouseEventHandler<HTMLDivElement>;
  className?: string;
}

export default function MnemonicSeed({ className, onCopy, seed }: Props): React.ReactElement<Props> {
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
      <div className='buttonsRow'>
        <ActionText
          className='copyBtn'
          data-seed-action='copy'
          icon={faCopy}
          onClick={onCopy}
          text={t<string>('Copy to clipboard')}
        />
      </div>
    </div>
  );
}
