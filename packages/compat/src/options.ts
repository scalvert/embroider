import { V1AddonConstructor } from './v1-addon';
import { Tree } from 'broccoli-plugin';
import { Options as CoreOptions, optionsWithDefaults as coreWithDefaults } from '@embroider/core';
import { PackageRules } from './dependency-rules';

// These options control how hard we will try to achieve compatibility with v1
// addons. The defaults are conservative and try to maximize compatibility, at
// the cost of slower or bigger builds. As you eliminate sources of legacy
// behavior you can benefit from the more aggressive modes.
export default interface Options extends CoreOptions {
  // Controls whether your addon's "addon" trees should be resolved statically
  // at build time.
  //
  //   false (the default): implies maximum backward compatibility at the cost
  //   of bigger builds. In this mode, we force every file into the Ember app,
  //   which is the legacy behavior.
  //
  //   true: produces smaller builds. The addon files must be imported from
  //   somewhere we can statically see during the build. In this mode, your app
  //   will only include files that are actually imported from somewhere.
  //
  // Commentary: most v1 addons already work well with this set to true, because
  // they tend to either offer Javascript that users are supposed to directly
  // `import` or components / helpers / services that get directly imported and
  // re-exported by code in App Javascript. The exceptions are addons that do
  // runtime shenanigans with `require` or scoped runtime resolutions.
  //
  // To workaround an addon that is preventing you from enabling this flag, you
  // can use addonDependencyRules.
  staticAddonTrees?: boolean;

  // Controls whether your addon's "addonTestSupport" trees should be resolved
  // statically at build time.
  //
  //   false (the default): implies maximum backward compatibility at the cost
  //   of bigger builds. All test support files will be forced into your Ember
  //   app, which is the legacy behavior.
  //
  //   true: produces smaller builds. Only files that are explicitly imported
  //   will end up in your app.
  //
  // Commentary: this is analogous to staticAddonTrees and the same guidelines
  // apply.
  staticAddonTestSupportTrees?: boolean;

  // Allows you to override how specific addons will build. Like:
  //
  //   import V1Addon from '@embroider/compat'; let compatAdapters = new Map();
  //   compatAdapters.set('some-addon', class extends V1Addon {// do stuff here:
  //   see examples in ./compat-adapters
  //   });
  //
  // This should be understood as a temporary way to keep yourself from getting
  // stuck, not an alternative to actually fixing upstream. For the most part,
  // the real solution will be converting the addon in question to natively
  // publish as v2.
  //
  // We ship with some default compatAdapters to fix otherwise incompatible
  // behaviors in popular addons. You can override the default adapters by
  // setting your own value here (including null to completely disable it).
  compatAdapters?: Map<string, V1AddonConstructor | null>;

  // temporary directory where we will work when we're rewriting your addons
  // and/or app to v2-compatible formats.
  workspaceDir?: string | null;

  // optional list of additional broccoli trees that should be incorporated into
  // the final build. This exists because the classic `app.toTree()` method
  // accepts an optional tree argument that has the same purpose.
  extraPublicTrees?: Tree[];

  // Allows you to tell Embroider about otherwise dynamic dependencies within
  // your app and addons that it can't figure out on its own. These are combined
  // with the default rules that ship with Embroider. Your own rules take
  // precedence over the built-ins. Order matters, first matching rule will
  // apply to any given addon.
  //
  // See the addon-dependency-rules directory in the @embroider/compat package
  // for the built-in rules.
  //
  // These ONLY APPLY to v1-formatted addons. An addon that ships as native v2
  // is expected to do the right thing on its own.
  //
  // Follow to the definition of PackageRules for more info.
  packageRules?: PackageRules[];
}

const defaults = Object.assign(coreWithDefaults(), {
  staticAddonTrees: false,
  staticAddonTestSupportTrees: false,
  compatAdapters: new Map(),
  extraPublicTrees: [],
  workspaceDir: null,
  optionalComponents: [],
});

export function optionsWithDefaults(options?: Options): Required<Options> {
  return Object.assign({}, defaults, options);
}
