const path = require('path')
const fs = require('fs')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

function removeDir (dir) {
  if (!fs.existsSync(dir)) return
  let files = fs.readdirSync(dir)
  for (var i = 0; i < files.length; i++) {
    let newPath = path.join(dir, files[i])
    let stat = fs.statSync(newPath)
    if (stat.isDirectory()) {
      removeDir(newPath)
    } else {
      fs.unlinkSync(newPath)
    }
  }
  fs.rmdirSync(dir)
}

removeDir('dist')

module.exports = {
  entry: './packages/index.js',
  output: {
    library: 'VueRelationGraph',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist'),
    filename: 'vue-relation-graph.min.js'
  },
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        include: [path.resolve('node_modules/@com.thunisoft.artery/artery-ui')]
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        include: [path.resolve('node_modules/@com.thunisoft.artery/artery-ui'), __dirname]
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      {
        test: /\.md$/,
        loader: 'raw-loader'
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader'
        ]
      },
      {
        test: /.(png$)|(jpg$)|(svg$)|(woff2?$)|(ttf$)|(eot$)/,
        loader: 'url-loader'
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    // new BundleAnalyzerPlugin(),
    new MiniCssExtractPlugin()
  ],
  optimization: {
    minimize: true,
    /**
     * @description 去掉console.log
     */
    minimizer: [
      new CssMinimizerPlugin(),
      new UglifyJsPlugin({
        parallel: true,
        sourceMap: false,
        uglifyOptions: {
          compress: {
            drop_console: true
          }
        }
      })
    ]
  }
}