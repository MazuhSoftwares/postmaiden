module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current",
        },
      },
    ],
    [
      "@babel/preset-react",
      {
        runtime: "automatic",
      },
    ],
    "@babel/preset-typescript",
  ],
  env: {
    test: {
      plugins: [
        [
          "babel-plugin-module-resolver",
          {
            alias: {
              "@/components": "./src/components",
              "@/lib/utils": "./src/lib/utils",
            },
          },
        ],
      ],
    },
  },
};
