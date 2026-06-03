// ============================================================
// 从 localStorage 动态加载专业数据（管理后台修改后实时同步）
// ============================================================
export interface MajorBrief {
  id: number;
  name: string;
  description: string;
  iconBg: string;
  iconText: string;
  slug: string;
}

export const loadMajors = (): MajorBrief[] => {
  try {
    const raw = localStorage.getItem('mock_majors');
    if (raw) {
      const list = JSON.parse(raw) as Array<{
        id: number; name: string; description: string; slug: string;
        iconBgColor: string; iconText: string; isVisible: boolean; sortOrder: number;
      }>;
      return list
        .filter((m) => m.isVisible !== false)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((m) => ({
          id: m.id,
          name: m.name,
          description: m.description,
          iconBg: m.iconBgColor,
          iconText: m.iconText || m.name.charAt(0),
          slug: m.slug || '',
        }));
    }
  } catch { /* ignore */ }
  return MAJORS_DATA;
};

// 31种热门专业大类数据（静态兜底，localStorage 无数据时使用）
export const MAJORS_DATA: MajorBrief[] = [
  { id: 1,  name: '哲学',              description: '人文科学',   iconBg: '#e3f2fd', iconText: '哲',   slug: 'zhexue' },
  { id: 2,  name: '经济学',            description: '社会科学',   iconBg: '#e8f5e9', iconText: '经',   slug: 'jingjixue' },
  { id: 3,  name: '法学',              description: '社会科学',   iconBg: '#f3e5f5', iconText: '法',   slug: 'faxue' },
  { id: 4,  name: '教育学',            description: '社会科学',   iconBg: '#fff3e0', iconText: '教',   slug: 'jiaoyuxue' },
  { id: 5,  name: '文学',              description: '人文科学',   iconBg: '#fce4ec', iconText: '文',   slug: 'wenxue' },
  { id: 6,  name: '历史学',            description: '人文科学',   iconBg: '#fff8e1', iconText: '史',   slug: 'lishixue' },
  { id: 7,  name: '理学',              description: '自然科学',   iconBg: '#e0f2f1', iconText: '理',   slug: 'lixue' },
  { id: 8,  name: '工学',              description: '工程技术',   iconBg: '#e8eaf6', iconText: '工',   slug: 'gongxue' },
  { id: 9,  name: '农学',              description: '生命科学',   iconBg: '#fce4ec', iconText: '农',   slug: 'nongxue' },
  { id: 10, name: '医学',              description: '生命科学',   iconBg: '#e0f7fa', iconText: '医',   slug: 'yixue' },
  { id: 11, name: '管理学',            description: '社会科学',   iconBg: '#f3e5f5', iconText: '管',   slug: 'guanlixue' },
  { id: 12, name: '艺术学',            description: '人文科学',   iconBg: '#e3f2fd', iconText: '艺',   slug: 'yishuxue' },
  { id: 13, name: '计算机类',          description: '工学',       iconBg: '#e0f7fa', iconText: '计',   slug: 'jisuanji' },
  { id: 14, name: '电子信息类',        description: '工学',       iconBg: '#e8eaf6', iconText: '电信', slug: 'dianzixinxi' },
  { id: 15, name: '机械类',            description: '工学',       iconBg: '#fff3e0', iconText: '机械', slug: 'jixie' },
  { id: 16, name: '土木类',            description: '工学',       iconBg: '#fff8e1', iconText: '土木', slug: 'tumu' },
  { id: 17, name: '建筑类',            description: '工学',       iconBg: '#e3f2fd', iconText: '建筑', slug: 'jianzhu' },
  { id: 18, name: '化工与制药类',      description: '工学',       iconBg: '#e0f2f1', iconText: '化工', slug: 'huagongzhiyao' },
  { id: 19, name: '材料类',            description: '工学',       iconBg: '#f3e5f5', iconText: '材料', slug: 'cailiao' },
  { id: 20, name: '能源动力类',        description: '工学',       iconBg: '#ffebee', iconText: '能动', slug: 'nengyuandongli' },
  { id: 21, name: '电气类',            description: '工学',       iconBg: '#fff3e0', iconText: '电气', slug: 'dianqi' },
  { id: 22, name: '自动化类',          description: '工学',       iconBg: '#e0f7fa', iconText: '自动', slug: 'zidonghua' },
  { id: 23, name: '航空航天类',        description: '工学',       iconBg: '#e8eaf6', iconText: '航太', slug: 'hangkonghangtian' },
  { id: 24, name: '交通运输类',        description: '工学',       iconBg: '#e0f2f1', iconText: '交通', slug: 'jiaotongyunshu' },
  { id: 25, name: '环境科学与工程类',  description: '工学',       iconBg: '#ffebee', iconText: '环境', slug: 'huanjingkexue' },
  { id: 26, name: '生物医学工程类',    description: '工学',       iconBg: '#fff3e0', iconText: '生医', slug: 'shengwuyixue' },
  { id: 27, name: '食品科学与工程类',  description: '工学',       iconBg: '#e8eaf6', iconText: '食品', slug: 'shipinkexue' },
  { id: 28, name: '数学类',            description: '理学',       iconBg: '#f3e5f5', iconText: '数学', slug: 'shuxue' },
  { id: 29, name: '物理学类',          description: '理学',       iconBg: '#e0f2f1', iconText: '物理', slug: 'wulixue' },
  { id: 30, name: '化学类',            description: '理学',       iconBg: '#e8f5e9', iconText: '化学', slug: 'huaxue' },
  { id: 31, name: '生物科学类',        description: '理学',       iconBg: '#e3f2fd', iconText: '生物', slug: 'shengwukexue' },
];

