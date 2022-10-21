// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback } from 'react';
import styled from 'styled-components';

import { AuthUrlInfo } from '@polkadot/extension-base/background/handlers/State';
import { RemoveAuth, Switch } from '@polkadot/extension-ui/components';

import useTranslation from '../../hooks/useTranslation';

interface Props {
  info: AuthUrlInfo;
  toggleAuth: (url: string) => void;
  removeAuth: (url: string) => void;
  url: string;
}

function WebsiteEntry ({ info, removeAuth, toggleAuth, url }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();

  const switchAccess = useCallback(() => {
    toggleAuth(url);
  }, [toggleAuth, url]);

  const _removeAuth = useCallback(() => {
    removeAuth(url);
  }, [removeAuth, url]);

  return (
    <div>
      <div>
        {url}
      </div>
      <Switch
        checked={info.isAllowed}
        checkedLabel={t<string>('allowed')}
        className='info'
        onChange={switchAccess}
        uncheckedLabel={t<string>('denied')}
      />
      <div
         onClick={_removeAuth}
      >
        <RemoveAuth />
      </div>
    </div>
  );
}

export default styled(WebsiteEntry)(({ theme }: Props) => `
  display: flex;
  align-items: center;

  .url{
    flex: 1;
  }

  &.denied {
    .slider::before {
        background-color: ${theme.backButtonBackground};
      }
  }
`);
