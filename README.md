# Rollup Builder

[![npm package](https://img.shields.io/npm/v/@qubit-ltd/rollup-builder.svg)](https://npmjs.com/package/@qubit-ltd/rollup-builder)
[![License](https://img.shields.io/badge/License-Apache-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)
[![中文文档](https://img.shields.io/badge/文档-中文版-blue.svg)](README.zh_CN.md)
[![CircleCI](https://dl.circleci.com/status-badge/img/gh/qubit-ltd/rollup-builder/tree/master.svg?style=shield)](https://dl.circleci.com/status-badge/redirect/gh/qubit-ltd/rollup-builder/tree/master)

`rollup-builder` provides a utility function to simplify the process of building 
JavaScript libraries using the [Rollup] bundler. It allows you to generate various 
formats such as CommonJS (CJS), ES Module (ESM), and Universal Module Definition
(UMD), and gives you the option to choose whether to perform code minification.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration Options](#configuration)
- [Mixing Default and Named Exports](#mix-default-named)
- [Contributions](#contributions)
- [License](#license)

## <span id="features">Features</span>

- Build JavaScript libraries in multiple formats, making them compatible with a 
  variety of environments.
- Minify your library for production use with ease.
- Automatic generation of sourcemaps for debugging.
- Configure the library's format, filename, and more using simple options.
- You can [mix default and named exports](#mix-default-named) in ESM modules and 
  the [Rollup] will generate code in CJS or UMD format that compatible with both
  CommonJS and ES6.
- Highly customizable using [Rollup] plugins and custom configurations.

## <span id="installation">Installation</span>

You can install `rollup-builder` as a development dependency using `npm` or `yarn`:

```bash
npm install @qubit-ltd/rollup-builder --save-dev
# or
yarn add @qubit-ltd/rollup-builder --dev
```

## <span id="usage">Usage</span>

1. Create a [Rollup] configuration file (usually named `rollup.config.mjs`) and 
   export a function that defines the library's build options. You can use the 
   provided `rollupBuilder` function to streamline this process.

   Example `rollup.config.mjs`:

   ```js
   import rollupBuilder from '@qubit-ltd/rollup-builder';

   export default rollupBuilder('MyLibrary', import.meta.url);
   ```

2. Customize the `rollup.config.mjs` file to match your library's specific 
   requirements. You can specify the input file, formats, filename prefix, and 
   other options. Refer to the [Configuration Options](#configuration) section
   for more details.

   Example `rollup.config.mjs`:
    
   ```js
   import rollupBuilder from '@qubit-ltd/rollup-builder';
    
   export default rollupBuilder('MyLibrary', import.meta.url, {
     formats: ['cjs', 'esm'],
     minify: true,
     // Customize additional options as needed.
   });
   ```

3. Run the [Rollup] build process using the following command:

   ```bash
   rollup -c rollup.config.mjs
   ```

4. The resulting library files will be placed in the `dist` directory, following 
   the format you specified. For example, if you specified `formats: ['cjs', 'esm']`,
   the following files will be generated:
   ```bash
    dist/my-library.cjs.js
    dist/my-library.cjs.min.js
    dist/my-library.esm.mjs
    dist/my-library.esm.min.mjs
   ```
   
5. You should modify your `package.json` file to specify the entry point of your
   library. For example, if you specified `formats: ['cjs', 'esm']`, you should
   add the following lines to your `package.json` file:
   ```json
   {
     "main": "dist/my-library.cjs.min.js",
     "module": "dist/my-library.esm.min.mjs",
     "exports": {
         ".": {
            "require": "./dist/my-library.cjs.min.js",
            "import": "./dist/my-library.esm.min.mjs"
         }
     }
   }
   ``` 
6. You should add the following dev dependencies to your library:
   ```bash
   yarn add --dev @babel/core @babel/plugin-transform-runtime @babel/preset-env \
     @rollup/plugin-alias @rollup/plugin-babel @rollup/plugin-commonjs \
     @rollup/plugin-node-resolve @rollup/plugin-terser rollup rollup-plugin-analyzer
   ```
   or 
   ```bash
   npm install -D @babel/core @babel/plugin-transform-runtime @babel/preset-env \
     @rollup/plugin-alias @rollup/plugin-babel @rollup/plugin-commonjs \
     @rollup/plugin-node-resolve @rollup/plugin-terser rollup rollup-plugin-analyzer
   ```

## <span id="configuration">Configuration Options</span>

- `libraryName: string`: The name of your library (used in the UMD format).
- `importMetaUrl: string`: The `import.meta.url` of the caller module.
- `options: object`: Additional build options, including:
    - `debug: boolean`: Whether to print debug information. If this field is not
      specified, the default value is `false`.
    - `formats: [string]`: An array of formats to build. It can be an array 
      of the following values:
        - `'cjs'`: the CommonJS format.
        - `'umd'`: the UMD format.
        - `'esm'`: the ES module format.
      
      If this field is not specified, the default value is `['cjs', 'esm']`.
    - `exports: string`: the export mode to use. It can be one of the following
      values:
        - `'auto'`: automatically guesses your intentions based on what the 
          input module exports.
        - `'default'`: if you are only exporting one thing using
          `export default ...`; note that this can cause issues when generating 
          CommonJS output that is meant to be interchangeable with ESM output.
        - `'named'`: if you are using named exports.
        - `'none'`: if you are not exporting anything (e.g. you are building an
          app, not a library)
        - `'mixed'`: if you are using named exports mixed with a default export.
          Note that this is not a standard exports mode officially supported by
          [Rollup], instead, it is an additional mode add by this library.
          Refer to the [Mixing Default and Named Exports](#mix-default-named) for
          more details.
      
      If this field is not specified, the default value is `'auto'`.
    - `nodeEnv: string`: The `NODE_ENV` environment variable. If this field is 
      not specified, the default value is `process.env.NODE_ENV`.
    - `minify: boolean`: Whether to minify the code. If this field is not 
      specified, the default value will be `true` for production environment, 
      and `false` otherwise.
    - `sourcemap: boolean`: Whether to generate sourcemaps. If this field is not
      specified, the default value is `true`.
    - `input: string`: The input file of the library. If this field is not
      specified, the default value is `src/index.js`.
    - `outputDir: string`: The output directory of the library. If this field 
      is not specified, the default value is `dist`.
    - `filenamePrefix: string`: The prefix for the output filename. If this 
      field is not specified, the default value the dash-case of the library 
      name.
    - `externals: [string]`: the additional external packages, each can be 
      specified with either a string or a regular expression. If this field is
      not specified, the default value is an empty array.
    - `useAliasPlugin: boolean`: whether to use the `@rollup/plugin-alias` 
      plugin. If this field is not specified, the default value is `true`.
    - `aliasPluginOptions: object`: the options for the `@rollup/plugin-alias` 
      plugin. If this field is not specified, the default value is:
      ```js
      {
        entries: {
          'src': fileURLToPath(new URL('src', importMetaUrl)),
        },
      }
      ```
    - `useNodeResolvePlugin: boolean`: whether to use the `@rollup/plugin-node-resolve`
      plugin. If this field is not specified, the default value is `true`.
    - `nodeResolvePluginOptions: object`: the options for the `@rollup/plugin-node-resolve`
      plugin. If this field is not specified, the default value is: `{}`.
    - `useCommonjsPlugin: boolean`: whether to use the `@rollup/plugin-commonjs` plugin.
      If this field is not specified, the default value is `true`.
    - `commonjsPluginOptions: object`: the options for the `@rollup/plugin-commonjs`
      plugin. If this field is not specified, the default value is:
      ```js
      {
        include: ['node_modules/**']
      }
      ```
    - `useBabelPlugin: boolean`: whether to use the `@rollup/plugin-babel` plugin.
      If this field is not specified, the default value is `true`.
    - `babelPluginOptions: object`: the options for the `@rollup/plugin-babel` plugin.
      If this field is not specified, the default value is:
      ```js
      {
        babelHelpers: 'runtime',
        exclude: ['node_modules/**'],
        presets: [
          '@babel/preset-env',
        ],
        plugins: [
          '@babel/plugin-transform-runtime',
        ]
      }
      ```
      Note that if use the `@rollup/plugin-babel` plugin, you can also specify
      the configuration of Babel in the standard Babel configuration files,
      such as `babel.config.js`, `.babelrc`, etc.
    - `terserOptions: object`: the options for the `@rollup/plugin-terser` plugin.
      If this field is not specified, the default value is: `{}`. Whether
      to use the `@rollup/plugin-terser` plugin depends on the `minify`
      field of the options or the `NODE_ENV` environment variable.
    - `useAnalyzerPlugin: boolean`: whether to use the `rollup-plugin-analyzer` plugin.
      If this field is not specified, the default value is `true`.
    - `analyzerOptions: object`: the options for the `rollup-plugin-analyzer` plugin.
      If this field is not specified, the default value is:
      ```js
      {
        hideDeps: true,
        limit: 0,
        summaryOnly: true,
      }
      ```
    - `useVisualizerPlugin: boolean`: whether to use the `rollup-plugin-visualizer` plugin.
      If this field is not specified, the default value is `true`.
    - `visualizerPluginOptions: object`: the options for the `rollup-plugin-visualizer` plugin.
      If this field is not specified, the default value is:
      ```js
      {
        filename: './doc/${filenameBase}.visualization.html',
        gzipSize: true,
        brotliSize: true,
      }
      ```
      where the `filenameBase` is the basename of the compiled library file in the
      `./dist` directory.
    - `plugins: [object]`: the additional [Rollup] plugins. If this field is not
      specified, the default value is an empty array.

## <span id="mix-default-named">Mixing Default and Named Exports</span>

If an ESM module has both default export and named exports, [Rollup] cannot
handle it correctly. For example, the following is a source ESM module:
```js
export { Foo, Bar };
export default Foo;
```
The rollup will translate it into the following codes:
```js
exports.Foo = Foo;
exports.Bar = Bar;
exports.default = Foo;
```
However, a common-js consumer will use the module as follows:
```js
const Foo = require('my-module');
```
which will cause an error. The correct usage should be
```js
const Foo = require('my-module').default
```
But unfortunately, [Rollup] will translate the ESM default import as follows:
```js
// source
import Foo from 'my-module';

// translated
const Foo = require('my-module');
```
Note that the above translation has no `.default` suffix, which will cause an error.

If you mix default and named exports in an ESM module, [Rollup] will generate
a warning message as follows:
```bash
(!) Mixing named and default exports
https://rollupjs.org/configuration-options/#output-exports
The following entry modules are using named and default exports together:
src/index.js

Consumers of your bundle will have to use chunk.default to access their default export, which may not be what you want. Use `output.exports: "named"` to disable this warning.
```

The workaround is copied from the [source code of the official rollup plugins].
It makes the rollup option `output.exports` to `'named'` and adds a simple footer 
statements to each `CJS` format bundle:
```js
module.exports = Object.assign(exports.default, exports);
```
With this workaround, [Rollup] will transform mixed exports into the following form:
```js
exports.Foo = Foo;
exports.Bar = Bar;
exports.default = Foo;
module.exports = Object.assign(exports.default, exports);
```
Thus, the caller can directly use the following methods to import the default export:
```js
const Foo = require('my-module');
// or
import Foo from 'my-module';
```

See the following web pages for more details:
- [Rollup Configuration Options: output.exports]
- [Issue #1961: Question regarding mixing default and named exports]
- [StackOverflow: Mixing default and named exports with Rollup]
- [Github Repository: rollup-patch-seamless-default-export]

**NOTE:** In order to use this feature, you must specify the `exports` option to
`'mixed'` in the `rollup.config.mjs` file, i.e.,
```js
import rollupBuilder from '@qubit-ltd/rollup-builder';

export default rollupBuilder('MyLibrary', import.meta.url, { exports: 'mixed' });
```

## <span id="contributions">Contributions</span>

Contributions are welcome! If you find any issues or have suggestions for
improvements, please feel free to open an issue or create a pull request.

## <span id="license">License</span>

This project is licensed under the Apache 2.0 License. 
See the [LICENSE](LICENSE) file for details.


[Rollup]: https://rollupjs.org/
[source code of the official rollup plugins]: https://github.com/rollup/plugins/blob/master/shared/rollup.config.mjs
[Rollup Configuration Options: output.exports]: https://rollupjs.org/configuration-options/#output-exports
[Issue #1961: Question regarding mixing default and named exports]: https://github.com/rollup/rollup/issues/1961
[StackOverflow: Mixing default and named exports with Rollup]: https://stackoverflow.com/questions/58246998/mixing-default-and-named-exports-with-rollup
[Github Repository: rollup-patch-seamless-default-export]: https://github.com/avisek/rollup-patch-seamless-default-export
