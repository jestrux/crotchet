// Import all extensions to register them
import './clipboard';
import './pinboard';
import './quick-actions';

import { dispatch } from '@/lib/registry';

// Notify that extensions are loaded
dispatch('extensions-loaded');
dispatch('extensions-updated');

export function loadExtensions() {
  console.log('Extensions loaded successfully');
}
