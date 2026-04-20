export type KnowledgeDocument = {
  id: string;
  name: string;
  title: string;
  type: string;
  summary: string;
  tags: string[];
  extension: string;
  directoryPath: string;
  relativePath: string;
  segments: string[];
  folderDepth: number;
  sizeLabel: string;
  updatedAtLabel: string;
  parseStatus: 'success' | 'failed';
  parseError: string | null;
};

export type FolderNode = {
  name: string;
  path: string;
  fileCount: number;
  children: FolderNode[];
};

type GenerateOptions = {
  sectionRoot?: string;
  fallbackPath?: string;
};

const DIRECTORY_LABEL = '散件独立区 (未归类)';

const TYPE_RULES = [
  { keywords: ['审计', '财报', '报表', '余额表', '利润', '现金流'], type: '财务报表' },
  { keywords: ['合同', '协议', '章程', '律师', '法务', '诉讼'], type: '法务文件' },
  { keywords: ['发票', '流水', '回单', '对账单'], type: '资金流水' },
  { keywords: ['访谈', '会议纪要', '纪要', '录音'], type: '访谈材料' },
  { keywords: ['股权', '工商', '实控人', '营业执照'], type: '主体资料' },
  { keywords: ['销售', '订单', '客户', '采购', '出货'], type: '业务数据' },
  { keywords: ['图片', '照片', '现场', '截图'], type: '影像资料' },
];

const TAG_RULES = [
  { keywords: ['审计', '财报', '报表'], tag: '财务底稿' },
  { keywords: ['合同', '协议'], tag: '合同条款' },
  { keywords: ['诉讼', '仲裁'], tag: '争议风险' },
  { keywords: ['股权', '工商', '实控人'], tag: '主体识别' },
  { keywords: ['销售', '订单', '客户'], tag: '经营数据' },
  { keywords: ['采购', '供应商'], tag: '供应链' },
  { keywords: ['发票', '流水', '回单'], tag: '资金核验' },
  { keywords: ['纪要', '访谈', '录音'], tag: '访谈证据' },
];

const PURPOSE_BY_TYPE: Record<string, string> = {
  财务报表: '收入、利润和现金流等财务指标抽取',
  法务文件: '合同义务与风险条款识别',
  资金流水: '资金往来与回款路径校验',
  访谈材料: '访谈结论与证据片段召回',
  主体资料: '主体信息与股权结构识别',
  业务数据: '经营表现与客户订单分析',
  影像资料: '现场证据与附件关联',
  文档资料: '底稿归档和后续语义检索',
};

const extensionToType: Record<string, string> = {
  pdf: '文档资料',
  doc: '文档资料',
  docx: '文档资料',
  xls: '表格数据',
  xlsx: '表格数据',
  csv: '表格数据',
  ppt: '演示材料',
  pptx: '演示材料',
  jpg: '影像资料',
  jpeg: '影像资料',
  png: '影像资料',
  zip: '压缩材料',
  mp3: '音频资料',
  wav: '音频资料',
};

const getFileExtension = (fileName: string) => {
  const parts = fileName.split('.');
  return parts.length > 1 ? parts.at(-1)?.toLowerCase() ?? '' : '';
};

const stripExtension = (fileName: string) =>
  fileName.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' ').trim();

const normalizeSegment = (segment: string) => segment.trim().replace(/\\/g, '/');

const joinPath = (...segments: string[]) =>
  segments
    .flatMap((segment) => segment.split('/'))
    .map(normalizeSegment)
    .filter(Boolean)
    .join('/');

const formatFileSize = (size: number) => {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (size >= 1024) {
    return `${Math.round(size / 1024)} KB`;
  }

  return `${size} B`;
};

const formatDate = (lastModified: number) => {
  if (!lastModified) {
    return '未知时间';
  }

  const formatter = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(new Date(lastModified));
};

const detectType = (name: string, directoryPath: string, extension: string) => {
  const content = `${name} ${directoryPath}`.toLowerCase();

  for (const rule of TYPE_RULES) {
    if (rule.keywords.some((keyword) => content.includes(keyword.toLowerCase()))) {
      return rule.type;
    }
  }

  return extensionToType[extension] ?? '文档资料';
};

