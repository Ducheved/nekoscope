<script lang="ts">
  import {
    BookOpen,
    Command,
    ExternalLink,
    FileSearch,
    FileText,
    FolderOpen,
    FolderSearch,
    GitBranch,
    Moon,
    PanelLeft,
    PanelRight,
    Search,
    Settings,
    Sun,
  } from "@lucide/svelte";
  import { onMount } from "svelte";
  import { translate } from "$lib/neko/i18n";
  import {
    demoTree,
    demoWorkspace,
    readDemoFile,
  } from "$lib/neko/demoWorkspace";
  import {
    invokeNeko,
    isTauriRuntime,
    onFileDrop,
    onTauriEvent,
    openFileDialog,
    openFolderDialog,
  } from "$lib/neko/tauriBridge";
  import { settingsStore } from "$lib/neko/settingsStore";
  import { applyTheme, resolveTheme } from "$lib/neko/themeTokens";
  import type {
    FilePayload,
    FileTreeEntry,
    OpenResult,
    SearchResult,
    ViewMode,
    WorkspaceSummary,
  } from "$lib/neko/types";
  import CommandPalette from "./CommandPalette.svelte";
  import FileExplorer from "./FileExplorer.svelte";
  import MarkdownViewer from "./MarkdownViewer.svelte";
  import OutlinePanel from "./OutlinePanel.svelte";
  import QuickSwitcher from "./QuickSwitcher.svelte";
  import SearchPanel from "./SearchPanel.svelte";
  import SettingsDialog from "./SettingsDialog.svelte";
  import SourceViewer from "./SourceViewer.svelte";

  interface RecentItem {
    path: string;
    name: string;
  }

  const recentKey = "nekoscope-recent";

  let workspace: WorkspaceSummary | null = null;
  let entries: FileTreeEntry[] = [];
  let activeFile: FilePayload | null = null;
  let activePath = "";

  let viewMode: ViewMode = "rendered";
  let showSidebar = true;
  let showOutline = true;
  let zenMode = false;

  let showCommands = false;
  let showQuick = false;
  let showSearch = false;
  let showSettings = false;

  let recent: RecentItem[] = [];
  let searchResults: SearchResult[] = [];
  let searchBusy = false;
  let scrollTarget = "";
  let scrollNonce = 0;
  let sourceLine: number | null = null;
  let status = "";
  let themeKey: "light" | "dark" = "light";
  let reloadTimer: ReturnType<typeof setTimeout> | undefined;

  $: t = (key: Parameters<typeof translate>[1]) =>
    translate($settingsStore.locale, key);
  $: if (!status) status = t("ready");
  $: {
    applyTheme($settingsStore.theme);
    themeKey = resolveTheme($settingsStore.theme);
  }
  $: anyOverlay = showCommands || showQuick || showSearch || showSettings;

  onMount(() => {
    recent = loadRecent();

    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onScheme = () => {
      applyTheme($settingsStore.theme);
      themeKey = resolveTheme($settingsStore.theme);
    };
    media?.addEventListener?.("change", onScheme);

    const unlisteners: Array<() => void> = [];
    void onTauriEvent<string>("open-path", (path) => void openPath(path)).then(
      (off) => unlisteners.push(off),
    );
    void onTauriEvent<{ workspace: string; paths: string[]; kind: string }>(
      "workspace-changed",
      (payload) => handleWorkspaceChange(payload),
    ).then((off) => unlisteners.push(off));
    void onFileDrop((paths) => {
      if (paths[0]) void openPath(paths[0]);
    }).then((off) => unlisteners.push(off));

    void bootstrap();

    return () => {
      media?.removeEventListener?.("change", onScheme);
      unlisteners.forEach((off) => off());
      clearTimeout(reloadTimer);
    };
  });

  async function bootstrap() {
    if (isTauriRuntime()) {
      const launch = await invokeNeko<string[]>(
        "take_launch_paths",
        {},
        () => [],
      );
      if (launch.length) {
        await openPath(launch[0]);
        return;
      }
    } else {
      loadSample();
    }
  }

  function loadSample() {
    workspace = demoWorkspace;
    entries = demoTree;
    activeFile = readDemoFile("README.md");
    activePath = activeFile.path;
    searchResults = [];
    status = t("ready");
  }

  async function openPath(path: string) {
    let result: OpenResult;
    try {
      result = await invokeNeko<OpenResult>("open_path", { path }, () => ({
        workspace: demoWorkspace,
        entries: demoTree,
        file: readDemoFile("README.md"),
        activePath: "README.md",
      }));
    } catch (error) {
      status = `${basename(path)}: ${error instanceof Error ? error.message : String(error)}`;
      return;
    }
    workspace = result.workspace;
    entries = result.entries;
    activeFile = result.file;
    activePath = result.activePath ?? result.file?.path ?? "";
    sourceLine = null;
    await invokeNeko(
      "watch_workspace",
      { path: result.workspace.path },
      () => null,
    );
    rememberRecent(path, result.workspace, result.file);
    status = activeFile ? activeFile.path : result.workspace.name;
  }

  async function selectFile(entry: FileTreeEntry) {
    if (entry.isDir || !workspace) return;
    try {
      const file = await invokeNeko<FilePayload>(
        "read_workspace_file",
        { workspace: workspace.path, path: entry.path },
        () => readDemoFile(entry.path),
      );
      activeFile = file;
      activePath = file.path;
      sourceLine = null;
      status = file.path;
    } catch (error) {
      status = `${entry.name}: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  async function openByPath(relPath: string) {
    if (!workspace) return;
    const file = await invokeNeko<FilePayload>(
      "read_workspace_file",
      { workspace: workspace.path, path: relPath },
      () => readDemoFile(relPath),
    );
    activeFile = file;
    activePath = file.path;
    sourceLine = null;
    status = file.path;
  }

  function resolveRelative(from: string, href: string) {
    const clean = decodeURIComponent(href.split("#")[0].split("?")[0]);
    if (!clean) return "";
    const base = from.includes("/") ? from.slice(0, from.lastIndexOf("/")) : "";
    const segments = (base ? `${base}/${clean}` : clean).split("/");
    const stack: string[] = [];
    for (const segment of segments) {
      if (segment === "" || segment === ".") continue;
      if (segment === "..") stack.pop();
      else stack.push(segment);
    }
    return stack.join("/");
  }

  async function handleNavigate(href: string) {
    const target = resolveRelative(activePath, href);
    if (!target) return;
    const known = entries.find(
      (entry) => entry.path === target && !entry.isDir,
    );
    if (known) {
      await selectFile(known);
      return;
    }
    try {
      await openByPath(target);
    } catch {
      status = `${target} ✕`;
    }
  }

  async function openExternal() {
    if (!activeFile || !workspace) return;
    await invokeNeko(
      "open_external",
      { workspace: workspace.path, path: activeFile.path },
      () => null,
    );
  }

  async function revealFile() {
    if (!activeFile || !workspace) return;
    await invokeNeko(
      "reveal_in_file_manager",
      { workspace: workspace.path, path: activeFile.path },
      () => null,
    );
  }

  async function openExternalUrl(url: string) {
    await invokeNeko("open_url", { url }, () => null);
  }

  function absolutePath(rel: string) {
    if (!workspace) return rel;
    const root = workspace.path.replace(/[\\/]+$/, "");
    return `${root}/${rel}`;
  }

  async function runSearch(query: string) {
    if (!workspace || !query.trim()) {
      searchResults = [];
      return;
    }
    searchBusy = true;
    searchResults = await invokeNeko<SearchResult[]>(
      "search_workspace",
      { workspace: workspace.path, query },
      () => [],
    );
    searchBusy = false;
  }

  async function chooseSearchResult(result: SearchResult) {
    showSearch = false;
    try {
      await openByPath(result.path);
      viewMode = "source";
      sourceLine = result.line;
    } catch (error) {
      status = `${result.path}: ${error instanceof Error ? error.message : String(error)}`;
    }
  }

  function focusOutline(id: string) {
    if (viewMode === "source") viewMode = "rendered";
    scrollTarget = id;
    scrollNonce += 1;
  }

  function cycleView() {
    viewMode =
      viewMode === "rendered"
        ? "source"
        : viewMode === "source"
          ? "split"
          : "rendered";
  }

  function toggleTheme() {
    const next = themeKey === "dark" ? "light" : "dark";
    settingsStore.update((value) => ({ ...value, theme: next }));
  }

  function adjustFont(delta: number) {
    settingsStore.update((value) => ({
      ...value,
      fontScale: Math.min(
        1.4,
        Math.max(0.8, Number((value.fontScale + delta).toFixed(2))),
      ),
    }));
  }

  function resetFont() {
    settingsStore.update((value) => ({ ...value, fontScale: 1 }));
  }

  async function openFolder() {
    const path = await openFolderDialog();
    if (path) await openPath(path);
  }

  async function openFile() {
    const path = await openFileDialog();
    if (path) await openPath(path);
  }

  function handleWorkspaceChange(payload: {
    workspace?: string;
    paths?: string[];
  }) {
    if (!workspace) return;
    const norm = (value: string) => value.replace(/\\/g, "/");
    if (payload.workspace && norm(payload.workspace) !== norm(workspace.path)) {
      return;
    }
    const paths = payload.paths ?? [];
    clearTimeout(reloadTimer);
    reloadTimer = setTimeout(async () => {
      if (!workspace) return;
      entries = await invokeNeko<FileTreeEntry[]>(
        "list_workspace_tree",
        { path: workspace.path, includeHidden: false },
        () => entries,
      );
      if (!activeFile) return;
      const normalized = paths.map((value) => value.replace(/\\/g, "/"));
      const touched = normalized.some((value) => value.endsWith(activePath));
      if (!touched) return;
      const fresh = await invokeNeko<FilePayload>(
        "read_workspace_file",
        { workspace: workspace.path, path: activePath },
        () => activeFile as FilePayload,
      );
      if (fresh.content !== activeFile.content) {
        activeFile = fresh;
        status = t("fileReloaded");
      }
    }, 250);
  }

  function runCommand(id: string) {
    showCommands = false;
    switch (id) {
      case "open-folder":
        void openFolder();
        break;
      case "open-file":
        void openFile();
        break;
      case "quick-switcher":
        showQuick = true;
        break;
      case "search":
        showSearch = true;
        break;
      case "toggle-view":
        cycleView();
        break;
      case "toggle-outline":
        showOutline = !showOutline;
        break;
      case "toggle-sidebar":
        showSidebar = !showSidebar;
        break;
      case "toggle-theme":
        toggleTheme();
        break;
      case "zen":
        zenMode = !zenMode;
        break;
      case "open-external":
        void openExternal();
        break;
      case "reveal":
        void revealFile();
        break;
      case "settings":
        showSettings = true;
        break;
    }
  }

  function closeOverlays() {
    showCommands = showQuick = showSearch = showSettings = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    const mod = event.metaKey || event.ctrlKey;
    const target = event.target as HTMLElement | null;
    const typing =
      target &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable);

    if (event.key === "Escape") {
      if (anyOverlay) closeOverlays();
      else if (zenMode) zenMode = false;
      return;
    }
    if (anyOverlay || typing) return;
    if (!mod) return;

    const key = event.key.toLowerCase();
    if (key === "k") {
      event.preventDefault();
      showCommands = true;
    } else if (key === "p") {
      event.preventDefault();
      showQuick = true;
    } else if (key === "f") {
      event.preventDefault();
      showSearch = true;
    } else if (key === "o" && event.shiftKey) {
      event.preventDefault();
      void openFolder();
    } else if (key === "o") {
      event.preventDefault();
      void openFile();
    } else if (key === "e" && event.shiftKey) {
      event.preventDefault();
      void openExternal();
    } else if (key === "e") {
      event.preventDefault();
      cycleView();
    } else if (key === "i") {
      event.preventDefault();
      showOutline = !showOutline;
    } else if (key === "b") {
      event.preventDefault();
      showSidebar = !showSidebar;
    } else if (key === "j") {
      event.preventDefault();
      toggleTheme();
    } else if (key === "r" && event.shiftKey) {
      event.preventDefault();
      void revealFile();
    } else if (key === "z" && event.shiftKey) {
      event.preventDefault();
      zenMode = !zenMode;
    } else if (key === ",") {
      event.preventDefault();
      showSettings = true;
    } else if (key === "=" || key === "+") {
      event.preventDefault();
      adjustFont(0.05);
    } else if (key === "-") {
      event.preventDefault();
      adjustFont(-0.05);
    } else if (key === "0") {
      event.preventDefault();
      resetFont();
    }
  }

  function loadRecent(): RecentItem[] {
    try {
      const raw = window.localStorage?.getItem(recentKey);
      return raw ? (JSON.parse(raw) as RecentItem[]) : [];
    } catch {
      return [];
    }
  }

  function rememberRecent(
    requested: string,
    summary: WorkspaceSummary,
    file: FilePayload | null,
  ) {
    const path = requested;
    const name = file?.name ?? summary.name ?? basename(path);
    recent = [
      { path, name },
      ...recent.filter((item) => item.path !== path),
    ].slice(0, 8);
    try {
      window.localStorage?.setItem(recentKey, JSON.stringify(recent));
    } catch {
      void 0;
    }
  }

  function basename(path: string) {
    return path.split(/[\\/]/).filter(Boolean).pop() ?? path;
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div
  class="app"
  class:zen={zenMode}
  style={`--font-scale: ${$settingsStore.fontScale}`}
>
  {#if !zenMode}
    <header class="topbar">
      <div class="identity">
        <img class="mark" src="/logo.png" alt="" />
        <div class="titles">
          <strong>NekoScope</strong>
          <span>
            {#if workspace}
              {workspace.name}{workspace.gitBranch
                ? ` · ${workspace.gitBranch}`
                : ""}
            {:else}
              {t("tagline")}
            {/if}
          </span>
        </div>
      </div>

      <nav aria-label="Toolbar">
        <button
          type="button"
          title={`${t("openFile")} (Ctrl/Cmd+O)`}
          on:click={openFile}
        >
          <FileText size={17} />
        </button>
        <button
          type="button"
          title={`${t("openFolder")} (Ctrl/Cmd+Shift+O)`}
          on:click={openFolder}
        >
          <FolderOpen size={17} />
        </button>
        <span class="sep"></span>
        <button
          type="button"
          title={`${t("quickSwitcher")} (Ctrl/Cmd+P)`}
          disabled={!workspace}
          on:click={() => (showQuick = true)}
        >
          <FileSearch size={17} />
        </button>
        <button
          type="button"
          title={`${t("search")} (Ctrl/Cmd+F)`}
          disabled={!workspace}
          on:click={() => (showSearch = true)}
        >
          <Search size={17} />
        </button>
        <span class="sep"></span>
        <button
          type="button"
          title={`${t("toggleSidebar")} (Ctrl/Cmd+B)`}
          aria-pressed={showSidebar}
          class:on={showSidebar}
          on:click={() => (showSidebar = !showSidebar)}
        >
          <PanelLeft size={17} />
        </button>
        <button
          type="button"
          title={`${t("toggleOutline")} (Ctrl/Cmd+I)`}
          aria-pressed={showOutline}
          class:on={showOutline}
          on:click={() => (showOutline = !showOutline)}
        >
          <PanelRight size={17} />
        </button>
        <button
          type="button"
          title={`${t("toggleTheme")} (Ctrl/Cmd+J)`}
          on:click={toggleTheme}
        >
          {#if themeKey === "dark"}<Sun size={17} />{:else}<Moon
              size={17}
            />{/if}
        </button>
        <button
          type="button"
          title={`${t("zenMode")} (Ctrl/Cmd+Shift+Z)`}
          on:click={() => (zenMode = true)}
        >
          <BookOpen size={17} />
        </button>
        <span class="sep"></span>
        <button
          type="button"
          title={t("openExternal")}
          disabled={!activeFile}
          on:click={openExternal}
        >
          <ExternalLink size={17} />
        </button>
        <button
          type="button"
          title={t("reveal")}
          disabled={!activeFile}
          on:click={revealFile}
        >
          <FolderSearch size={17} />
        </button>
        <button
          type="button"
          title={`${t("settings")} (Ctrl/Cmd+,)`}
          on:click={() => (showSettings = true)}
        >
          <Settings size={17} />
        </button>
        <button
          type="button"
          title={`${t("commandPalette")} (Ctrl/Cmd+K)`}
          on:click={() => (showCommands = true)}
        >
          <Command size={17} />
        </button>
      </nav>
    </header>
  {/if}

  <main
    class:zen={zenMode}
    class:with-sidebar={showSidebar && !zenMode && workspace}
    class:with-outline={showOutline &&
      !zenMode &&
      activeFile?.kind === "markdown"}
  >
    {#if showSidebar && !zenMode && workspace}
      <aside class="left">
        <FileExplorer
          {entries}
          {activePath}
          on:select={(event) => selectFile(event.detail)}
        />
      </aside>
    {/if}

    <section class="center" class:zen-center={zenMode}>
      {#if activeFile}
        {#if !zenMode}
          <div class="docbar">
            <div class="breadcrumbs" title={absolutePath(activeFile.path)}>
              <GitBranch size={13} />
              <span>{workspace?.name ?? t("tagline")}</span>
              <strong>{activeFile.path}</strong>
            </div>
            {#if activeFile.kind === "markdown"}
              <div class="view-toggle" role="tablist" aria-label="View mode">
                <button
                  role="tab"
                  aria-selected={viewMode === "rendered"}
                  class:active={viewMode === "rendered"}
                  type="button"
                  on:click={() => (viewMode = "rendered")}
                  >{t("rendered")}</button
                >
                <button
                  role="tab"
                  aria-selected={viewMode === "source"}
                  class:active={viewMode === "source"}
                  type="button"
                  on:click={() => (viewMode = "source")}>{t("source")}</button
                >
                <button
                  role="tab"
                  aria-selected={viewMode === "split"}
                  class:active={viewMode === "split"}
                  type="button"
                  on:click={() => (viewMode = "split")}>{t("split")}</button
                >
              </div>
            {/if}
          </div>
        {/if}

        <div
          class="document"
          class:split={viewMode === "split" &&
            activeFile.kind === "markdown" &&
            !zenMode}
        >
          {#if activeFile.kind !== "markdown"}
            <SourceViewer file={activeFile} highlightLine={sourceLine} />
          {:else if zenMode || viewMode === "rendered"}
            <MarkdownViewer
              file={activeFile}
              {themeKey}
              {scrollTarget}
              {scrollNonce}
              on:navigate={(event) => handleNavigate(event.detail)}
              on:external={(event) => openExternalUrl(event.detail)}
            />
          {:else if viewMode === "source"}
            <SourceViewer file={activeFile} highlightLine={sourceLine} />
          {:else}
            <MarkdownViewer
              file={activeFile}
              {themeKey}
              {scrollTarget}
              {scrollNonce}
              on:navigate={(event) => handleNavigate(event.detail)}
              on:external={(event) => openExternalUrl(event.detail)}
            />
            <SourceViewer file={activeFile} highlightLine={sourceLine} />
          {/if}
        </div>
      {:else}
        <div class="welcome">
          <img class="welcome-mark" src="/logo.png" alt="" />
          <h1>{t("emptyTitle")}</h1>
          <p>{t("emptySubtitle")}</p>
          <div class="welcome-actions">
            <button type="button" class="primary" on:click={openFile}>
              <FileText size={16} />
              {t("openFile")}
            </button>
            <button type="button" on:click={openFolder}>
              <FolderOpen size={16} />
              {t("openFolder")}
            </button>
            <button type="button" class="ghost" on:click={loadSample}>
              {t("viewSample")}
            </button>
          </div>
          {#if recent.length}
            <div class="recent">
              {#each recent as item (item.path)}
                <button
                  type="button"
                  title={item.path}
                  on:click={() => openPath(item.path)}
                >
                  <FolderOpen size={14} />
                  <span>{item.name}</span>
                  <small>{item.path}</small>
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </section>

    {#if showOutline && !zenMode && activeFile?.kind === "markdown"}
      <aside class="right">
        <div class="panel-title">{t("outline")}</div>
        <div class="panel-body">
          <OutlinePanel
            file={activeFile}
            on:select={(event) => focusOutline(event.detail)}
          />
        </div>
      </aside>
    {/if}
  </main>

  {#if !zenMode}
    <footer>
      <span class="status">{status}</span>
      {#if workspace}
        <span class="counts">
          {workspace.fileCount}
          {t("files")} · {workspace.markdownCount}
          {t("docs")} · {workspace.configCount}
          {t("configs")}
        </span>
      {/if}
    </footer>
  {/if}

  {#if showSettings}
    <SettingsDialog
      settings={$settingsStore}
      on:close={() => (showSettings = false)}
      on:change={(event) => settingsStore.set(event.detail)}
    />
  {/if}

  {#if showCommands}
    <CommandPalette
      on:close={() => (showCommands = false)}
      on:choose={(event) => runCommand(event.detail)}
    />
  {/if}

  {#if showQuick}
    <QuickSwitcher
      {entries}
      recent={recent.map((item) => item.path)}
      on:close={() => (showQuick = false)}
      on:choose={(event) => {
        showQuick = false;
        void selectFile(event.detail);
      }}
    />
  {/if}

  {#if showSearch}
    <SearchPanel
      results={searchResults}
      busy={searchBusy}
      on:query={(event) => runSearch(event.detail)}
      on:choose={(event) => chooseSearchResult(event.detail)}
      on:close={() => (showSearch = false)}
    />
  {/if}
</div>

<style>
  :global(:root) {
    --app-bg: #f4f6fb;
    --surface: rgba(255, 255, 255, 0.82);
    --surface-strong: rgba(255, 255, 255, 0.95);
    --control-bg: rgba(255, 255, 255, 0.6);
    --control-bg-strong: rgba(20, 30, 50, 0.06);
    --neko-ink: #182033;
    --mikan-accent: #e85d75;
    --accent-blue: #4f6fd8;
    --matcha-success: #2f9f83;
    --ume-danger: #c94b66;
    --yuki-border: rgba(35, 49, 73, 0.13);
    --kumo-muted: #647088;
    --code-bg: #0f1521;
    --code-ink: #e8eefb;
    --inline-code-bg: rgba(79, 111, 216, 0.12);
    --inline-code-ink: #3453bd;
    --diagram-bg: #fbfcff;
    --syntax-keyword: #c0426a;
    --syntax-string: #2f8f6b;
    --syntax-number: #b9772a;
    --syntax-comment: #8d98aa;
    --soft-shadow: 0 14px 38px rgba(26, 35, 54, 0.07);
    font-family:
      Inter,
      ui-sans-serif,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
    color: var(--neko-ink);
    background: var(--app-bg);
    font-size: calc(16px * var(--font-scale, 1));
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }

  :global([data-theme="dark"]) {
    --app-bg: #0f1115;
    --surface: rgba(24, 28, 34, 0.82);
    --surface-strong: rgba(30, 35, 42, 0.96);
    --control-bg: rgba(255, 255, 255, 0.05);
    --control-bg-strong: rgba(255, 255, 255, 0.11);
    --neko-ink: #e9eef2;
    --mikan-accent: #ff6f91;
    --accent-blue: #88a6ff;
    --matcha-success: #66c2a5;
    --ume-danger: #ff7590;
    --yuki-border: rgba(237, 242, 244, 0.12);
    --kumo-muted: #9aa6b4;
    --code-bg: #0a0d12;
    --code-ink: #eef3fb;
    --inline-code-bg: rgba(136, 166, 255, 0.16);
    --inline-code-ink: #aebfff;
    --diagram-bg: #161a20;
    --syntax-keyword: #ff7da0;
    --syntax-string: #83d7b2;
    --syntax-number: #f3c46b;
    --syntax-comment: #7f8a99;
  }

  :global(body) {
    margin: 0;
    min-height: 100vh;
    background: var(--app-bg);
  }

  :global(*) {
    box-sizing: border-box;
  }

  :global(button:focus-visible),
  :global(input:focus-visible),
  :global(select:focus-visible),
  :global(a:focus-visible) {
    outline: 2px solid var(--mikan-accent);
    outline-offset: 2px;
  }

  .app {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    height: 100vh;
    background: var(--app-bg);
  }

  .app.zen {
    grid-template-rows: minmax(0, 1fr);
  }

  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 14px;
    border-bottom: 1px solid var(--yuki-border);
    background: var(--surface);
    backdrop-filter: blur(18px) saturate(1.2);
  }

  .identity {
    display: flex;
    align-items: center;
    gap: 11px;
    min-width: 0;
  }

  .titles {
    display: grid;
    min-width: 0;
  }

  .titles strong {
    font-size: 14px;
  }

  .titles strong,
  .titles span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .titles span {
    color: var(--kumo-muted);
    font-size: 12px;
  }

  .mark {
    width: 34px;
    height: 34px;
    border: 1px solid var(--yuki-border);
    border-radius: 10px;
    background: var(--surface-strong);
    object-fit: contain;
  }

  nav {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  nav .sep {
    width: 1px;
    height: 20px;
    margin: 0 3px;
    background: var(--yuki-border);
  }

  nav button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border: 1px solid transparent;
    border-radius: 9px;
    background: transparent;
    color: var(--neko-ink);
    cursor: pointer;
  }

  nav button:hover:not(:disabled) {
    background: var(--control-bg-strong);
  }

  nav button.on {
    border-color: color-mix(in srgb, var(--accent-blue) 45%, transparent);
    background: color-mix(in srgb, var(--accent-blue) 14%, transparent);
    color: var(--accent-blue);
  }

  nav button:disabled {
    opacity: 0.4;
    cursor: default;
  }

  main {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    min-height: 0;
    gap: 12px;
    padding: 12px;
  }

  main.with-sidebar {
    grid-template-columns: var(--sidebar-w, 264px) minmax(0, 1fr);
  }

  main.with-outline {
    grid-template-columns: minmax(0, 1fr) 300px;
  }

  main.with-sidebar.with-outline {
    grid-template-columns: var(--sidebar-w, 264px) minmax(0, 1fr) 300px;
  }

  main.zen {
    grid-template-columns: minmax(0, 1fr);
    padding: 0;
    gap: 0;
  }

  .left,
  .center,
  .right {
    min-height: 0;
    border: 1px solid var(--yuki-border);
    border-radius: 12px;
    background: var(--surface);
    box-shadow: var(--soft-shadow);
  }

  .left,
  .right {
    padding: 12px;
    overflow: hidden;
  }

  .center {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    overflow: hidden;
  }

  .center.zen-center {
    grid-template-rows: minmax(0, 1fr);
    border: 0;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
  }

  .docbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 9px 12px;
    border-bottom: 1px solid var(--yuki-border);
  }

  .breadcrumbs {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
    color: var(--kumo-muted);
    font-size: 12px;
  }

  .breadcrumbs span,
  .breadcrumbs strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .breadcrumbs strong {
    color: var(--neko-ink);
  }

  .view-toggle {
    display: flex;
    gap: 3px;
    padding: 3px;
    border: 1px solid var(--yuki-border);
    border-radius: 10px;
    background: var(--control-bg);
  }

  .view-toggle button {
    padding: 4px 12px;
    border: 1px solid transparent;
    border-radius: 7px;
    background: transparent;
    color: var(--kumo-muted);
    font: inherit;
    font-size: 13px;
    cursor: pointer;
  }

  .view-toggle button.active {
    border-color: var(--yuki-border);
    background: var(--surface-strong);
    color: var(--neko-ink);
    box-shadow: var(--soft-shadow);
  }

  .document {
    min-height: 0;
    overflow: hidden;
  }

  .document.split {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .document.split > :global(*) {
    border-right: 1px solid var(--yuki-border);
  }

  .zen-center .document {
    height: 100%;
  }

  .right {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 10px;
  }

  .panel-title {
    color: var(--kumo-muted);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .panel-body {
    min-height: 0;
    overflow: auto;
  }

  .welcome {
    display: grid;
    align-content: center;
    justify-items: center;
    gap: 8px;
    height: 100%;
    padding: 24px;
    text-align: center;
  }

  .welcome-mark {
    width: 72px;
    height: 72px;
    margin-bottom: 6px;
    border-radius: 18px;
    object-fit: contain;
  }

  .welcome h1 {
    margin: 0;
    font-size: 22px;
  }

  .welcome p {
    max-width: 420px;
    margin: 0 0 8px;
    color: var(--kumo-muted);
  }

  .welcome-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }

  .welcome-actions button {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 15px;
    border: 1px solid var(--yuki-border);
    border-radius: 10px;
    background: var(--control-bg);
    color: var(--neko-ink);
    font: inherit;
    cursor: pointer;
  }

  .welcome-actions button:hover {
    background: var(--control-bg-strong);
  }

  .welcome-actions .primary {
    border-color: transparent;
    background: var(--mikan-accent);
    color: #fff;
  }

  .welcome-actions .ghost {
    border-color: transparent;
    background: transparent;
    color: var(--kumo-muted);
  }

  .recent {
    display: grid;
    gap: 4px;
    width: min(460px, 100%);
    margin-top: 14px;
  }

  .recent button {
    display: grid;
    grid-template-columns: 16px auto minmax(0, 1fr);
    align-items: center;
    gap: 9px;
    padding: 8px 11px;
    border: 1px solid var(--yuki-border);
    border-radius: 9px;
    background: var(--control-bg);
    color: var(--neko-ink);
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  .recent button:hover {
    background: var(--control-bg-strong);
  }

  .recent small {
    overflow: hidden;
    color: var(--kumo-muted);
    font-size: 11px;
    text-align: right;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 7px 14px;
    border-top: 1px solid var(--yuki-border);
    background: var(--surface);
    color: var(--kumo-muted);
    font-size: 12px;
  }

  .status,
  .counts {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 1024px) {
    main.with-sidebar.with-outline,
    main.with-outline {
      grid-template-columns: var(--sidebar-w, 264px) minmax(0, 1fr);
    }
    .right {
      display: none;
    }
  }

  @media (max-width: 720px) {
    main.with-sidebar,
    main.with-sidebar.with-outline {
      grid-template-columns: minmax(0, 1fr);
    }
    .left {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :global(*) {
      scroll-behavior: auto;
      transition: none;
    }
  }
</style>
