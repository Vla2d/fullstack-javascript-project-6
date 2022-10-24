const mode = process.env.NODE_ENV || 'development';

export default {
  mode,
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
    ],
  },
};
