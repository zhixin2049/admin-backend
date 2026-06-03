# 轮播图系统 — 问题与解决方法汇总

> 日期：2026-05-22
> 涉及 commit：`f9e2057`
> 涉及文件：`Carousel.tsx`、`CarouselManage.tsx`、`api/index.ts`、`mock/index.ts`

---

## 问题总览

| # | 问题 | 严重程度 | 状态 |
|---|------|---------|------|
| 1 | 官网轮播图是静态 div，不是真正的轮播组件 | 功能缺陷 | ✅ 已修复 |
| 2 | 管理后台修改轮播图，官网不响应 | 数据断层 | ✅ 已修复 |
| 3 | 轮播图数据刷新页面丢失 | 数据丢失 | ✅ 已修复 |
| 4 | 官网刷新时轮播图先显示 4 张再跳变 | 体验缺陷 | ✅ 已修复 |
| 5 | 管理后台新增/编辑轮播图需手动填 URL | 操作不便 | ✅ 已修复 |
| 6 | 管理后台删除轮播图时页面抖动 | 体验缺陷 | ✅ 已修复 |

---

## 问题 1：官网轮播图是静态 div

### 现象

`http://localhost:5174/` 首页的"轮播图"实际上是一张不会动、不会切换的静态背景图。

### 根因

```tsx
// 修复前 — Carousel.tsx
<div style={{
  backgroundImage: 'url(https://pic.imgdb.cn/item/674b4ce8e4b4cb2d3f3a01e8.png)',
  backgroundSize: 'cover',
  height: 400,
}} />
```

没有使用任何轮播组件，就是一个固定背景的 `<div>`。

### 解决方法

替换为 antd `Carousel` 组件，使用 arrows 样式：

```tsx
<AntCarousel arrows autoplay>
  {slides.map((slide) => (
    <div key={slide.id}>
      <div style={{
        height: 400,
        backgroundImage: `url(${slide.imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />
    </div>
  ))}
</AntCarousel>
```

**关键点**：`arrows` 属性自动生成左右箭头，`autoplay` 自动轮播，无需额外引入 Swiper。

| 修复前 | 修复后 |
|-------|-------|
| 静态背景 div | antd Carousel 组件 |
| 无交互 | 左右箭头 + 自动播放 |
| 硬编码图片 | 从数据源读取 |

---

## 问题 2：管理后台修改轮播图，官网不响应

### 现象

运营在 `http://localhost:5174/admin/content/carousel` 新增/编辑/删除轮播图，但官网首页没有任何变化。

### 根因

两个组件各自独立：

```
管理后台 CarouselManage  ──►  carouselApi  ──►  mockCarousels（内存数组）
                                                    │
                                                    ✗ 没联通
                                                    │
官网首页 Carousel  ──►  硬编码静态图片
```

### 解决方法

三步打通数据链路：

1. **轮播图 API 加 localStorage 持久化**（见问题 3）
2. **官网 Carousel 从 API 读取数据**：

```tsx
const [slides, setSlides] = useState<CarouselType[]>(() => 
  getVisible(loadFromStorage())
);

useEffect(() => {
  carouselApi.list().then((list) => setSlides(getVisible(list)));
}, []);
```

3. **过滤规则**：只显示 `category === 'index'` 且 `isVisible === true` 的轮播图，按 `sortOrder` 排序。

---

## 问题 3：轮播图数据刷新页面丢失

### 现象

在管理后台添加了轮播图，刷新浏览器后数据消失。

### 根因

`carouselApi` 的所有 CRUD 方法直接操作内存数组 `mockCarousels`，没有持久化到 localStorage：

```ts
// 修复前
const mockCarousels: Carousel[] = [];

export const carouselApi = {
  list: async () => mockCarousels,           // 重启 = 空数组
  create: async (data) => {
    mockCarousels.push(item);                // 只在内存
    return item;
  },
  // ...
};
```

### 解决方法

参照管理员和角色的模式，给轮播图 API 加 localStorage 读写：

```ts
const CAROUSEL_KEY = 'mock_carousels';

function loadCarousels(): Carousel[] {
  try {
    const stored = localStorage.getItem(CAROUSEL_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return mockCarousels;  // 首次回退到默认数据
}

function saveCarousels(list: Carousel[]) {
  localStorage.setItem(CAROUSEL_KEY, JSON.stringify(list));
}
```

所有 API 方法改为 `loadCarousels()` → 操作 → `saveCarousels()` 模式。

同时写入 4 条默认数据到 `mock/index.ts`：

```ts
export const mockCarousels: Carousel[] = [
  { id: 1, imageUrl: '...', category: 'index', sortOrder: 1, isVisible: true, ... },
  { id: 2, imageUrl: '...', category: 'index', sortOrder: 2, isVisible: true, ... },
  { id: 3, imageUrl: '...', category: 'index', sortOrder: 3, isVisible: true, ... },
  { id: 4, imageUrl: '...', category: 'index', sortOrder: 4, isVisible: true, ... },
];
```

---

## 问题 4：官网刷新时轮播图先显示 4 张再跳变

### 现象

