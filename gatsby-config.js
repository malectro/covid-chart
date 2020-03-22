/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

module.exports = {
  pathPrefix: 'covid/',
  plugins: [
    'gatsby-plugin-typescript',
    {
      resolve: 'gatsby-plugin-postcss',
      options: {
        postCssPlugins: [
          require('postcss-preset-env')({
            stage: 2,
            features: { 'nesting-rules': true },
          }),
        ],
      },
    },
  ],
};
