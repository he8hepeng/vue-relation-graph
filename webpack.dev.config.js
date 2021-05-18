const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'test.js'
  },
  devtool: 'eval-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    progress: true,
    hot: true,
    host: '0.0.0.0',
    port: '8222',
    proxy: {
      "/api": {
        target: 'http://172.18.15.163:27995/',
        changeOrigin: true
      }
    }
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue', '.md']
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        include: [path.resolve('node_modules/@com.thunisoft.artery/artery-ui'), __dirname]
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        include: [path.resolve('node_modules/@com.thunisoft.artery/artery-ui'), __dirname]
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
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
          'style-loader',
          'css-loader',
          'less-loader'
        ]
      },
      {
        test: /.(png$)|(jpg$)|(svg$)|(woff2?$)|(ttf$)|(eot$)/,
        loader: 'file-loader'
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: './public',
          to: resolvePath('dist')
        }
      ]
    })
  ]
}

function resolvePath (dir) {
  return path.join(__dirname, dir)
}