刷新 `http://localhost:5174/`，轮播图第一眼显示 4 张，然后突然变成 2 张（或更少）。

### 根因

组件初始化 `slides = []` → 判断为空数组 → 显示 4 张占位 → 异步 API 返回（运营可能只启用 2 张）→ 替换为 2 张。

```
首帧：slides = [] → 无数据 → 显示 4 张 FALLBACK
异步返回：slides = [2张] → 替换 → 视觉跳变
```

### 解决方法演进

**第一次尝试**（仍有问题）：
```tsx
const [slides, setSlides] = useState<CarouselType[] | null>(null);

if (slides === null) {
  return <div style={{ height, background: '#364d79' }} />; // 纯色占位
}
```
问题：显示了纯色占位块，用户要求不显示。

**最终方案**：同步预读 localStorage
```tsx
// 同步读 localStorage，首帧即拿数据
function loadFromStorage(): CarouselType[] {
  const stored = localStorage.getItem('mock_carousels');
  if (stored) return JSON.parse(stored);
  return [];
}

const [slides, setSlides] = useState<CarouselType[]>(() =>
  getVisible(loadFromStorage())  // 初始化直接读
);

// 异步校验，覆盖为最新值
useEffect(() => {
  carouselApi.list().then((list) => setSlides(getVisible(list)));
}, []);
```

| 方案 | 首帧效果 | 问题 |
|------|---------|------|
| `useState([])` | 4 张占位 → 跳变 | 闪烁 |
| `useState(null)` | 纯色块 → 图片 | 有占位 |
| `useState(() => loadFromStorage())` | 直接图片 | ✅ 无闪烁 |

---

## 问题 5：管理后台需手动填图片 URL

### 现象

新增/编辑轮播图时，表单中只有一个"图片URL"输入框，运营需要手动粘贴图片链接，无法上传本地图片。

### 解决方法

将 `Input` 替换为 antd `Upload` + `picture-card`：

```tsx
<Upload
  listType="picture-card"
  fileList={fileList}
  beforeUpload={beforeUpload}
  onChange={handleUploadChange}
  maxCount={1}
  accept=".jpg,.jpeg,.png"
>
  <div><PlusOutlined /><div>上传图片</div></div>
</Upload>
```

**文件处理流程**：
```
选择本地图片 → beforeUpload 校验(格式/大小)
  → RcFile → FileReader.readAsDataURL()
  → base64 字符串 → form.setFieldsValue('imageUrl', base64)
  → 提交 → localStorage
```

**校验规则**：
- 格式：仅 `image/jpeg`、`image/png`、`image/jpg`
- 大小：≤ 2MB
- `beforeUpload` 返回 `false` 阻止自动上传（数据走表单提交）

**隐藏字段**：`<Form.Item name="imageUrl" style={{ display: 'none' }}>` — 用户看不到 URL 输入框，base64 自动填入。

**编辑回显**：
```tsx
if (record.imageUrl) {
  setFileList([{
    uid: '-1',
    name: 'current-image',
    status: 'done',
    url: record.imageUrl,
  }]);
}
```

---

## 问题 6：管理后台删除轮播图时页面抖动

### 现象

点击删除按钮 → 表格短暂空白 → 数据重新出现 → 页面闪烁抖动。

### 根因

删除成功后调用 `fetchData()` 重新拉取全量数据，触发 Table 的 `loading` 状态：

```tsx
// 修复前
const handleDelete = async (id: number) => {
  await carouselApi.remove(id);
  message.success('已删除');
  fetchData();  // setLoading(true) → 表格闪烁
};
```

### 解决方法

直接从本地 state 中移除，避免触发 loading：

```tsx
// 修复后
const handleDelete = async (id: number) => {
  await carouselApi.remove(id);
  message.success('已删除');
  setData((prev) => prev.filter((item) => item.id !== id));
};
```

| 方案 | loading | 体验 |
|------|---------|------|
| `fetchData()` 重新拉取 | ✅ 有 | 闪烁抖动 |
| `setData(filter)` 本地移除 | ❌ 无 | 即时平滑 |

---

## 数据流终态

```
┌─────────────────────────────────────────────────────┐
│                    运营后台                           │
│  CarouselManage.tsx                                  │
│    Upload 上传 ─► FileReader ─► base64               │
│    form.submit ─► carouselApi.create/update/remove   │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
             localStorage mock_carousels
                       │
          ┌────────────┴────────────┐
          │ 同步预读                  │ 异步校验
          ▼                         ▼
   首帧直接渲染              useEffect 覆盖
   无闪烁 ✅                 保证数据最新 ✅
          │                         │
          └────────┬────────────────┘
                   ▼
            官网 Carousel.tsx
         antd Carousel arrows autoplay
```

---

## 涉及文件清单

| 文件 | 改动 |
|------|------|
| `src/components/home/Carousel.tsx` | 静态div → antd Carousel + 同步预读 + 回退占位 |
| `src/pages/content/carousel/CarouselManage.tsx` | URL输入 → Upload图片上传 + 删除防抖 |
| `src/api/index.ts` | 轮播图 API 加 localStorage 持久化 |
| `src/mock/index.ts` | 写入 4 条默认轮播图数据 |
