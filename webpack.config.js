const path = require('path')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin')

const mock = require('./mock')

module.exports = ({env} = {}) => {
  const prod = env === 'prod' || env === 'github'

  const cssLoader = {
    loader: 'css-loader',
    options: {
      modules: true,
    },
  }

  const lessLoader = {
    loader: 'less-loader',
    options: {
      lessOptions: {
        javascriptEnabled: true,
        // for antd
        modifyVars: {
          'border-radius-base': '4px'
        }
      }
    }
  }

  const config = {
    cache: !prod,

    entry: ['./src/app.tsx'],

    target: prod ? 'browserslist' : 'web',

    experiments: {
      topLevelAwait: true
    },

    output: {
      path: path.resolve('dist'),
      filename: '[name].[contenthash:8].js',
      chunkFilename: '[name].[contenthash:8].js',
      publicPath: env === 'github' ? '/lottery' : '/'
    },

    resolve: {
      extensions: ['.mjs', '.js', '.ts', '.tsx'],
      alias: {
        '@': path.resolve('.'),
        '~': path.resolve('./src'),
      }
    },

    devtool: prod ? false : 'source-map',

    stats: 'errors-only',

    module: {
      rules: [
        {
          test: /\.(tsx?|m?js)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true
            }
          },
        },
        // for custom
        {
          test: /\.less$/,
          exclude: /node_modules/,
          use: prod ?
            [MiniCssExtractPlugin.loader, cssLoader, 'postcss-loader', lessLoader] :
            ['style-loader', cssLoader, 'postcss-loader', lessLoader]
        },
        // for node_modules
        {
          test: /\.less$/,
          include: /node_modules/,
          use: prod ?
            [MiniCssExtractPlugin.loader, 'css-loader', lessLoader] :
            ['style-loader', 'css-loader', lessLoader]
        },
        {
          test: /\.css$/,
          exclude: /node_modules/,
          use: prod ? [MiniCssExtractPlugin.loader, cssLoader, 'postcss-loader'] : ['style-loader', cssLoader, 'postcss-loader']
        },
        {
          test: /\.css$/,
          include: /node_modules/,
          use: prod ? [MiniCssExtractPlugin.loader, 'css-loader'] : ['style-loader', 'css-loader']
        },
        {
          test: /\.(jpe?g|png|svg|gif)$/,
          use: ['url-loader']
        }
      ]
    },

    plugins: [
      new webpack.ProvidePlugin({
        React: 'react',
        ReactDOM: 'react-dom'
      }),

      new HtmlWebpackPlugin({
        hash: true,
        template: './src/layout.html',
        filename: 'index.html',
        inject: 'body',
        minify: true
      }),

      new webpack.DefinePlugin({
        ENV: JSON.stringify(env)
      })
    ],

    optimization: {
      runtimeChunk: true,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /node_modules/,
            name: 'vendor',
            chunks: 'all',
            reuseExistingChunk: true
          },
          common: {
            name: 'common',
            priority: -1,
            chunks: 'all',
            reuseExistingChunk: true
          }
        }
      }
    },

    mode: prod ? 'production' : 'development'
  }

  // 线上环境
  if (env === 'prod' || env === 'github') {
    Object.assign(config.optimization, {
      minimize: true,
      minimizer: [
        new CssMinimizerWebpackPlugin(),
        new TerserPlugin({
          parallel: 8,
          extractComments: false,
          terserOptions: {
            output: {
              comments: false
            }
          },
        })
      ]
    })

    config.plugins.push(
      new MiniCssExtractPlugin({
        filename: 'style.[contenthash:8].css'
      })
    )
  } else { // 本地环境
    const StylelintPlugin = require('stylelint-webpack-plugin')
    const ProgressBarPlugin = require('progress-bar-webpack-plugin')

    config.module.rules.unshift({
      enforce: 'pre',
      test: /\.tsx?$/,
      use: ['eslint-loader'],
      exclude: /node_modules/,
    })

    config.plugins.push(
      new StylelintPlugin({
        files: ['**/*.less']
      }),
      new webpack.HotModuleReplacementPlugin(),
      new ProgressBarPlugin(),
    )

    Object.assign(config.resolve.alias, {
      'react-dom': '@hot-loader/react-dom'
    })

    config.devServer = {
      // hot: true,
      before: mock,
      host: '0.0.0.0',
      contentBase: '.',
      stats: 'errors-only',
      historyApiFallback: true,
      overlay: {
        errors: true
      }
    }
  }

  return config
}
