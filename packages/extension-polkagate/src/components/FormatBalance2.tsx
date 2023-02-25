// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
/* eslint-disable header/header */

import type { Compact } from '@polkadot/types';

import React from 'react';

import { BN, formatBalance } from '@polkadot/util';

import { FLOATING_POINT_DIGIT } from '../util/constants';

interface Props {
  decimals: number[],
  tokens: string[],
  label?: React.ReactNode;
  value?: Compact<any> | BN | string | null;
  decimalPoint?: number;
}

function createElement(prefix: string, postfix: string, unit: string, decimalPoint: number): React.ReactNode {
  return <>{`${prefix}.`}{<span className='ui--FormatBalance-postfix'>{`00${postfix?.slice(0, decimalPoint) || ''}`.slice(-decimalPoint)}</span>}<span className='ui--FormatBalance-unit'> {unit}</span></>;
}

function applyFormat(decimalPoint: number, value: Compact<any> | BN | string, [decimals, token]: [number, string]): React.ReactNode {
  const [prefix, postfix] = formatBalance(value, { decimals, forceUnit: '-', withSi: false }).split('.');

  return createElement(prefix, postfix, token, decimalPoint);
}

function FormatBalance({ decimalPoint = FLOATING_POINT_DIGIT, decimals, label, tokens, value }: Props): React.ReactElement<Props> {
  return (
    <div className='ui--FormatBalance'>
      {label ? <>{label}&nbsp;</> : ''}
      <span
        className='ui--FormatBalance-value'
        data-testid='balance-summary'
      >{
          value && decimals?.length && tokens?.length
            ? applyFormat(decimalPoint, value, [decimals[0], tokens[0]])
            : ''
        }</span>
    </div>
  );
}

export default React.memo(FormatBalance);