const buildTags = (name: string, directoryPath: string, type: string, extension: string) => {
  const content = `${name} ${directoryPath}`;
  const tags = new Set<string>([type]);

  for (const rule of TAG_RULES) {
    if (rule.keywords.some((keyword) => content.includes(keyword))) {
      tags.add(rule.tag);
    }
  }

  const yearMatch = content.match(/20\d{2}/);
  if (yearMatch) {
    tags.add(`${yearMatch[0]}年度`);
  }

  if (directoryPath) {
    const folderName = directoryPath.split('/').at(-1);
    if (folderName && folderName !== DIRECTORY_LABEL) {
      tags.add(folderName);
    }
  }

  if (extension) {
    tags.add(extension.toUpperCase());
  }

  return Array.from(tags).slice(0, 6);
};

const buildSummary = ({
  title,
  type,
  directoryPath,
  tags,
}: {
  title: string;
  type: string;
  directoryPath: string;
  tags: string[];
}) => {
  const location = directoryPath || DIRECTORY_LABEL;
  const purpose = PURPOSE_BY_TYPE[type] ?? PURPOSE_BY_TYPE.文档资料;
  const tagPreview = tags.slice(0, 2).join('、');

  return `《${title}》已按「${location}」目录归档，识别为${type}，可用于${purpose}${tagPreview ? `，重点关联 ${tagPreview}` : ''}。`;
};

const getInitialParseFailureReason = (fileName: string, extension: string) => {
  const normalizedName = stripExtension(fileName).toLowerCase();

  if (!extension) {
    return '文件缺少扩展名，首次解析未完成';
  }

  if (/(scan|扫描|img|image|图片|photo)/i.test(normalizedName) && ['jpg', 'jpeg', 'png', 'pdf'].includes(extension)) {
    return 'OCR 首次解析超时';
  }

  return null;
};

const getRelativePath = (file: File, options?: GenerateOptions) => {
  const nativeRelativePath = file.webkitRelativePath?.trim();

  if (nativeRelativePath) {
    return options?.sectionRoot
      ? joinPath(options.sectionRoot, nativeRelativePath)
      : joinPath(nativeRelativePath);
  }

  if (options?.fallbackPath) {
    return joinPath(options.fallbackPath, file.name);
  }

  if (options?.sectionRoot) {
    return joinPath(options.sectionRoot, DIRECTORY_LABEL, file.name);
  }

  return joinPath(DIRECTORY_LABEL, file.name);
};

export const generateKnowledgeDocuments = (
  files: File[],
  options?: GenerateOptions,
): KnowledgeDocument[] =>
  files.map((file, index) => {
    const relativePath = getRelativePath(file, options);
    const pathSegments = relativePath.split('/').filter(Boolean);
    const directoryPath =
      pathSegments.length > 1 ? pathSegments.slice(0, -1).join('/') : DIRECTORY_LABEL;
    const title = stripExtension(file.name);
    const extension = getFileExtension(file.name);
    const type = detectType(file.name, directoryPath, extension);
    const tags = buildTags(file.name, directoryPath, type, extension);
    const parseError = getInitialParseFailureReason(file.name, extension);
    const parseStatus = parseError ? 'failed' : 'success';

    return {
      id: `${relativePath}-${file.lastModified}-${index}`,
      name: file.name,
      title,
      type,
      summary:
        parseStatus === 'failed'
          ? `《${title}》首次解析未完成，请点击重新解析后补全摘要与标签。`
          : buildSummary({ title, type, directoryPath, tags }),
      tags: parseStatus === 'failed' ? [] : tags,
      extension,
      directoryPath,
      relativePath,
      segments: directoryPath === DIRECTORY_LABEL ? [DIRECTORY_LABEL] : directoryPath.split('/'),
      folderDepth: directoryPath === DIRECTORY_LABEL ? 0 : directoryPath.split('/').length,
      sizeLabel: formatFileSize(file.size),
      updatedAtLabel: formatDate(file.lastModified),
      parseStatus,
      parseError,
    };
  });

