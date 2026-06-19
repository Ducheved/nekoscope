<script lang="ts">
  import {
    Box,
    Braces,
    ChevronDown,
    ChevronRight,
    Database,
    FileCode2,
    FileCog,
    FileJson,
    FileKey2,
    FileText,
    Folder,
    FolderOpen,
    NotebookText,
    Search,
    Workflow,
  } from "@lucide/svelte";
  import { createEventDispatcher } from "svelte";
  import { translate } from "$lib/neko/i18n";
  import { settingsStore } from "$lib/neko/settingsStore";
  import { visibleFiles } from "$lib/neko/fileTree";
  import type { DocumentKind, FileTreeEntry } from "$lib/neko/types";

  export let entries: FileTreeEntry[] = [];
  export let activePath = "";

  interface TreeNode {
    id: string;
    name: string;
    path: string;
    isDir: boolean;
    depth: number;
    entry?: FileTreeEntry;
    children: TreeNode[];
  }

  interface TreeRow {
    node: TreeNode;
    expanded: boolean;
  }

  const dispatch = createEventDispatcher<{ select: FileTreeEntry }>();
  let filter = "";
  let expanded = new Set<string>();
  $: t = (key: Parameters<typeof translate>[1]) =>
    translate($settingsStore.locale, key);
  $: shown = visibleFiles(entries, filter);
  $: tree = buildTree(shown);
  $: rows = flattenTree(tree, expanded, Boolean(filter.trim()));

  function buildTree(items: FileTreeEntry[]): TreeNode[] {
    const root: TreeNode = {
      id: "",
      name: "",
      path: "",
      isDir: true,
      depth: -1,
      children: [],
    };
    const nodes = new Map<string, TreeNode>([["", root]]);
    for (const entry of [...items].sort(compareEntries)) {
      const parts = entry.path.split(/[\\/]+/).filter(Boolean);
      let parent = root;
      parts.forEach((part, index) => {
        const path = parts.slice(0, index + 1).join("/");
        const isLeaf = index === parts.length - 1;
        const isDir = isLeaf ? entry.isDir : true;
        let node = nodes.get(path);
        if (!node) {
          node = {
            id: path,
            name: part,
            path,
            isDir,
            depth: index,
            children: [],
          };
          nodes.set(path, node);
          parent.children.push(node);
        }
        if (isLeaf) {
          node.entry = entry;
          node.isDir = entry.isDir;
          node.name = entry.name;
        }
        parent = node;
      });
    }
    sortChildren(root);
    return root.children;
  }

  function flattenTree(
    nodes: TreeNode[],
    open: Set<string>,
    forceOpen: boolean,
  ): TreeRow[] {
    return nodes.flatMap((node) => {
      const expandedNow = forceOpen || open.has(node.path) || node.depth < 1;
      const childRows =
        node.isDir && expandedNow
          ? flattenTree(node.children, open, forceOpen)
          : [];
      return [{ node, expanded: expandedNow }, ...childRows];
    });
  }

  function compareEntries(left: FileTreeEntry, right: FileTreeEntry) {
    if (left.isDir !== right.isDir) return left.isDir ? -1 : 1;
    return left.path.localeCompare(right.path);
  }

  function sortChildren(node: TreeNode) {
    node.children.sort((left, right) => {
      if (left.isDir !== right.isDir) return left.isDir ? -1 : 1;
      return left.name.localeCompare(right.name);
    });
    node.children.forEach(sortChildren);
  }

  function toggle(path: string) {
    expanded = new Set(expanded);
    if (expanded.has(path)) {
      expanded.delete(path);
    } else {
      expanded.add(path);
    }
  }

  function choose(node: TreeNode) {
    if (node.isDir) {
      toggle(node.path);
      return;
    }
    if (node.entry) dispatch("select", node.entry);
  }

  function iconKind(entry?: FileTreeEntry): DocumentKind | "folder" {
    return entry?.kind ?? "folder";
  }
</script>

<section class="explorer" aria-label="Workspace files">
  <label class="filter">
    <Search size={15} />
    <input bind:value={filter} placeholder={t("filterFiles")} />
  </label>
  <div class="tree">
    {#each rows as row}
      <button
        class:active={row.node.entry?.path === activePath}
        class:dir={row.node.isDir}
        type="button"
        title={row.node.path}
        style={`padding-left: ${8 + row.node.depth * 14}px`}
        on:click={() => choose(row.node)}
      >
        <span class="chevron" aria-hidden="true">
          {#if row.node.isDir}
            {#if row.expanded}
              <ChevronDown size={14} />
            {:else}
              <ChevronRight size={14} />
            {/if}
          {/if}
        </span>
        <span class="icon" aria-hidden="true">
          {#if row.node.isDir && row.expanded}
            <FolderOpen size={16} />
          {:else if row.node.isDir}
            <Folder size={16} />
          {:else if iconKind(row.node.entry) === "markdown"}
            <NotebookText size={16} />
          {:else if iconKind(row.node.entry) === "json" || iconKind(row.node.entry) === "jsonc"}
            <FileJson size={16} />
          {:else if iconKind(row.node.entry) === "yaml" || iconKind(row.node.entry) === "toml"}
            <FileCog size={16} />
          {:else if iconKind(row.node.entry) === "env"}
            <FileKey2 size={16} />
          {:else if iconKind(row.node.entry) === "terraform" || iconKind(row.node.entry) === "dockerfile"}
            <Box size={16} />
          {:else if iconKind(row.node.entry) === "notebook"}
            <Database size={16} />
          {:else if iconKind(row.node.entry) === "mindmap" || iconKind(row.node.entry) === "opml"}
            <Workflow size={16} />
          {:else if iconKind(row.node.entry) === "text"}
            <FileText size={16} />
          {:else if iconKind(row.node.entry) === "xml"}
            <Braces size={16} />
          {:else}
            <FileCode2 size={16} />
          {/if}
        </span>
        <span class="name">{row.node.name}</span>
      </button>
    {/each}
  </div>
</section>

<style>
  .explorer {
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 12px;
    min-height: 0;
    height: 100%;
  }

  .filter {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border: 1px solid var(--yuki-border);
    border-radius: 10px;
    background: var(--control-bg);
  }

  input {
    min-width: 0;
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--neko-ink);
    font: inherit;
  }

  .tree {
    display: grid;
    align-content: start;
    gap: 3px;
    min-height: 0;
    overflow: auto;
    padding-right: 3px;
  }

  button {
    display: grid;
    grid-template-columns: 16px 18px minmax(0, 1fr);
    align-items: center;
    gap: 6px;
    width: 100%;
    min-height: 32px;
    padding: 6px 8px;
    border: 1px solid transparent;
    border-radius: 8px;
    background: transparent;
    color: var(--neko-ink);
    text-align: left;
    font: inherit;
    cursor: pointer;
  }

  button:hover,
  button.active {
    border-color: var(--yuki-border);
    background: var(--control-bg-strong);
  }

  .chevron,
  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--kumo-muted);
  }

  .dir .icon {
    color: var(--accent-blue);
  }

  button:not(.dir) .icon {
    color: var(--mikan-accent);
  }

  .name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
