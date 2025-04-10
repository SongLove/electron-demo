const fs = require('fs');
const path = require('path');
const glob = require('glob');
const util = require('util');

// 将 glob 转换为 Promise 版本
const globPromise = util.promisify(glob);

exports.default = async function(context) {
  // 获取打包后的应用路径
  const appOutDir = context.appOutDir;
  
  // 需要删除的文件和目录列表
  const pathsToRemove = [
    // 基础文件
    'locales',
    'resources/inspector',
    'LICENSE*',
    'LICENSES.chromium.html',
    'version',
    '*.pdb',
    // Node 模块相关
    '**/node_modules/**/*.md',
    '**/node_modules/**/*.d.ts',
    '**/node_modules/**/*.map',
    '**/node_modules/**/test/**',
    '**/node_modules/**/tests/**',
    '**/node_modules/**/docs/**',
    '**/node_modules/**/.bin/**',
    '**/node_modules/**/example/**',
    '**/node_modules/**/examples/**',
    // 开发文件
    '**/*.dev.js',
    '**/*.development.js',
    '**/*.test.js',
    '**/*.spec.js',
    // 源码映射
    '**/*.js.map',
    '**/*.css.map',
    // 临时文件
    '**/._*',
    '**/.DS_Store',
    // 文档
    '**/*.md',
    '**/*.markdown',
    '**/*.txt',
    // 配置文件
    '**/.npmignore',
    '**/.gitignore',
    '**/.gitattributes',
    '**/.editorconfig',
    // TypeScript 源文件
    '**/*.ts',
    '**/*.tsx',
    '!**/dist/**/*.js'
  ];
  
  // 执行删除操作
  for (const fileOrDir of pathsToRemove) {
    const pattern = path.join(appOutDir, '**', fileOrDir);
    try {
      // 使用 glob 查找匹配的文件
      const items = await globPromise(pattern, { dot: true });
      
      for (const item of items) {
        try {
          if (fs.existsSync(item)) {
            if (fs.lstatSync(item).isDirectory()) {
              fs.rmdirSync(item, { recursive: true });
            } else {
              fs.unlinkSync(item);
            }
            console.log(`已删除: ${item}`);
          }
        } catch (error) {
          console.error(`删除失败: ${item}`, error);
        }
      }
    } catch (error) {
      console.error(`查找文件失败: ${pattern}`, error);
    }
  }
}; 