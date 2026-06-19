import type { LocaleCode } from "./types";

export type MessageKey =
  | "tagline"
  | "ready"
  | "openFolder"
  | "openFile"
  | "openExternal"
  | "reveal"
  | "quickSwitcher"
  | "commandPalette"
  | "search"
  | "runCommand"
  | "switchFile"
  | "filterFiles"
  | "settings"
  | "settingsTitle"
  | "closeSettings"
  | "appearance"
  | "language"
  | "theme"
  | "fontScale"
  | "resetFont"
  | "systemTheme"
  | "lightTheme"
  | "darkTheme"
  | "rendered"
  | "source"
  | "split"
  | "cycleView"
  | "outline"
  | "toggleOutline"
  | "toggleSidebar"
  | "zenMode"
  | "exitZen"
  | "toggleTheme"
  | "words"
  | "minRead"
  | "headings"
  | "noHeadings"
  | "files"
  | "docs"
  | "configs"
  | "searchPlaceholder"
  | "searchResults"
  | "noMatches"
  | "emptyTitle"
  | "emptySubtitle"
  | "viewSample"
  | "copy"
  | "copied"
  | "fileReloaded"
  | "line";

type Messages = Record<MessageKey, string>;

const messages: Record<LocaleCode, Messages> = {
  en: {
    tagline: "A calm desktop Markdown viewer",
    ready: "Ready",
    openFolder: "Open folder",
    openFile: "Open file",
    openExternal: "Open in default app",
    reveal: "Reveal in file manager",
    quickSwitcher: "Quick switch file",
    commandPalette: "Command palette",
    search: "Search in folder",
    runCommand: "Run a command",
    switchFile: "Jump to file",
    filterFiles: "Filter files",
    settings: "Settings",
    settingsTitle: "Settings",
    closeSettings: "Close settings",
    appearance: "Appearance",
    language: "Language",
    theme: "Theme",
    fontScale: "Font size",
    resetFont: "Reset",
    systemTheme: "System",
    lightTheme: "Light",
    darkTheme: "Dark",
    rendered: "Rendered",
    source: "Source",
    split: "Split",
    cycleView: "Cycle view mode",
    outline: "Outline",
    toggleOutline: "Toggle outline",
    toggleSidebar: "Toggle file sidebar",
    zenMode: "Zen mode",
    exitZen: "Exit Zen mode",
    toggleTheme: "Toggle light / dark",
    words: "words",
    minRead: "min read",
    headings: "headings",
    noHeadings: "No headings in this document.",
    files: "files",
    docs: "docs",
    configs: "configs",
    searchPlaceholder: "Search text across the folder",
    searchResults: "results",
    noMatches: "No matches.",
    emptyTitle: "Open a Markdown file",
    emptySubtitle:
      "Double-click a .md file, drag one onto this window, or open a folder to start reading.",
    viewSample: "View sample document",
    copy: "Copy",
    copied: "Copied",
    fileReloaded: "Reloaded from disk",
    line: "line",
  },
  ru: {
    tagline: "Спокойный десктоп-просмотрщик Markdown",
    ready: "Готово",
    openFolder: "Открыть папку",
    openFile: "Открыть файл",
    openExternal: "Открыть в приложении по умолчанию",
    reveal: "Показать в проводнике",
    quickSwitcher: "Быстрый переход к файлу",
    commandPalette: "Палитра команд",
    search: "Поиск в папке",
    runCommand: "Выполнить команду",
    switchFile: "Перейти к файлу",
    filterFiles: "Фильтр файлов",
    settings: "Настройки",
    settingsTitle: "Настройки",
    closeSettings: "Закрыть настройки",
    appearance: "Оформление",
    language: "Язык",
    theme: "Тема",
    fontScale: "Размер шрифта",
    resetFont: "Сбросить",
    systemTheme: "Системная",
    lightTheme: "Светлая",
    darkTheme: "Тёмная",
    rendered: "Просмотр",
    source: "Исходник",
    split: "Рядом",
    cycleView: "Переключить режим показа",
    outline: "Оглавление",
    toggleOutline: "Показать оглавление",
    toggleSidebar: "Показать список файлов",
    zenMode: "Дзен-режим",
    exitZen: "Выйти из Дзен-режима",
    toggleTheme: "Светлая / тёмная",
    words: "слов",
    minRead: "мин чтения",
    headings: "заголовков",
    noHeadings: "В этом документе нет заголовков.",
    files: "файлов",
    docs: "документов",
    configs: "конфигов",
    searchPlaceholder: "Искать текст по папке",
    searchResults: "совпадений",
    noMatches: "Ничего не найдено.",
    emptyTitle: "Откройте файл Markdown",
    emptySubtitle:
      "Дважды кликните по .md, перетащите файл в окно или откройте папку, чтобы начать чтение.",
    viewSample: "Открыть пример документа",
    copy: "Копировать",
    copied: "Скопировано",
    fileReloaded: "Обновлено с диска",
    line: "строка",
  },
  ja: {
    tagline: "静かなデスクトップ Markdown ビューア",
    ready: "準備完了",
    openFolder: "フォルダを開く",
    openFile: "ファイルを開く",
    openExternal: "既定のアプリで開く",
    reveal: "ファイルマネージャで表示",
    quickSwitcher: "ファイルへ素早く移動",
    commandPalette: "コマンドパレット",
    search: "フォルダ内を検索",
    runCommand: "コマンドを実行",
    switchFile: "ファイルへ移動",
    filterFiles: "ファイルを絞り込む",
    settings: "設定",
    settingsTitle: "設定",
    closeSettings: "設定を閉じる",
    appearance: "外観",
    language: "言語",
    theme: "テーマ",
    fontScale: "文字サイズ",
    resetFont: "リセット",
    systemTheme: "システム",
    lightTheme: "ライト",
    darkTheme: "ダーク",
    rendered: "表示",
    source: "ソース",
    split: "分割",
    cycleView: "表示モードを切替",
    outline: "アウトライン",
    toggleOutline: "アウトラインの表示切替",
    toggleSidebar: "ファイル一覧の表示切替",
    zenMode: "Zen モード",
    exitZen: "Zen モードを終了",
    toggleTheme: "ライト / ダーク切替",
    words: "語",
    minRead: "分で読了",
    headings: "見出し",
    noHeadings: "この文書に見出しはありません。",
    files: "ファイル",
    docs: "文書",
    configs: "設定",
    searchPlaceholder: "フォルダ全体をテキスト検索",
    searchResults: "件",
    noMatches: "一致なし。",
    emptyTitle: "Markdown ファイルを開く",
    emptySubtitle:
      ".md をダブルクリック、ウィンドウにドラッグ、またはフォルダを開いて読み始めます。",
    viewSample: "サンプル文書を見る",
    copy: "コピー",
    copied: "コピー済み",
    fileReloaded: "ディスクから再読み込み",
    line: "行",
  },
  zh: {
    tagline: "安静的桌面 Markdown 阅读器",
    ready: "就绪",
    openFolder: "打开文件夹",
    openFile: "打开文件",
    openExternal: "用默认应用打开",
    reveal: "在文件管理器中显示",
    quickSwitcher: "快速切换文件",
    commandPalette: "命令面板",
    search: "在文件夹中搜索",
    runCommand: "运行命令",
    switchFile: "跳转到文件",
    filterFiles: "筛选文件",
    settings: "设置",
    settingsTitle: "设置",
    closeSettings: "关闭设置",
    appearance: "外观",
    language: "语言",
    theme: "主题",
    fontScale: "字体大小",
    resetFont: "重置",
    systemTheme: "跟随系统",
    lightTheme: "浅色",
    darkTheme: "深色",
    rendered: "预览",
    source: "源码",
    split: "分栏",
    cycleView: "切换显示模式",
    outline: "大纲",
    toggleOutline: "切换大纲",
    toggleSidebar: "切换文件侧栏",
    zenMode: "禅模式",
    exitZen: "退出禅模式",
    toggleTheme: "浅色 / 深色",
    words: "词",
    minRead: "分钟阅读",
    headings: "标题",
    noHeadings: "本文档没有标题。",
    files: "文件",
    docs: "文档",
    configs: "配置",
    searchPlaceholder: "在整个文件夹中搜索文本",
    searchResults: "条结果",
    noMatches: "没有匹配。",
    emptyTitle: "打开一个 Markdown 文件",
    emptySubtitle: "双击 .md 文件、拖入窗口，或打开文件夹开始阅读。",
    viewSample: "查看示例文档",
    copy: "复制",
    copied: "已复制",
    fileReloaded: "已从磁盘重新加载",
    line: "行",
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
