'use strict';

// Must run BEFORE any Expo/RN module loads.
// React Native 0.81 defines URL.prototype.protocol as a getter-only property,
// but Expo's getManifestBaseUrl() tries to assign url.protocol = '...'.
// We add a no-op setter so the assignment is silently accepted.
if (typeof URL !== 'undefined') {
  try {
    const desc = Object.getOwnPropertyDescriptor(URL.prototype, 'protocol');
    if (desc && desc.get && !desc.set) {
      Object.defineProperty(URL.prototype, 'protocol', {
        ...desc,
        set: function (_val) { /* no-op */ },
        configurable: true,
      });
    }
  } catch (_e) {}
}

const { registerRootComponent } = require('expo');
const { default: App } = require('./App');
registerRootComponent(App);
