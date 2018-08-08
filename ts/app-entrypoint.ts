import BroccoliPlugin from 'broccoli-plugin';
import Package from './package';
import walkSync from 'walk-sync';
import { writeFileSync, ensureDirSync } from 'fs-extra';
import { join, dirname } from 'path';
import { compile } from './js-handlebars';
import makeDebug from 'debug';

const todo = makeDebug('ember-cli-vanilla:todo');

const entryTemplate = compile(`
{{#each specifiers as |specifier|}}
  {{{may-import-sync specifier}}}
{{/each}}
`);

export interface Options {
  appPackage: Package;
  outputPath: string;
}

export default class extends BroccoliPlugin {
  constructor(appTree, private opts: Options) {
    super([appTree], {});
  }

  build() {
    // for the app tree, we take everything
    let specifiers = walkSync(this.inputPaths[0], {
      globs: ['**/*.js'],
      directories: false
    }).map(specifier => `../${specifier.replace(/\.js$/, '')}`);

    // for the src tree, we can limit ourselves to only known resolvable
    // collections
    todo("app src tree");

    let appJS = join(this.outputPath, this.opts.outputPath);
    ensureDirSync(dirname(appJS));
    writeFileSync(appJS, entryTemplate({ specifiers }), 'utf8');
  }
}
