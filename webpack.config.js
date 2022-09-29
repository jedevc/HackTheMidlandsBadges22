const path = require("path");
const spawn = require("child_process").spawnSync;

const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WatchExternalFilesPlugin = require("webpack-watch-files-plugin").default;

const isDevelopment = process.env.NODE_ENV === "development";

module.exports = {
  mode: isDevelopment ? "development" : "production",
  devtool: isDevelopment ? "inline-source-map" : undefined,
  entry: {
    app: "./src/scripts/index.js",
  },
  output: {
    globalObject: "self",
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "build/"),
    publicPath: "/",
  },
  resolve: {
    extensions: [".js", ".jsx", ".scss"],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: [/node_modules/, /public/],
        options: {
          presets: ["@babel/preset-env", "@babel/preset-react"],
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(ttf)$/,
        type: "asset/resource",
      },
      {
        test: /\.(svg)$/,
        issuer: /\.[jt]sx?$/,
        use: [
          {
            loader: "@svgr/webpack",
            options: {
              svgoConfig: {
                cleanupIDs: false,
              },
            },
          },
        ],
      },
      {
        test: /\.module\.s(a|c)ss$/,
        use: [
          isDevelopment ? "style-loader" : MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[name]__[local]--[hash:base64:8]",
              },
              sourceMap: isDevelopment,
            },
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: isDevelopment,
            },
          },
        ],
      },
      {
        test: /\.s(a|c)ss$/,
        exclude: /\.module.(s(a|c)ss)$/,
        use: [
          isDevelopment ? "style-loader" : MiniCssExtractPlugin.loader,
          "css-loader",
          {
            loader: "sass-loader",
            options: {
              sourceMap: isDevelopment,
            },
          },
        ],
      },
      {
        test: /\.wasm$/,
        type: "asset/resource",
        generator: {
          filename: "[name][ext]",
        },
      },
    ],
  },
  devServer: {
    static: "./build/",
    historyApiFallback: true,
    client: {
      overlay: {
        warnings: false,
        errors: true,
      },
    },
  },
  optimization: {
    runtimeChunk: "single",
  },
  plugins: [
    new webpack.EnvironmentPlugin([
      'PLATFORM_SERVER_URL',
      'PLATFORM_APP_ID',
    ]),
    new WatchExternalFilesPlugin({
      files: ["./src/system/**/*"],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/index.html",
    }),
    new MiniCssExtractPlugin({
      filename: isDevelopment ? "[name].css" : "[name].[fullhash].css",
      chunkFilename: isDevelopment ? "[id].css" : "[id].[fullhash].css",
    }),
    {
      apply: (compiler) => {
        compiler.hooks.compilation.tap("AfterEmitPlugin", () => {
          const child = spawn("make", ["internal-build-emscripten"], {
            stdio: "inherit",
          });
          if (child.error) {
            return child.error;
          }
          if (child.status !== null && child.status !== 0) {
            return new Error(`failed with status code ${child.status}`);
          }
        });
      },
    },
  ],
};
