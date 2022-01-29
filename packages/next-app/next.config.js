const dotenv = require("dotenv");
dotenv.config({ path: "../../.env" });

// const withNextAntdLess = require("./next-antd-less.config");
const fs = require("fs");
const path = require("path");
const withSourceMaps = require("@zeit/next-source-maps")();
const lessToJS = require("less-vars-to-js");
const withModernizr = require("next-plugin-modernizr");
const withCustomBabelConfig = require("next-plugin-custom-babel-config");
const withPlugins = require("next-compose-plugins");

const withAntdLess = require("next-plugin-antd-less");

// The 'fresnel' dynamic media query library triggers some IE11 issues. It looks
// like it should work with a polyfill for Object.entries (which we have in
// polyfills.js.) But, alas, 'twas not to be.
const withTM = require("next-transpile-modules")([
  "fresnel",

  // These libraries are part of the Nivo charting lib. We apparently need these
  // here, plus we need to import core-js in lib/polyfills.
  "d3-array",
  "d3-delaunay",
  "d3-scale",
  "d3-shape",
  "delaunator",

  "react-hook-form",
//   "@tiicker/util",
  "react-pdf",
]);

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

// Where your antd-custom.less file lives
const themeVariables = lessToJS(
  fs.readFileSync(path.resolve(__dirname, "./styles/theme.less"), "utf8")
);

let config = withModernizr(
  withAntdLess({
    webpack5: false,
    // lessVarsFilePath: "./styles/theme.less",
    modifyVars: themeVariables,
    // modules: false,
    // cssLoaderOptions: {
    //   modules: false,
    // cssModules: false,
    // },
    // lessLoaderOptions: {
    //   lessOptions: {
    //     // javascriptEnabled: true,
    //     // modifyVars: themeVariables,
    //   },
    // },
    // cssModules: false,
    // getLocalIdent: (context, _, exportName, options) => {
    //   return "[local]___[hash:base64:5]";
    // },
    // cssLoaderOptions: {
    // importLoaders: 1,
    // localIdentName: "[local]___[hash:base64:5]",
    // },
    webpack: (config, { isServer }) => {
      // mks 2020-03-04 - This is one way of doing polyfills. I *believe* that
      // this isn't needed as Babel presets, the transpile-module (above), and
      // the TS target seem to handle it for us.
      const originalEntry = config.entry;

      config.entry = async () => {
        const entries = await originalEntry();
        if (
          entries["main.js"] &&
          !entries["main.js"].includes("./source/polyfills.js")
        ) {
          entries["main.js"].unshift("./source/polyfills.js");
        }
        return entries;
      };

      // Allows for absolute file path resolution
      config.resolve.modules.push(path.resolve("./"));
      config.resolve.alias["source"] = "source";

      config.module.rules.push({
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: "graphql-tag/loader",
      });

      const babelRule = config.module.rules.find((rule) =>
        rule.use && Array.isArray(rule.use)
          ? rule.use.find((u) => (u.loader = "next-babel-loader"))
          : rule.use.loader === "next-babel-loader"
      );

      if (babelRule) {
        babelRule.include.push(path.resolve("../"));
        babelRule.include.push(path.resolve("../../"));
      }

      // config.module.rules.push({
      //   test: /\.(js|jsx|ts|tsx)$/,
      //   include: [workspace],
      //   exclude: /node_modules/,
      //   use: options.defaultLoaders.babel,
      // });

      if (!isServer) {
        config.node = {
          fs: "empty",
        };

        // https://github.com/zeit/next.js/blob/canary/examples/with-sentry-simple/next.config.js
        // config.resolve.alias["@sentry/node"] = "@sentry/browser";
      }

      // Handles our PDF worker, allowing us to view uploaded PDFs
      config.module.rules.unshift({
        test: /pdf\.worker\.(min\.)?js/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[contenthash].[ext]",
              publicPath: "_next/static/worker",
              outputPath: "static/worker",
            },
          },
        ],
      });

      return config;
    },

    // Use this object to get compile-time constants visible on the front-end
    env: {},
  })
);

config.redirects = async () => {
  return [];
};

let plugins = [
  // [withTM, { transpileModules: ["@tiicker"] }],
];

// if (process.env.NODE_ENV !== "production") {
plugins = [
  ...plugins,
  [
    withCustomBabelConfig,
    { babelConfigFile: path.resolve("../../babel.config.js") },
  ],
];
// }

// if (process.env.ALLOW_TEST_ROUTES !== "true") {
// config = withTM(withSourceMaps(config));
config = withTM(config);
// }

module.exports = withPlugins(
  plugins,
  withSourceMaps(withBundleAnalyzer(config))
);
