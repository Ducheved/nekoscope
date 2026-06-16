import type { LocaleCode } from "./types";

export type MessageKey =
  | "openFolder"
  | "openFile"
  | "quickSwitcher"
  | "search"
  | "mindmap"
  | "format"
  | "askAi"
  | "openInIde"
  | "reveal"
  | "settings"
  | "welcomeTitle"
  | "welcomeSubtitle"
  | "startupStepOne"
  | "startupStepTwo"
  | "startupStepThree"
  | "sampleWorkspace"
  | "comments"
  | "metadata"
  | "outline"
  | "diagrams"
  | "sync"
  | "language"
  | "theme"
  | "save"
  | "send"
  | "cancel"
  | "provider"
  | "context"
  | "zoomIn"
  | "zoomOut"
  | "fit"
  | "exportSvg"
  | "copySource";

type Messages = Record<MessageKey, string>;

const messages: Record<LocaleCode, Messages> = {
  en: {
    openFolder: "Open folder",
    openFile: "Open file",
    quickSwitcher: "Quick switcher",
    search: "Search",
    mindmap: "Mindmap",
    format: "Format",
    askAi: "Ask AI",
    openInIde: "Open in IDE",
    reveal: "Reveal",
    settings: "Settings",
    welcomeTitle: "NekoScope",
    welcomeSubtitle: "A tiny kawaii knowledge lens for Markdown-heavy repos.",
    startupStepOne: "Open a folder or use the sample workspace.",
    startupStepTwo:
      "Switch between rendered docs, source, mindmaps and summaries.",
    startupStepThree:
      "Configure AI, sync storage and language before sharing context.",
    sampleWorkspace: "Sample workspace",
    comments: "Comments",
    metadata: "Metadata",
    outline: "Outline",
    diagrams: "Diagrams",
    sync: "Sync",
    language: "Language",
    theme: "Theme",
    save: "Save",
    send: "Send",
    cancel: "Cancel",
    provider: "Provider",
    context: "Context",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    fit: "Fit",
    exportSvg: "Export SVG",
    copySource: "Copy source",
  },
  ru: {
    openFolder: "Открыть папку",
    openFile: "Открыть файл",
    quickSwitcher: "Быстрый переход",
    search: "Поиск",
    mindmap: "Майндмэп",
    format: "Формат",
    askAi: "Спросить AI",
    openInIde: "Открыть в IDE",
    reveal: "Показать",
    settings: "Настройки",
    welcomeTitle: "NekoScope",
    welcomeSubtitle:
      "Маленькая kawaii-линза знаний для Markdown-heavy репозиториев.",
    startupStepOne: "Откройте папку или используйте sample workspace.",
    startupStepTwo:
      "Переключайтесь между рендером, source, майндмэпами и summaries.",
    startupStepThree:
      "Настройте AI, sync storage и язык до отправки контекста.",
    sampleWorkspace: "Sample workspace",
    comments: "Комментарии",
    metadata: "Метаданные",
    outline: "Структура",
    diagrams: "Диаграммы",
    sync: "Синхронизация",
    language: "Язык",
    theme: "Тема",
    save: "Сохранить",
    send: "Отправить",
    cancel: "Отмена",
    provider: "Провайдер",
    context: "Контекст",
    zoomIn: "Увеличить",
    zoomOut: "Уменьшить",
    fit: "Вписать",
    exportSvg: "Экспорт SVG",
    copySource: "Копировать source",
  },
  ja: {
    openFolder: "フォルダーを開く",
    openFile: "ファイルを開く",
    quickSwitcher: "クイックスイッチャー",
    search: "検索",
    mindmap: "マインドマップ",
    format: "整形",
    askAi: "AIに聞く",
    openInIde: "IDEで開く",
    reveal: "表示",
    settings: "設定",
    welcomeTitle: "NekoScope",
    welcomeSubtitle: "Markdown中心のリポジトリ向けの小さなkawaii知識レンズ。",
    startupStepOne: "フォルダーを開くかサンプルを使います。",
    startupStepTwo: "表示、ソース、マインドマップ、サマリーを切り替えます。",
    startupStepThree: "AI、同期ストレージ、言語を設定してから文脈を送ります。",
    sampleWorkspace: "サンプル",
    comments: "コメント",
    metadata: "メタデータ",
    outline: "アウトライン",
    diagrams: "図",
    sync: "同期",
    language: "言語",
    theme: "テーマ",
    save: "保存",
    send: "送信",
    cancel: "キャンセル",
    provider: "プロバイダー",
    context: "文脈",
    zoomIn: "拡大",
    zoomOut: "縮小",
    fit: "全体表示",
    exportSvg: "SVGを書き出す",
    copySource: "ソースをコピー",
  },
  zh: {
    openFolder: "打开文件夹",
    openFile: "打开文件",
    quickSwitcher: "快速切换",
    search: "搜索",
    mindmap: "思维导图",
    format: "格式化",
    askAi: "询问 AI",
    openInIde: "在 IDE 中打开",
    reveal: "显示位置",
    settings: "设置",
    welcomeTitle: "NekoScope",
    welcomeSubtitle: "面向 Markdown-heavy 仓库的轻巧 kawaii 知识镜头。",
    startupStepOne: "打开文件夹，或使用示例工作区。",
    startupStepTwo: "在渲染、源码、思维导图和摘要之间切换。",
    startupStepThree: "发送上下文前配置 AI、同步存储和语言。",
    sampleWorkspace: "示例工作区",
    comments: "评论",
    metadata: "元数据",
    outline: "大纲",
    diagrams: "图表",
    sync: "同步",
    language: "语言",
    theme: "主题",
    save: "保存",
    send: "发送",
    cancel: "取消",
    provider: "提供方",
    context: "上下文",
    zoomIn: "放大",
    zoomOut: "缩小",
    fit: "适配",
    exportSvg: "导出 SVG",
    copySource: "复制源码",
  },
};

export function registerLocale(code: LocaleCode, value: Messages) {
  messages[code] = value;
}

export function translate(locale: LocaleCode, key: MessageKey) {
  return messages[locale]?.[key] ?? messages.en[key];
}

export const localeOptions: Array<{ code: LocaleCode; label: string }> = [
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
];
