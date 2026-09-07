import type { ModuleOptions } from 'webpack';

export const rules: Required<ModuleOptions>['rules'] = [
  {
    test: /\.module\.css$/,
    use: [{ loader: 'style-loader' }, { loader: 'css-loader', options: { modules: true } }],
  },
  {
    test: /\.css$/,
    exclude: /\.module\.css$/,
    use: [
      { loader: 'style-loader' },
      { loader: 'css-loader' }, // modules: false (default) — plain global CSS
    ],
  },
  {
    test: /native_modules[/\\].+\.node$/,
    use: 'node-loader',
  },
  {
    test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: '@vercel/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: 'native_modules',
      },
    },
  },
  // TypeScript & TSX Loader
  {
    test: /\.tsx?$/,
    exclude: /(node_modules|\.webpack)/,
    use: {
      loader: 'ts-loader',
      options: {
        transpileOnly: true,
      },
    },
  },
  // Asset Rule: Images & Media
  {
    test: /\.(png|jpe?g|gif|svg|webp|ico)$/i,
    type: 'asset/resource',
  },
  // Asset Rule: Fonts
  {
    test: /\.(woff|woff2|eot|ttf|otf)$/i,
    type: 'asset/resource',
  },
];
