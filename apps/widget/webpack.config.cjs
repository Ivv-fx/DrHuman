const path = require("path");
const Dotenv = require("dotenv-webpack");

module.exports = {
  entry: "./src/embed.tsx",
  output: {
    filename: "widget.js",
    path: path.resolve(__dirname, "public"),
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "swc-loader",
          options: {
            jsc: {
              parser: {
                syntax: "typescript",
                tsx: true,
              },
              transform: {
                react: {
                  runtime: "automatic",
                },
              },
            },
          },
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      "@": path.resolve(__dirname, "./"),
      "@repo": path.resolve(__dirname, "../../packages"),
    },
  },
  plugins: [
    new Dotenv({
      path: "./.env.local",
    }),
  ],
  devServer: {
    static: "./public",
    port: 3002, // Different from Next.js port
    hot: true,
  },
};
