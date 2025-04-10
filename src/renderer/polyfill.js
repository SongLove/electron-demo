// 为渲染进程提供 global 对象
window.global = window;

// 提供 process 对象
window.process = {
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development'
  }
};

// 提供简单的 Buffer 实现
class BufferClass {
  static from() {
    return [];
  }
}

window.Buffer = window.Buffer || BufferClass; 