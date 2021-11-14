module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      buildOptions: {
        appId: 'com.avd.ve',
        nsis: {
          shortcutName: 'VE-APP'
        },
        win: {
          target: [
            {
              target: 'nsis',
              arch: ['x64', 'ia32']
            }
          ]
        }
      }
    }
  },
  configureWebpack: {
    externals: {
      'better-sqlite3': 'commonjs better-sqlite3'
    }
  }
}
