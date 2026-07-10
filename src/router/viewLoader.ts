// 通过 import.meta.glob 收集所有视图组件，按菜单的 component 路径动态加载。
// 规避 Vite 对动态 import 变量的静态分析限制。
const modules = import.meta.glob('../views/**/*.vue')

export function loadView(component: string) {
  const key = `../views/${component}.vue`
  return modules[key] || modules['../views/blank/index.vue']
}
