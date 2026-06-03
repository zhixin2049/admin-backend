// 简化版本，所有已登录用户都有全部权限
export const isAuthed = async () => {
  return true
}

export const requireRole = () => async () => {
  return true
}

export const requirePermission = () => async () => {
  return true
}