// ---- 内容列表数据模型 ----
export interface ContentItem {
  title: string;
  url: string;
  date: string;
  groupKey: string;
  major: string;
}

// ============================================================
// 分组名辅助：从 localStorage 读取后台配置的分组名
// ============================================================

interface VideoGroupBrief {
  id: number;
  groupKey: string;
  groupName: string;
}

export const loadGroups = (): VideoGroupBrief[] => {
  try {
    const raw = localStorage.getItem('mock_video_groups');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  // 默认兜底
  return [
    { id: 1, groupKey: 'zhangxuefeng', groupName: '【视频】张雪峰老师升学就业指导' },
    { id: 2, groupKey: 'hangneiren', groupName: '【视频】行内人讲专业与就业' },
  ];
};

export const getGroupName = (groupKey: string): string => {
  const groups = loadGroups();
  return groups.find((g) => g.groupKey === groupKey)?.groupName ?? groupKey;
};

const getGroupKeyById = (groupId: number): string => {
  const groups = loadGroups();
  return groups.find((g) => g.id === groupId)?.groupKey ?? '';
};

export const getMajorNameById = (majorId: number): string => {
  const majors = loadMajors();
  return majors.find((m) => m.id === majorId)?.name ?? '';
};

// ---- 从 localStorage 动态加载视频内容数据 ----
export const loadContentItems = (): ContentItem[] => {
  try {
    const raw = localStorage.getItem('mock_videos');
    if (raw) {
      const videos = JSON.parse(raw) as Array<{
        id: number; title: string; bilibiliUrl?: string;
        organizedDate: string; groupId: number; majorIds: number[];
        isVisible?: boolean;
      }>;
      return videos
        .filter((v) => v.isVisible !== false)
        .map((v) => ({
          title: v.title,
          url: v.bilibiliUrl && v.id ? `/videos/detail/${v.id}` : '/videos',
          date: v.organizedDate,
          groupKey: getGroupKeyById(v.groupId),
          major: v.majorIds?.length ? getMajorNameById(v.majorIds[0]) : '',
        }));
    }
  } catch { /* ignore */ }
  // 默认兜底：硬编码数据
  return DEFAULT_CONTENT_ITEMS;
};

// 默认兜底数据（localStorage 无数据时使用）
const DEFAULT_CONTENT_ITEMS: ContentItem[] = [
  { title: '公检法：法学生的主流选择', url: '/videos/detail/1', date: '2024-04-10', groupKey: 'zhangxuefeng', major: '法学' },
  { title: '考研与读博的选择',         url: '/videos', date: '2024-04-01', groupKey: 'zhangxuefeng', major: '法学' },
  { title: '法考：法律人的门槛',       url: '/videos', date: '2024-03-25', groupKey: 'zhangxuefeng', major: '法学' },
  { title: '法学本科都学什么？',       url: '/videos', date: '2024-03-20', groupKey: 'zhangxuefeng', major: '法学' },
  { title: '为什么选择法学？',         url: '/videos', date: '2024-03-15', groupKey: 'zhangxuefeng', major: '法学' },
  { title: '经济学就业前景分析',       url: '/videos', date: '2024-04-08', groupKey: 'zhangxuefeng', major: '经济学' },
  { title: '计算机专业到底学什么',     url: '/videos', date: '2024-04-05', groupKey: 'zhangxuefeng', major: '计算机类' },
  { title: '医学生成长路径全解析',     url: '/videos', date: '2024-03-30', groupKey: 'zhangxuefeng', major: '医学' },
  { title: '公检法：法学生的主流选择', url: '/videos/detail/1', date: '2024-04-10', groupKey: 'hangneiren', major: '法学' },
  { title: '考研与读博的选择',         url: '/videos', date: '2024-04-01', groupKey: 'hangneiren', major: '法学' },
  { title: '法考：法律人的门槛',       url: '/videos', date: '2024-03-25', groupKey: 'hangneiren', major: '法学' },
  { title: '法学本科都学什么？',       url: '/videos', date: '2024-03-20', groupKey: 'hangneiren', major: '法学' },
  { title: '为什么选择法学？',         url: '/videos', date: '2024-03-15', groupKey: 'hangneiren', major: '法学' },
  { title: '工学大类就业实况',         url: '/videos', date: '2024-04-12', groupKey: 'hangneiren', major: '工学' },
  { title: '管理学毕业生都在做什么',   url: '/videos', date: '2024-04-03', groupKey: 'hangneiren', major: '管理学' },
  { title: '理科生的多种出路',         url: '/videos', date: '2024-03-26', groupKey: 'hangneiren', major: '理学' },
  { title: '教育学就业方向盘点',       url: '/videos', date: '2024-03-22', groupKey: 'hangneiren', major: '教育学' },
  { title: '建筑学专业到底值不值',     url: '/videos', date: '2024-03-18', groupKey: 'hangneiren', major: '建筑类' },
];

// ---- 首页 ContentList 使用的列表 ----
const toPageItem = (item: ContentItem) => ({
  title: item.title,
  url: item.url,
  date: item.date,
});

export const getHomeLists = () => {
  const groups = loadGroups();
  const items = loadContentItems();
  return groups.map((g) => ({
    title: g.groupName,
    moreUrl: '/videos',
    items: items
      .filter((item) => item.groupKey === g.groupKey)
      .sort((a, b) => b.date.localeCompare(a.date)) // 按日期降序
      .map(toPageItem),
  }));
};

// ============================================================
// 专业主页数据（从 localStorage 加载 MajorHome）
// ============================================================
export interface MajorHomeData {
  majorId: number;
  slug: string;
  majorName: string;
  majorDesc: string;
  iconBg: string;
  iconText: string;
  featuredCard: {
    icon: string;
    boldTitle: string;
    normalTitle: string;
    cardIntro?: string;
    description: string;
    descriptions: { title: string; content: string; isVisible?: boolean }[];
    tags: string[];
    isVisible?: boolean;
  };
  columnCards: Array<{
    id: number;
    title: string;
    cardIntro?: string;
    slug?: string;
    content: string;
    descriptions?: { title: string; content: string; isVisible?: boolean; updatedAt?: string }[];
    sortOrder: number;
    isVisible: boolean;
  }>;
}

type MajorInfo = { id: number; name: string; slug: string; description: string; iconBgColor: string; iconText: string };
type HomeEntry = {
  featuredCard: { icon: string; boldTitle: string; normalTitle: string; cardIntro?: string; description: string; descriptions?: (string | { title: string; content: string; isVisible?: boolean })[]; tags: string[]; isVisible?: boolean };
  columnCards: Array<{ id: number; title: string; cardIntro?: string; slug?: string; content: string; descriptions?: { title: string; content: string; isVisible?: boolean; updatedAt?: string }[]; sortOrder: number; isVisible: boolean }>;
};

export const loadMajorHome = (slug: string): MajorHomeData | null => {
  try {
    // 1. 查找专业基本信息：优先 localStorage mock_majors，兜底 MAJORS_DATA
    let major: MajorInfo | undefined;
    const majorsRaw = localStorage.getItem('mock_majors');
    if (majorsRaw) {
      const majors = JSON.parse(majorsRaw) as MajorInfo[];
      major = majors.find((m) => m.slug === slug);
    } else {
      // localStorage 无数据时兜底 MAJORS_DATA
      major = MAJORS_DATA.find((m) => m.slug === slug) as MajorInfo | undefined;
    }
    if (!major) return null;

    // 2. 读取 MajorHome 配置（仅 localStorage）
    const homesRaw = localStorage.getItem('mock_major_homes');
    let home: HomeEntry | null = null;
    if (homesRaw) {
      const homes = JSON.parse(homesRaw) as Record<number, HomeEntry>;
      home = homes[major.id] || null;
    }

    const rawFC = home?.featuredCard;
    // 向后兼容：优先 descriptions 数组，fallback 到 description 单字符串
    let descriptions: { title: string; content: string; isVisible?: boolean }[] = [];
    const rawDescriptions = rawFC?.descriptions;
    if (rawDescriptions && rawDescriptions.length > 0) {
      if (typeof rawDescriptions[0] === 'string') {
        descriptions = (rawDescriptions as string[]).map((d) => ({ title: '', content: d }));
      } else {
        descriptions = rawDescriptions as { title: string; content: string; isVisible?: boolean }[];
      }
    } else if (rawFC?.description) {
      descriptions = [{ title: '', content: rawFC.description }];
    }

    return {
      majorId: major.id,
      slug: major.slug,
      majorName: major.name,
      majorDesc: major.description,
      iconBg: major.iconBgColor,
      iconText: major.iconText,
      featuredCard: {
        icon: rawFC?.icon || '📚',
        boldTitle: rawFC?.boldTitle || major.name,
        normalTitle: rawFC?.normalTitle || '',
        cardIntro: rawFC?.cardIntro || '',
        description: rawFC?.description || '',
        descriptions,
        tags: rawFC?.tags || [],
        isVisible: rawFC?.isVisible,
      },
      columnCards: (home?.columnCards || [])
        .filter((c) => c.isVisible !== false)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((c) => ({
          id: c.id, title: c.title, cardIntro: c.cardIntro || '', slug: c.slug || '',
          content: c.content, descriptions: c.descriptions || [],
          sortOrder: c.sortOrder, isVisible: c.isVisible,
        })),
    };
  } catch { return null; }
};

/** 获取该专业关联的视频（供右侧内容列表使用） */
export const loadMajorVideos = (majorId: number): ContentItem[] => {
  try {
    const raw = localStorage.getItem('mock_videos');
    if (raw) {
      const videos = JSON.parse(raw) as Array<{
        id: number; title: string; organizedDate: string; majorIds: number[]; isVisible?: boolean;
      }>;
      return videos
        .filter((v) => v.majorIds?.includes(majorId) && v.isVisible !== false)
        .sort((a, b) => b.id - a.id)
        .slice(0, 5)
        .map((v) => ({
          title: v.title,
          url: `/videos/detail/${v.id}`,
          date: v.organizedDate,
          groupKey: '',
          major: '',
        }));
    }
  } catch { /* ignore */ }
  return [];
};

// ============================================================
// 页脚数据（从 localStorage 读取）
// ============================================================
export const loadFooterText = (): string => {
  try {
    const raw = localStorage.getItem('mock_footer_items');
    if (raw) {
      const items = JSON.parse(raw) as Array<{ content: string; isVisible: boolean; sortOrder: number }>;
      return items
        .filter((f) => f.isVisible !== false)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((f) => f.content)
        .join(' | ');
    }
  } catch { /* ignore */ }
  return '联系站长：18521031173 | ©2026复现本 | 沪ICP备19026707号-6';
};
