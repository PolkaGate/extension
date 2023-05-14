// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useContext } from 'react';

import { AuthorizeReqContext } from '../../components';
import { useTranslation } from '../../hooks';
import { HeaderBrand } from '../../partials';
import Request from './Request';

export default function Authorize(): React.ReactElement {
  const { t } = useTranslation();
  const requests = useContext(AuthorizeReqContext);

  return (
    <>
      <HeaderBrand
        showBrand
        text={t<string>('Polkagate')}
      />
      {requests.map(({ id, request, url }, index): React.ReactNode => (
        <Request
          authId={id}
          isFirst={index === 0}
          key={id}
          request={request}
          url={url}
        />
      ))}
    </>
  );
}
