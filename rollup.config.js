import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import external from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'
import resolve from 'rollup-plugin-node-resolve';
import url from 'rollup-plugin-url'
import svgr from '@svgr/rollup'

import pkg from './package.json'

export default {
  input: 'src/index.js',
  output: [
    // { file: pkg.browser,format: 'umd',name: 'pullPerson' },
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: false
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: false
    }
  ],
  external: [
    "antd",
    "antd-mobile",
    "react",
    "prop-types",
    "react-dom",
    "jquery"
  ],
  globals: {
    jquery: '$'
  },
  plugins: [
    resolve(),
    external(),
    postcss({
      modules: true
    }),
    url(),
    svgr(),
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      presets: [
        [
          "@babel/preset-env",
          {
            modules: false,
            corejs: 3,
            useBuiltIns: 'usage',
            targets: {
              browsers: [
                "last 2 versions",
                "iOS >= 7",
                "Android >= 5"
              ]
            }
          }
        ],
        "@babel/preset-react"
      ],
      plugins: [
        // require.resolve("@babel/plugin-external-helpers"),
        // require.resolve("@babel/plugin-syntax-import-meta"),

        [
          "babel-plugin-named-asset-import",
          {
            loaderMap: {
              svg: {
                ReactComponent:
                  "@svgr/webpack?-svgo![path]"
              }
            }
          }
        ],
        "@babel/plugin-proposal-object-rest-spread",
        "@babel/plugin-syntax-dynamic-import",
        [
          "@babel/plugin-proposal-class-properties",
          {
            "loose": true
          }
        ],
        "react-loadable/babel",
        "babel-plugin-transform-object-assign",
        [
          "@babel/plugin-proposal-decorators",
          { legacy: true }
        ],
        "@babel/plugin-proposal-optional-chaining",
        [
          "import",
          {
            libraryName: "antd",
            libraryDirectory: "es",
            style: "css"
          },
          "ant"
        ],
        [
          "import",
          {
            libraryName: "antd-mobile",
            libraryDirectory: "es",
            style: "css"
          },
          "antd-mobile"
        ]
      ]
    }),
    commonjs()
  ]
}
