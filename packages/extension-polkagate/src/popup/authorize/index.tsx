// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

// import type { ThemeProps } from '../../types';

import React, { useContext } from 'react';

import { AuthorizeReqContext } from '../../components';
import useTranslation from '../../hooks/useTranslation';
import { HeaderBrand } from '../../partials';
import Request from './Request';

interface Props {
  className?: string;
}

export default function Authorize({ className = '' }: Props): React.ReactElement {
  const { t } = useTranslation();
  const requests = useContext(AuthorizeReqContext);

  return (
    <>
      <div className={`${className} ${requests.length === 1 ? 'lastRequest' : ''}`}>
        <HeaderBrand
          text={t<string>('Polkagate')}
        />
        {requests.map(({ id, request, url }, index): React.ReactNode => (
          <Request
            authId={id}
            className='request'
            isFirst={index === 0}
            key={id}
            request={request}
            url={url}
          />
        ))}
      </div>
    </>
  );
}
