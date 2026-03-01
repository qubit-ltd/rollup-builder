# Rollup Builder

[![npm package](https://img.shields.io/npm/v/@qubit-ltd/rollup-builder.svg)](https://npmjs.com/package/@qubit-ltd/rollup-builder)
[![License](https://img.shields.io/badge/License-Apache-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)
[![English Document](https://img.shields.io/badge/Document-English-blue.svg)](README.md)
[![CircleCI](https://dl.circleci.com/status-badge/img/gh/qubit-ltd/rollup-builder/tree/master.svg?style=shield)](https://dl.circleci.com/status-badge/redirect/gh/qubit-ltd/rollup-builder/tree/master)

`rollup-builder` 提供了一个工具函数，用于简化使用 [Rollup] 打包器构建 JavaScript 库的过程。
它允许您生成多种格式，如 CommonJS (CJS)、ES Module (ESM) 和 Universal Module 
Definition (UMD) 格式，可以选择是否进行代码压缩。

## 目录

- [特性](#features)
- [安装](#installation)
- [使用](#usage)
- [配置选项](#configuration)
- [混合默认导出和命名导出](#mix-default-named)
- [贡献](#contributions)
- [许可证](#license)

## <span id="features">特性</span>

- 以多种格式构建 JavaScript 库，使其在不同环境中通用。
- 轻松进行生产环境下的代码压缩。
- 自动生成用于调试的源映射。
- 使用简单的选项配置库的格式、文件名等。
- 您可以在 ESM（ES6 模块系统）模块中[混合使用默认导出和命名导出](#mix-default-named)，
  并且 [Rollup] 将生成同时与 CommonJS 和 ES6 兼容的 CJS 或 UMD 格式代码。
- 支持通过 [Rollup] 插件和自定义配置高度定制。

## <span id="installation">安装</span>

您可以将 `rollup-builder` 安装为开发依赖，使用 `npm` 或 `yarn` 安装：

```bash
npm install @qubit-ltd/rollup-builder --save-dev
# 或
yarn add @qubit-ltd/rollup-builder --dev
```

## <span id="usage">使用</span>

1. 创建一个 [Rollup] 配置文件（通常命名为 `rollup.config.mjs`），并导出一个函数，该函数定义了库的构建选项。
   您可以使用提供的 `rollupBuilder` 函数来简化此过程。

   示例 `rollup.config.mjs`：

   ```js
   import rollupBuilder from '@qubit-ltd/rollup-builder';

   export default rollupBuilder('MyLibrary', import.meta.url);
   ```

2. 自定义 `rollup.config.mjs` 文件，以满足库的特定要求。您可以指定输入文件、格式、文件名前缀和其他选项。
   有关详细信息，请参阅 [配置选项](#configuration) 部分。 

   示例 `rollup.config.mjs`：

   ```js
   import rollupBuilder from '@qubit-ltd/rollup-builder';
    
   export default rollupBuilder('MyLibrary', import.meta.url, {
     formats: ['cjs', 'esm'],
     minify: true,
     // Customize additional options as needed.
   });
   ```

3. 使用以下命令运行 [Rollup] 构建过程：

   ```bash
   rollup -c rollup.config.mjs
   ```

4. 构建后的库文件将位于 `dist` 目录中，遵循您指定的格式。例如，如果您指定了 `formats: ['cjs', 'esm']`，
   将生成以下文件：
   ```bash
    dist/my-library.cjs.js
    dist/my-library.cjs.min.js
    dist/my-library.esm.mjs
    dist/my-library.esm.min.mjs
   ```

5. 您应该修改 `package.json` 文件，以指定库的入口点。例如，如果您指定了 `formats: ['cjs', 'esm']`，
   您应该将 `package.json` 文件中的 `main`, `module` 和 `exports` 字段设置为：
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
6. 您应该将以下开发依赖项添加到您的库中：
   ```bash
   yarn add --dev @babel/core @babel/plugin-transform-runtime @babel/preset-env \
     @rollup/plugin-alias @rollup/plugin-babel @rollup/plugin-commonjs \
     @rollup/plugin-node-resolve @rollup/plugin-terser rollup rollup-plugin-analyzer
   ```
   或 
   ```bash
   npm install -D @babel/core @babel/plugin-transform-runtime @babel/preset-env \
     @rollup/plugin-alias @rollup/plugin-babel @rollup/plugin-commonjs \
     @rollup/plugin-node-resolve @rollup/plugin-terser rollup rollup-plugin-analyzer
   ```

## <span id="configuration">配置选项</span>

- `libraryName: string`：您的库的名称（在 UMD 格式中使用）。
- `importMetaUrl: string`：调用者模块的 `import.meta.url`。
- `options: object`：额外的构建选项，包括：
  - `debug: boolean`：是否启用调试模式。如果未指定此字段，默认值为 `false`。
  - `formats: [string]`：构建的格式数组。它可以是以下值的数组： 
      - `'cjs'`: CommonJS 格式。
      - `'umd'`: UMD 格式。
      - `'esm'`: ES 模块格式。
      
    如果未指定此字段，默认值为 `['cjs', 'esm']`。
  - `exports: string`：要使用的导出模式。它可以是以下值之一：
      - `'auto'`：根据输入模块导出的内容自动猜测您的意图。
      - `'default'`：如果您只使用`export default ...`导出一个事物；请注意，这可能在生成旨在与ESM输出互换的
        CommonJS输出时引起问题。
      - `'named'`：如果您使用命名导出。
      - `'none'`：如果您没有导出任何东西（例如，您正在构建一个应用程序，而不是库）。
      - `'mixed'`：如果您使用命名导出与默认导出混合。请注意，这不是 [Rollup] 官方支持的标准导出模式，而是此库添加的附加模式。
        有关更多详情，请参阅[混合默认和命名导出](#mix-default-named)。
    
    如果未指定此字段，默认值为`'auto'`。
  - `nodeEnv: string`：`NODE_ENV` 环境变量。如果未指定此字段，默认值为 `process.env.NODE_ENV`。
  - `minify: boolean`：是否对代码进行压缩。如果未指定此字段，对于生产环境，默认值为 `true`，否则为 `false`。
  - `sourcemap: boolean`：是否生成源映射。如果未指定此字段，默认值为 `true`。
  - `input: string`：库的输入文件。如果未指定此字段，默认值为 `'src/index.js'`。
  - `outputDir: string`：库的输出目录。如果未指定此字段，默认值为 `'dist'`。
  - `filenamePrefix: string`：输出文件的前缀。如果未指定此字段，默认值为库名称的短横线形式。
  - `externals: [string]`：额外的外部包，每个可以通过字符串或正则表达式指定。如果未指定此字段，默认值为空数组。
  - `useAliasPlugin: boolean`：是否使用 `@rollup/plugin-alias` 插件。如果未指定此字段，默认值为 `true`。
  - `aliasPluginOptions: object`：`@rollup/plugin-alias` 插件的选项。如果未指定此字段，默认值为：
    ```js
    {
      entries: {
        'src': fileURLToPath(new URL('src', importMetaUrl)),
      },
    }
    ```
  - `useNodeResolvePlugin: boolean`：是否使用 `@rollup/plugin-node-resolve` 插件。如果未指定此字段，默认值为 `true`。
  - `nodeResolvePluginOptions: object`：`@rollup/plugin-node-resolve` 插件的选项。如果未指定此字段，默认值为：`{}`。
  - `useCommonjsPlugin: boolean`：是否使用 `@rollup/plugin-commonjs` 插件。如果未指定此字段，默认值为 `true`。
  - `commonjsPluginOptions: object`：`@rollup/plugin-commonjs` 插件的选项。如果未指定此字段，默认值为：
    ```js
    {
      include: ['node_modules/**'],
    }
    ```
  - `useBabelPlugin: boolean`：是否使用 `@rollup/plugin-babel` 插件。如果未指定此字段，默认值为 `true`。
  - `babelPluginOptions: object`：`@rollup/plugin-babel` 插件的选项。如果未指定此字段，默认值为：
    ```js
    {
      babelHelpers: 'runtime',
      exclude: ['node_modules/**'],
      presets: [
        '@babel/preset-env',
      ],
      plugins: [
        '@babel/plugin-transform-runtime',
      ],
    }
    ```
    请注意，如果使用 `@rollup/plugin-babel` 插件，您还可以在标准的 Babel 配置文件中指定 
    Babel 的配置，例如 `babel.config.js`、`.babelrc` 等。
  - `terserOptions: object`（对象）：`@rollup/plugin-terser` 插件的选项。如果未指定此字段，
    默认值为：`{}`。是否使用 `@rollup/plugin-terser` 插件取决于选项的 `minify` 字段或 
    `NODE_ENV` 环境变量。
  - `useAnalyzerPlugin: boolean`（布尔值）：是否使用 `rollup-plugin-analyzer` 插件。
    如果未指定此字段，默认值为 `true`。
  - `analyzerOptions: object`（对象）：`rollup-plugin-analyzer` 插件的选项。
    如果未指定此字段，默认值为：
    ```js
    {
      hideDeps: true,
      limit: 0,
      summaryOnly: true,
    }
    ```
  - `useVisualizerPlugin: boolean`：是否使用`rollup-plugin-visualizer`插件。
    如果未指定此字段，默认值为`true`。
  - `visualizerPluginOptions: object`：`rollup-plugin-visualizer`插件的选项。
    如果未指定此字段，默认值为：
    ```js
    {
      filename: './doc/${filenameBase}.visualization.html',
      gzipSize: true,
      brotliSize: true,
    }
    ```
    其中`filenameBase`是编译后的库文件在`./dist`目录中的基本名称。 
  - `plugins`（对象数组）：额外的 [Rollup] 插件。如果未指定此字段，默认值为空数组。

## <span id="mix-default-named">混合默认导出和命名导出</span>

如果一个 ESM（ES6 模块系统）模块同时具有默认导出和命名导出，[Rollup] 无法正确处理它。
例如，以下是一个 ESM 模块源码：
```js
export { Foo, Bar };
export default Foo;
```
Rollup 会将其转换为以下代码：
```js
exports.Foo = Foo;
exports.Bar = Bar;
exports.default = Foo;
```
然而，一个 CommonJS 代码模块通常会这样使用该模块：
```js
const Foo = require('my-module');
```
这将导致一个错误。正确的用法应该是
```js
const Foo = require('my-module').default
```
但不幸的是，[Rollup] 会将 ESM 默认导入转换为以下形式：
```js
// 源代码
import Foo from 'my-module';
// 转换后
const Foo = require('my-module');
```
注意，上述转换没有 `.default` 后缀，这将导致错误。

如果您在 ESM 模块中同时使用默认导出和命名导出，[Rollup] 将生成下述警告消息：
```bash
(!) Mixing named and default exports
https://rollupjs.org/configuration-options/#output-exports
The following entry modules are using named and default exports together:
src/index.js

Consumers of your bundle will have to use chunk.default to access their default export, which may not be what you want. Use `output.exports: "named"` to disable this warning.
```

解决办法来自 [Rollup 官方插件的源代码]，为每个 `CJS` 格式的包添加一个简单的`output.footer`：
```js
module.exports = Object.assign(exports.default, exports);
```
这样 [Rollup] 会将混合输出转换为以下形式：
```js
exports.Foo = Foo;
exports.Bar = Bar;
exports.default = Foo;
module.exports = Object.assign(exports.default, exports);
```
于是调用者可以直接使用下面方式引入默认导出：
```js
const Foo = require('my-module');
// 或
import Foo from 'my-module';
```

有关更多详细信息，请参阅以下网页：
- [Rollup Configuration Options: output.exports]
- [Issue #1961: Question regarding mixing default and named exports]
- [StackOverflow: Mixing default and named exports with Rollup]
- [Github Repository: rollup-patch-seamless-default-export]

**注意：** 为了使用此特性，您必须在 `rollup.config.mjs` 文件中指定 `exports: 'mixed'` 选项，即：
```js
import rollupBuilder from '@qubit-ltd/rollup-builder';

export default rollupBuilder('MyLibrary', import.meta.url, { exports: 'mixed' });
```

## <span id="contributions">贡献</span>

欢迎贡献！如果您发现任何问题或有改进建议，请随时提出问题或创建拉取请求。

## <span id="license">许可证</span>

本项目根据 Apache 2.0 许可证进行许可。有关详细信息，请参阅 [LICENSE](LICENSE) 文件。

[Rollup]: https://rollupjs.org/
[Rollup 官方插件的源代码]: https://github.com/rollup/plugins/blob/master/shared/rollup.config.mjs
[Rollup Configuration Options: output.exports]: https://rollupjs.org/configuration-options/#output-exports
[Issue #1961: Question regarding mixing default and named exports]: https://github.com/rollup/rollup/issues/1961
[StackOverflow: Mixing default and named exports with Rollup]: https://stackoverflow.com/questions/58246998/mixing-default-and-named-exports-with-rollup
[Github Repository: rollup-patch-seamless-default-export]: https://github.com/avisek/rollup-patch-seamless-default-export
