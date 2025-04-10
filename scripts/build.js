const builder = require('electron-builder');
const { Platform } = builder;

builder.build({
  config: {
    // 基本配置
    appId: 'com.yourapp.id',
    productName: 'YourApp',
    artifactName: '${productName}-${version}-${arch}.${ext}',
    
    // 压缩配置
    asar: true,
    compression: 'maximum', // 最大压缩
    
    // 文件过滤
    files: [
      "dist/**/*",
      "!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}",
      "!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}",
      "!**/node_modules/*.d.ts",
      "!**/node_modules/.bin",
      "!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}",
      "!.editorconfig",
      "!**/._*",
      "!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}",
      "!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}",
      "!**/{appveyor.yml,.travis.yml,circle.yml}",
      "!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}"
    ],
    
    // 各平台配置
    win: {
      target: [
        {
          target: "nsis",
          arch: ["x64"]
        }
      ]
    },
    mac: {
      target: ["dmg"],
      category: "public.app-category.developer-tools"
    },
    linux: {
      target: ["AppImage"],
      category: "Development"
    }
  }
}); 