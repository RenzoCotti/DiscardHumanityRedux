const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const outputDirectory = "dist";

module.exports = {
  entry: ["babel-polyfill", "./src/client/index.js"],
  output: {
    path: path.join(__dirname, outputDirectory),
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/,
        use:
          ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [{
              loader: 'css-loader'
            }]

          })

      },
      {
        test: /\.(jpg|png|woff|woff2|eot|ttf|svg)$/,
        loader: 'file-loader?name=[name].[ext]'  // <-- retain original file name
      },

    ],
  },
  devServer: {
    port: 3000,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        secure: false,
        changeOrigin: true
      }
    }
  },

  plugins: [
    new ExtractTextPlugin({ filename: 'bundle.css' }),
    new CleanWebpackPlugin([outputDirectory]),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      favicon: 'public/images/leaf192.png'

    }),
  ],
  resolve: {
    extensions: [".js", ".jsx"]
  }
};
