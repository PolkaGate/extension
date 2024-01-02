// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, IconButton } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';

import { InputWithLabel } from '../../../components';
import { useTranslation } from '../../../hooks';

interface Props {
  defaultPath: string | undefined;
  isError: boolean;
  onChange: (suri: string) => void;
  withSoftPath: boolean;
}

function DerivationPath ({ defaultPath, isError, onChange, withSoftPath }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [path, setPath] = useState<string | undefined>(defaultPath);
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    setPath(defaultPath);
  }, [defaultPath]);

  const _onExpand = useCallback(() => setIsDisabled(!isDisabled), [isDisabled]);

  const _onChange = useCallback((newPath: string): void => {
    setPath(newPath);
    onChange(newPath);
  }, [onChange]);

  return (
    <Grid container item>
      <Grid alignItems='center' container item xs={11}>
        <InputWithLabel
          data-input-suri
          disabled={isDisabled}
          isError={isError || !path}
          label={
            isDisabled
              ? t('Derivation Path (unlock to edit)')
              : t('Derivation Path')
          }
          onChange={_onChange}
          placeholder={withSoftPath
            ? t<string>('//hard/soft')
            : t<string>('//hard')
          }
          value={path}
        />
      </Grid>
      <Grid alignItems='flex-end' container item justifyContent='center' xs={1}>
        <IconButton
          onClick={_onExpand}
        >
          <FontAwesomeIcon
            color='#BA2882'
            fontSize={20}
            icon={isDisabled ? faLock : faLockOpen}
          />
        </IconButton>
      </Grid>
    </Grid>
  );
}

export default React.memo(DerivationPath);