export const updateKnowledgeDocument = (
  document: KnowledgeDocument,
  overrides: {
    title?: string;
    directoryPath?: string;
  },
): KnowledgeDocument => {
  const title = overrides.title ?? document.title;
  const directoryPath = overrides.directoryPath ?? document.directoryPath;
  const type = detectType(document.name, directoryPath, document.extension);
  const tags = buildTags(document.name, directoryPath, type, document.extension);
  const relativePath = joinPath(directoryPath, document.name);

  return {
    ...document,
    title,
    type,
    tags,
    summary: buildSummary({ title, type, directoryPath, tags }),
    directoryPath,
    relativePath,
    segments: directoryPath === DIRECTORY_LABEL ? [DIRECTORY_LABEL] : directoryPath.split('/'),
    folderDepth: directoryPath === DIRECTORY_LABEL ? 0 : directoryPath.split('/').length,
    parseStatus: 'success',
    parseError: null,
  };
};

export const buildFolderTree = (documents: KnowledgeDocument[]): FolderNode[] => {
  type InternalFolderNode = FolderNode & {
    childrenMap: Map<string, InternalFolderNode>;
  };

  const root = new Map<string, InternalFolderNode>();

  for (const document of documents) {
    const segments =
      document.directoryPath === DIRECTORY_LABEL
        ? [DIRECTORY_LABEL]
        : document.directoryPath.split('/').filter(Boolean);

    let currentLevel = root;
    let currentPath = '';

    for (const segment of segments) {
      currentPath = currentPath ? `${currentPath}/${segment}` : segment;

      if (!currentLevel.has(segment)) {
        currentLevel.set(segment, {
          name: segment,
          path: currentPath,
          fileCount: 0,
          children: [],
          childrenMap: new Map<string, InternalFolderNode>(),
        });
      }

      const node = currentLevel.get(segment)!;
      node.fileCount += 1;
      currentLevel = node.childrenMap;
    }
  }

  const sortNodes = (nodes: Map<string, InternalFolderNode>): FolderNode[] =>
    Array.from(nodes.values())
      .map((node) => ({
        name: node.name,
        path: node.path,
        fileCount: node.fileCount,
        children: sortNodes(node.childrenMap),
      }))
      .sort((left, right) => left.path.localeCompare(right.path, 'zh-CN'));

  return sortNodes(root);
};

export const groupDocumentsByDirectory = (documents: KnowledgeDocument[]) =>
  documents.reduce<Record<string, KnowledgeDocument[]>>((groups, document) => {
    const key = document.directoryPath || DIRECTORY_LABEL;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(document);
    return groups;
  }, {});

export const getKnowledgeStats = (documents: KnowledgeDocument[]) => {
  const directories = new Set(documents.map((document) => document.directoryPath));
  const maxDepth = documents.reduce(
    (currentMax, document) => Math.max(currentMax, document.folderDepth),
    0,
  );

  return {
    fileCount: documents.length,
    directoryCount: directories.size,
    maxDepth,
    metadataCount: documents.filter(
      (document) =>
        Boolean(document.title) &&
        Boolean(document.type) &&
        Boolean(document.summary) &&
        document.tags.length > 0,
    ).length,
  };
};

export const filterDocuments = (
  documents: KnowledgeDocument[],
  keyword: string,
  directoryPath: string,
) => {
  const normalizedKeyword = keyword.trim().toLowerCase();

  return documents.filter((document) => {
    const matchesDirectory =
      directoryPath === 'ALL' || document.directoryPath.startsWith(directoryPath);

    const matchesKeyword =
      !normalizedKeyword ||
      [
        document.title,
        document.name,
        document.type,
        document.summary,
        document.directoryPath,
        document.tags.join(' '),
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedKeyword);

    return matchesDirectory && matchesKeyword;
  });
};

export const DIRECTORY_PLACEHOLDER = DIRECTORY_LABEL;
