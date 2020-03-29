const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const outputDirectory = "dist";

const config = require("./src/server/config/config");

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
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: [
            {
              loader: "css-loader"
            }
          ]
        })
      },
      {
        test: /\.(jpg|png|woff|woff2|eot|ttf|svg)$/,
        loader: "file-loader?name=[name].[ext]" // <-- retain original file name
      }
    ]
  },
  devServer: {
    host: config.ip,
    port: 3000,
    open: true,
    https: false,
    proxy: {
      "/api": {
        target: "http://" + config.ip + ":5000",
        secure: false,
        changeOrigin: true
      },
      "/socket.io": {
        target: "ws://" + config.ip + ":5000",
        secure: false,
        changeOrigin: true
      }
    }
  },

  plugins: [
    new ExtractTextPlugin({ filename: "bundle.css" }),
    new CleanWebpackPlugin([outputDirectory]),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      favicon: "public/images/icon192.png"
    })
  ],
  resolve: {
    extensions: [".js", ".jsx"]
  }
};
