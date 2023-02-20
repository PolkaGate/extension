// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { faCopy } from '@fortawesome/free-regular-svg-icons';
import { Tooltip } from '@mui/material';
import React, { MouseEventHandler, useCallback } from 'react';

import { useTranslation } from '../hooks';
import ActionText from './ActionText';
import TextAreaWithLabel from './TextAreaWithLabel';

interface Props {
  copied: boolean;
  setIsCopied: React.Dispatch<React.SetStateAction<boolean>>;
  seed: string;
  onCopy: MouseEventHandler<HTMLDivElement>;
}

export default function MnemonicSeed({ copied, onCopy, seed, setIsCopied }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const handelCloseToolTip = useCallback(() => {
    setTimeout(() => setIsCopied(false), 200);
  }, [setIsCopied]);

  return (
    <div style={{ marginTop: '25px' }}>
      <TextAreaWithLabel
        className='mnemonicDisplay'
        isReadOnly
        label={t<string>('Generated 12-word mnemonic seed:')}
        style={{ margin: 'auto', width: '92%' }}
        value={seed}
      />
      <Tooltip
        // arrow={!copied}
        componentsProps={{
          popper: {
            sx: {
              '.MuiTooltip-tooltip.MuiTooltip-tooltipPlacementTop.css-18kejt8': {
                mb: '3px',
                p: '3px 15px'
              },
              '.MuiTooltip-tooltip.MuiTooltip-tooltipPlacementTop.css-1yuxi3g': {
                mb: '3px',
                p: '3px 15px'
              },
              visibility: copied ? 'visible' : 'hidden'
            }
          },
          tooltip: {
            sx: {
              '& .MuiTooltip-arrow': {
                color: 'text.primary',
                height: '10px'
              },
              backgroundColor: 'text.primary',
              color: 'text.secondary',
              fontSize: '14px',
              fontWeight: 400
            }
          }
        }}
        leaveDelay={700}
        onClose={handelCloseToolTip}
        placement='top'
        title={t<string>('Copied')}
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
      </Tooltip>
    </div>
  );
}
