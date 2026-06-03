import type { NavMenu } from '../../../types';

/**
 * 将平面菜单数组构建为树形结构，并按 sortOrder 排序
 */
export function buildNavTree(menus: NavMenu[]): NavMenu[] {
  const map = new Map<number, NavMenu>();
  const roots: NavMenu[] = [];

  menus.forEach((m) => map.set(Number(m.id), { ...m, children: [] }));

  map.forEach((m) => {
    const pid =
      m.parentId === undefined || m.parentId === null
        ? null
        : Number(m.parentId);
    if (pid === null) {
      roots.push(m);
    } else {
      const parent = map.get(pid);
      if (parent) {
        parent.children!.push(m);
      } else {
        // 孤儿节点：父节点不存在的，提升为顶级菜单（与 buildTableTree 保持一致）
        console.warn('[buildNavTree] 孤儿节点，提升为顶级:', { id: m.id, parentId: pid });
        roots.push(m);
      }
    }
  });

  const sort = (items: NavMenu[]) => {
    items.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    items.forEach((i) => sort(i.children ?? []));
  };
  sort(roots);

  return roots;
}

/**
 * 获取顶级菜单（过滤可见 + 顶级 + 排序）
 */
export function getTopLevelMenus(treeData: NavMenu[]): NavMenu[] {
  return treeData
    .filter((m) => m.isVisible && (m.parentId === null || m.parentId === undefined || m.parentId === 0))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}
