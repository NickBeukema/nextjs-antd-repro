module.exports = function (api) {
    api.cache(true);
  
    const presets = [
      [
        "next/babel",
        {
          "preset-env": {
            targets: {
              node: true,
            },
            modules: false,
  
            // In order to get Nivo to work, we're just pulling in core-js fully
            // in lib/polyfill.js instead of trying to be smart here :(
  
            //"corejs": "3.6.0",
            //"useBuiltIns": false
          },
        },
        // { "@babel/preset-typescript": { isTSX: true, allExtensions: true } },
      ],
    ];
  
    const plugins = [
      [
        "import",
        {
          libraryName: "antd",
          style: true,
        },
      ],
  
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            lib: "../../packages/tiicker-core/dist/",
          },
        },
      ],
      ["import-graphql"],
    ];
  
    return {
      presets,
      plugins,
      sourceType: "unambiguous",
    };
  };
  