// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { windowOpen } from '../messaging';
import useIsExtensionPopup from './useIsExtensionPopup';

/**
 * Hook to navigate within the extension. Uses `navigate` by default,
 * opens a fullscreen window if `fullscreen` is true.
 *
 * @param target - URL or route path.
 * @param options - Optional state for navigation.
 * @param fullscreen - Open in fullscreen mode (extension popup only).
 *
 * @example
 * const handleNav = useHandleNavigation();
 * handleNav('/dashboard');           // normal navigation
 * handleNav('/dashboard', {}, true); // fullscreen popup
 */
export default function useHandleNavigation () {
  const navigate = useNavigate();
  const isExtension = useIsExtensionPopup();

  return useCallback(
    async (target: string, options?: Record<string, unknown>, fullscreen = false) => {
      // If we're in extension and want fullscreen, open new window
      if (isExtension && fullscreen) {
        return windowOpen(target);
      }

      // Otherwise, use navigate (works in both web and extension)
      return navigate(target, { state: options });
    },
    [isExtension, navigate]
  );
}
