import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

// rules.push({
//   test: /\.css$/,
//   use: [
//     'style-loader',
//     {
//       loader: 'css-loader',
//       options: {
//         modules: {
//           auto: true,
//           localIdentName: '[name]__[local]--[hash:base64:5]',
//         },
//       },
//     },
//   ],
// });

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.json'],
  },
};
