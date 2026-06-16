<script lang="ts">
  import {
    Bot,
    Braces,
    Command,
    ExternalLink,
    FileSearch,
    FolderOpen,
    GitBranch,
    Map,
    Maximize2,
    Save,
    Search,
    Settings,
  } from "@lucide/svelte";
  import { get } from "svelte/store";
  import { translate } from "$lib/neko/i18n";
  import { buildIdeRequest } from "$lib/neko/ideBridge";
  import { firstReadableFile } from "$lib/neko/fileTree";
  import { formatDocument } from "$lib/neko/formatters";
  import {
    demoTree,
    demoWorkspace,
    readDemoFile,
  } from "$lib/neko/demoWorkspace";
  import { invokeNeko, openFolderDialog } from "$lib/neko/tauriBridge";
  import { settingsStore } from "$lib/neko/settingsStore";
  import { applyTheme } from "$lib/neko/themeTokens";
  import type {
    AiRequest,
    AiResponse,
    CommentItem,
    FilePayload,
    FileTreeEntry,
    LocaleCode,
    SyncProfile,
    WorkspaceSummary,
  } from "$lib/neko/types";
  import AskAiPanel from "./AskAiPanel.svelte";
  import CommandPalette from "./CommandPalette.svelte";
  import CommentsPanel from "./CommentsPanel.svelte";
  import DiagramPanel from "./DiagramPanel.svelte";
  import DocumentTabs from "./DocumentTabs.svelte";
  import FileExplorer from "./FileExplorer.svelte";
  import MarkdownViewer from "./MarkdownViewer.svelte";
  import MetadataPanel from "./MetadataPanel.svelte";
  import MindmapPanel from "./MindmapPanel.svelte";
  import OutlinePanel from "./OutlinePanel.svelte";
  import QuickSwitcher from "./QuickSwitcher.svelte";
  import SettingsDialog from "./SettingsDialog.svelte";
  import SourceViewer from "./SourceViewer.svelte";
  import WelcomeNeko from "./WelcomeNeko.svelte";

  let workspace: WorkspaceSummary = demoWorkspace;
  let entries: FileTreeEntry[] = demoTree;
  let openFiles: FilePayload[] = [readDemoFile("README.md")];
  let activePath = "README.md";
  let rightPanel:
    | "outline"
    | "mindmap"
    | "diagrams"
    | "metadata"
    | "comments"
    | "ai" = "outline";
  let viewMode: "rendered" | "source" | "split" = "rendered";
  let showWelcome = true;
  let showSettings = false;
  let showCommands = false;
  let showQuick = false;
  let recent: string[] = ["README.md"];
  let comments: CommentItem[] = [];
  let diagramScale = 1;
  let formatPreview = "";
  let aiResponse: AiResponse | null = null;
  let status = "Ready";

  $: activeFile =
    openFiles.find((file) => file.path === activePath) ?? openFiles[0];
  $: t = (key: Parameters<typeof translate>[1]) =>
    translate($settingsStore.locale, key);
  $: applyTheme($settingsStore.theme);

  async function loadSample() {
    workspace = demoWorkspace;
    entries = demoTree;
    openFiles = [readDemoFile("README.md")];
    activePath = "README.md";
    comments = [];
    showWelcome = false;
    status = "Sample workspace loaded";
  }

  async function openWorkspace() {
    const path = await openFolderDialog();
    if (!path) {
      await loadSample();
      return;
    }
    workspace = await invokeNeko<WorkspaceSummary>(
      "open_workspace",
      { path },
      () => demoWorkspace,
    );
    entries = await invokeNeko<FileTreeEntry[]>(
      "list_workspace_tree",
      { path, includeHidden: false },
      () => demoTree,
    );
    await invokeNeko("watch_workspace", { path }, () => null);
    comments = await invokeNeko<CommentItem[]>(
      "load_comments",
      { workspace: workspace.path },
      () => [],
    );
    const first = firstReadableFile(entries);
    if (first) await selectFile(first);
    showWelcome = false;
    status = `Opened ${workspace.name}`;
  }

  async function selectFile(entry: FileTreeEntry) {
    if (entry.isDir) return;
    const file = await invokeNeko<FilePayload>(
      "read_workspace_file",
      { workspace: workspace.path, path: entry.path },
      () => readDemoFile(entry.path),
    );
    openFiles = [
      file,
      ...openFiles.filter((item) => item.path !== file.path),
    ].slice(0, 12);
    activePath = file.path;
    recent = [file.path, ...recent.filter((item) => item !== file.path)].slice(
      0,
      30,
    );
    formatPreview = "";
    status = file.path;
  }

  function activate(path: string) {
    activePath = path;
    recent = [path, ...recent.filter((item) => item !== path)].slice(0, 30);
  }

  function closeTab(path: string) {
    openFiles = openFiles.filter((file) => file.path !== path);
    activePath = openFiles[0]?.path ?? "";
  }

  function runCommand(id: string) {
    showCommands = false;
    if (id === "open-folder") void openWorkspace();
    if (id === "quick-switcher") showQuick = true;
    if (id === "search") status = "Search ready";
    if (id === "mindmap") rightPanel = "mindmap";
    if (id === "ask-ai") rightPanel = "ai";
    if (id === "open-ide") void openInIde();
  }

  function handleKeydown(event: KeyboardEvent) {
    const mod = event.metaKey || event.ctrlKey;
    if (!mod) {
      if (event.key === "Escape") {
        showCommands = false;
        showQuick = false;
        showSettings = false;
      }
      return;
    }
    if (event.key.toLowerCase() === "k") {
      event.preventDefault();
      showCommands = true;
    }
    if (event.key.toLowerCase() === "p") {
      event.preventDefault();
      showQuick = true;
    }
    if (event.key.toLowerCase() === "o" && event.shiftKey) {
      event.preventDefault();
      void openWorkspace();
    }
    if (event.key === "Enter") {
      event.preventDefault();
      rightPanel = "ai";
    }
    if (event.key.toLowerCase() === "m" && event.shiftKey) {
      event.preventDefault();
      rightPanel = "mindmap";
    }
    if (event.key.toLowerCase() === "i" && event.shiftKey) {
      event.preventDefault();
      void openInIde();
    }
  }

  function previewFormat() {
    if (!activeFile) return;
    try {
      formatPreview = formatDocument(activeFile.path, activeFile.content);
      status = "Format preview ready";
    } catch (error) {
      status = error instanceof Error ? error.message : "Format unavailable";
    }
  }

  async function saveFormatted() {
    if (!activeFile || !formatPreview) return;
    const saved = await invokeNeko<FilePayload>(
      "write_workspace_file",
      {
        workspace: workspace.path,
        path: activeFile.path,
        content: formatPreview,
      },
      () => ({
        ...activeFile,
        content: formatPreview,
        size: formatPreview.length,
      }),
    );
    openFiles = [
      saved,
      ...openFiles.filter((file) => file.path !== saved.path),
    ];
    activePath = saved.path;
    formatPreview = "";
    status = "Formatted file saved";
  }

  async function addComment(comment: CommentItem) {
    comments = await invokeNeko<CommentItem[]>(
      "save_comment",
      { workspace: workspace.path, comment },
      () => [
        ...comments,
        {
          ...comment,
          id: `comment-${Date.now()}`,
          createdAt: String(Date.now()),
        },
      ],
    );
  }

  async function resolveComment(id: string) {
    comments = await invokeNeko<CommentItem[]>(
      "resolve_comment",
      { workspace: workspace.path, id },
      () =>
        comments.map((comment) =>
          comment.id === id ? { ...comment, state: "resolved" } : comment,
        ),
    );
  }

  async function sendAi(request: AiRequest) {
    aiResponse = await invokeNeko<AiResponse>(
      "ask_ai_stream",
      { request },
      () => ({
        provider: request.profile.name,
        model: request.profile.model,
        contextBytes: request.context.reduce(
          (sum, file) => sum + file.content.length,
          0,
        ),
        redactedPrompt: request.prompt,
        requestPreview: request,
      }),
    );
    status = "AI request preview created";
  }

  async function saveSync(profile: SyncProfile) {
    const saved = await invokeNeko<SyncProfile>(
      "save_sync_profile",
      { profile },
      () => profile,
    );
    const settings = get(settingsStore);
    settingsStore.set({
      ...settings,
      syncProfiles: [
        saved,
        ...settings.syncProfiles.filter((item) => item.id !== saved.id),
      ],
    });
    status = "Sync profile saved";
  }

  async function openInIde() {
    if (!activeFile) return;
    await invokeNeko(
      "open_in_ide",
      {
        request: buildIdeRequest(
          `${workspace.path}/${activeFile.path}`,
          "system",
        ),
      },
      () => ({ opened: true, target: activeFile.path, method: "browser" }),
    );
  }

  async function revealFile() {
    if (!activeFile) return;
    await invokeNeko(
      "reveal_in_file_manager",
      { path: `${workspace.path}/${activeFile.path}` },
      () => ({ opened: true, target: activeFile.path, method: "browser" }),
    );
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="app" style={`--font-scale: ${$settingsStore.fontScale}`}>
  <header class="topbar">
    <div class="identity">
      <div class="mark" aria-hidden="true"></div>
      <div>
        <strong>NekoScope</strong>
        <span
          >{workspace.name}{workspace.gitBranch
            ? ` · ${workspace.gitBranch}`
            : ""}</span
        >
      </div>
    </div>
    <nav aria-label="Command bar">
      <button type="button" title={t("openFolder")} on:click={openWorkspace}
        ><FolderOpen size={17} /></button
      >
      <button
        type="button"
        title={t("quickSwitcher")}
        on:click={() => (showQuick = true)}><FileSearch size={17} /></button
      >
      <button
        type="button"
        title={t("search")}
        on:click={() => (status = "Search ready")}><Search size={17} /></button
      >
      <button
        type="button"
        title={t("mindmap")}
        on:click={() => (rightPanel = "mindmap")}><Map size={17} /></button
      >
      <button type="button" title={t("format")} on:click={previewFormat}
        ><Braces size={17} /></button
      >
      <button
        type="button"
        title={t("askAi")}
        on:click={() => (rightPanel = "ai")}><Bot size={17} /></button
      >
      <button type="button" title={t("openInIde")} on:click={openInIde}
        ><ExternalLink size={17} /></button
      >
      <button type="button" title={t("reveal")} on:click={revealFile}
        ><Maximize2 size={17} /></button
      >
      <button
        type="button"
        title={t("settings")}
        on:click={() => (showSettings = true)}><Settings size={17} /></button
      >
      <button
        type="button"
        title="Command palette"
        on:click={() => (showCommands = true)}><Command size={17} /></button
      >
    </nav>
  </header>

  <main class:welcome-mode={showWelcome}>
    {#if showWelcome}
      <WelcomeNeko
        locale={$settingsStore.locale}
        on:open={openWorkspace}
        on:sample={loadSample}
        on:locale={(event) =>
          settingsStore.set({
            ...$settingsStore,
            locale: event.detail as LocaleCode,
          })}
      />
    {:else if activeFile}
      <aside class="left">
        <FileExplorer
          {entries}
          activePath={activeFile.path}
          on:select={(event) => selectFile(event.detail)}
        />
      </aside>
      <section class="center">
        <DocumentTabs
          files={openFiles}
          activePath={activeFile.path}
          on:activate={(event) => activate(event.detail)}
          on:close={(event) => closeTab(event.detail)}
        />
        <div class="breadcrumbs">
          <GitBranch size={14} />
          <span>{workspace.path}</span>
          <strong>{activeFile.path}</strong>
        </div>
        <div class="view-toggle" role="tablist" aria-label="View mode">
          <button
            class:active={viewMode === "rendered"}
            type="button"
            on:click={() => (viewMode = "rendered")}>Rendered</button
          >
          <button
            class:active={viewMode === "source"}
            type="button"
            on:click={() => (viewMode = "source")}>Source</button
          >
          <button
            class:active={viewMode === "split"}
            type="button"
            on:click={() => (viewMode = "split")}>Split</button
          >
          {#if formatPreview}
            <button class="save" type="button" on:click={saveFormatted}
              ><Save size={14} /> Save formatted</button
            >
          {/if}
        </div>
        <div class="document" class:split={viewMode === "split"}>
          {#if viewMode === "rendered"}
            <MarkdownViewer
              file={formatPreview
                ? {
                    ...activeFile,
                    content: formatPreview,
                    size: formatPreview.length,
                  }
                : activeFile}
            />
          {:else if viewMode === "source"}
            <SourceViewer
              file={formatPreview
                ? {
                    ...activeFile,
                    content: formatPreview,
                    size: formatPreview.length,
                  }
                : activeFile}
            />
          {:else}
            <MarkdownViewer file={activeFile} />
            <SourceViewer
              file={formatPreview
                ? {
                    ...activeFile,
                    content: formatPreview,
                    size: formatPreview.length,
                  }
                : activeFile}
            />
          {/if}
        </div>
      </section>
      <aside class="right">
        <div class="panel-tabs">
          <button
            class:active={rightPanel === "outline"}
            type="button"
            on:click={() => (rightPanel = "outline")}>{t("outline")}</button
          >
          <button
            class:active={rightPanel === "mindmap"}
            type="button"
            on:click={() => (rightPanel = "mindmap")}>{t("mindmap")}</button
          >
          <button
            class:active={rightPanel === "diagrams"}
            type="button"
            on:click={() => (rightPanel = "diagrams")}>{t("diagrams")}</button
          >
          <button
            class:active={rightPanel === "metadata"}
            type="button"
            on:click={() => (rightPanel = "metadata")}>{t("metadata")}</button
          >
          <button
            class:active={rightPanel === "comments"}
            type="button"
            on:click={() => (rightPanel = "comments")}>{t("comments")}</button
          >
          <button
            class:active={rightPanel === "ai"}
            type="button"
            on:click={() => (rightPanel = "ai")}>{t("askAi")}</button
          >
        </div>
        <div class="panel-body">
          {#if rightPanel === "outline"}
            <OutlinePanel file={activeFile} />
          {:else if rightPanel === "mindmap"}
            <MindmapPanel
              file={activeFile}
              scale={diagramScale}
              on:scale={(event) => (diagramScale = event.detail)}
            />
          {:else if rightPanel === "diagrams"}
            <DiagramPanel
              file={activeFile}
              scale={diagramScale}
              on:scale={(event) => (diagramScale = event.detail)}
            />
          {:else if rightPanel === "metadata"}
            <MetadataPanel file={activeFile} />
          {:else if rightPanel === "comments"}
            <CommentsPanel
              file={activeFile}
              {comments}
              on:add={(event) => addComment(event.detail)}
              on:resolve={(event) => resolveComment(event.detail)}
            />
          {:else}
            <AskAiPanel
              file={activeFile}
              settings={$settingsStore}
              response={aiResponse}
              on:send={(event) => sendAi(event.detail)}
            />
          {/if}
        </div>
      </aside>
    {/if}
  </main>

  <footer>
    <span>{status}</span>
    <span
      >{workspace.fileCount} files · {workspace.markdownCount} docs · {workspace.configCount}
      configs</span
    >
  </footer>

  {#if showSettings}
    <SettingsDialog
      settings={$settingsStore}
      on:close={() => (showSettings = false)}
      on:change={(event) => settingsStore.set(event.detail)}
      on:saveSync={(event) => saveSync(event.detail)}
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
      {recent}
      on:close={() => (showQuick = false)}
      on:choose={(event) => {
        showQuick = false;
        void selectFile(event.detail);
      }}
    />
  {/if}
</div>

<style>
  :global(:root) {
    --sakura-bg: #f7eef3;
    --mochi-surface: rgba(255, 255, 255, 0.72);
    --neko-ink: #182026;
    --mikan-accent: #f08a4b;
    --matcha-success: #4f9d69;
    --ume-danger: #c8495f;
    --yuki-border: rgba(74, 85, 104, 0.18);
    --kumo-muted: #687383;
    font-family:
      Inter,
      ui-sans-serif,
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
    color: var(--neko-ink);
    background:
      linear-gradient(
        135deg,
        rgba(247, 238, 243, 0.96),
        rgba(232, 244, 241, 0.92)
      ),
      radial-gradient(
        circle at 80% 10%,
        rgba(240, 138, 75, 0.16),
        transparent 30%
      );
    font-size: calc(16px * var(--font-scale, 1));
    line-height: 1.45;
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
  }

  :global([data-theme="dark"]) {
    --sakura-bg: #15191d;
    --mochi-surface: rgba(30, 37, 43, 0.78);
    --neko-ink: #edf3f7;
    --yuki-border: rgba(218, 226, 233, 0.14);
    --kumo-muted: #aab5c0;
    background:
      linear-gradient(135deg, #15191d, #20282d),
      radial-gradient(
        circle at 80% 10%,
        rgba(240, 138, 75, 0.14),
        transparent 30%
      );
  }

  :global(body) {
    min-width: 320px;
    min-height: 100vh;
    margin: 0;
  }

  :global(button:focus-visible),
  :global(input:focus-visible),
  :global(select:focus-visible),
  :global(textarea:focus-visible),
  :global(a:focus-visible) {
    outline: 2px solid var(--mikan-accent);
    outline-offset: 2px;
  }

  :global(*) {
    box-sizing: border-box;
  }

  .app {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    height: 100vh;
    min-height: 680px;
    color: var(--neko-ink);
  }

  .topbar {
    display: grid;
    grid-template-columns: minmax(220px, 1fr) auto;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-bottom: 1px solid var(--yuki-border);
    background: rgba(255, 255, 255, 0.58);
    backdrop-filter: blur(20px) saturate(1.28);
  }

  .identity {
    display: flex;
    align-items: center;
    gap: 11px;
    min-width: 0;
  }

  .identity div:last-child {
    display: grid;
    min-width: 0;
  }

  .identity strong,
  .identity span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .identity span {
    color: var(--kumo-muted);
    font-size: 12px;
  }

  .mark {
    width: 34px;
    height: 34px;
    border: 1px solid rgba(240, 138, 75, 0.35);
    border-radius: 8px;
    background:
      linear-gradient(
          135deg,
          transparent 42%,
          var(--mikan-accent) 43% 58%,
          transparent 59%
        )
        left top / 50% 48% no-repeat,
      linear-gradient(
          225deg,
          transparent 42%,
          var(--mikan-accent) 43% 58%,
          transparent 59%
        )
        right top / 50% 48% no-repeat,
      rgba(255, 255, 255, 0.82);
  }

  nav {
    display: flex;
    gap: 6px;
    overflow-x: auto;
  }

  nav button,
  .view-toggle button,
  .panel-tabs button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 34px;
    min-height: 34px;
    border: 1px solid var(--yuki-border);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.62);
    color: var(--neko-ink);
    cursor: pointer;
  }

  main {
    display: grid;
    grid-template-columns: 280px minmax(0, 1fr) 340px;
    min-height: 0;
    gap: 12px;
    padding: 12px;
  }

  main.welcome-mode {
    grid-template-columns: 1fr;
  }

  .left,
  .center,
  .right {
    min-height: 0;
    border: 1px solid var(--yuki-border);
    border-radius: 8px;
    background: var(--mochi-surface);
    box-shadow: 0 18px 50px rgba(24, 32, 38, 0.08);
    backdrop-filter: blur(20px) saturate(1.22);
  }

  .left,
  .right {
    padding: 12px;
    overflow: hidden;
  }

  .center {
    display: grid;
    grid-template-rows: auto auto auto minmax(0, 1fr);
    overflow: hidden;
  }

  .breadcrumbs {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    padding: 0 14px 9px;
    color: var(--kumo-muted);
    font-size: 12px;
  }

  .breadcrumbs span,
  .breadcrumbs strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .view-toggle {
    display: flex;
    gap: 6px;
    padding: 0 14px 10px;
  }

  .view-toggle button {
    padding: 0 10px;
    font: inherit;
  }

  .view-toggle button.active,
  .panel-tabs button.active {
    border-color: rgba(240, 138, 75, 0.6);
    background: rgba(240, 138, 75, 0.12);
  }

  .view-toggle .save {
    gap: 6px;
    margin-left: auto;
    color: var(--matcha-success);
  }

  .document {
    min-height: 0;
    overflow: hidden;
  }

  .document.split {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }

  .right {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 12px;
  }

  .panel-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .panel-tabs button {
    min-width: auto;
    padding: 0 9px;
    font: inherit;
    font-size: 12px;
  }

  .panel-body {
    min-height: 0;
    overflow: auto;
  }

  footer {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 14px;
    border-top: 1px solid var(--yuki-border);
    color: var(--kumo-muted);
    font-size: 12px;
    background: rgba(255, 255, 255, 0.46);
  }

  @media (max-width: 1120px) {
    main {
      grid-template-columns: 240px minmax(0, 1fr);
    }

    .right {
      grid-column: 1 / -1;
      min-height: 280px;
    }
  }

  @media (max-width: 760px) {
    .topbar {
      grid-template-columns: 1fr;
    }

    main {
      grid-template-columns: 1fr;
    }

    .document.split {
      grid-template-columns: 1fr;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :global(*) {
      scroll-behavior: auto;
      transition: none;
    }
  }
</style>
