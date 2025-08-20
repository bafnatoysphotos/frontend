const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.tsx', // <-- entry point (agar App.tsx se start ho to yahan index.tsx import ho)
  output: {
    path: path.resolve(__dirname, 'dist'), // ✅ Vercel will serve from "dist"
    filename: 'bundle.js',
    clean: true, // har build pe dist folder clean ho jayega
    publicPath: '/', // React Router ke liye important
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html', // ✅ public/index.html ko bundle karega
    }),
  ],
  devServer: {
    historyApiFallback: true, // React Router ke liye zaroori
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: 3000,
    open: true,
  },
};
