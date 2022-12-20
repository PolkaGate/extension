// Copyright 2019-2022 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { CSSProperties } from '@mui/styled-engine';
import React, { useContext, useMemo } from 'react';

import { AccountContext, InputWithLabel, ValidatedInput } from '../components';
import { useTranslation } from '../hooks';
import { isNotShorterThan } from '../util/validators';

interface Props {
  address?: string;
  className?: string;
  isFocused?: boolean;
  label?: string;
  onBlur?: () => void;
  onEnter?: () => void;
  onChange: (name: string | null) => void;
  value?: string | null;
  style?: CSSProperties | undefined;
}

export default function Name({ address, className, isFocused, label, onBlur, onEnter, style = {}, onChange, value }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { accounts } = useContext(AccountContext);
  const isNameValid = useMemo(() => isNotShorterThan(3, t<string>('Account name is too short')), [t]);

  const account = accounts.find((account) => account.address === address);
  const startValue = value || account?.name;

  console.log('isfoced:', isFocused)
  console.log('onEnter:', onEnter)

  return (
    <div style={style}>
      <ValidatedInput
        className={className}
        component={InputWithLabel}
        data-input-name
        defaultValue={startValue}
        isFocused={isFocused}
        label={label || t<string>('Choose a name for this account')}
        onBlur={onBlur}
        onEnter={onEnter}
        onValidatedChange={onChange}
        type='text'
        validator={isNameValid}
      />
    </div>
  );
}
