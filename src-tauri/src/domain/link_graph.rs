use std::{collections::BTreeSet, fs};

use ignore::WalkBuilder;
use regex::Regex;

use crate::domain::{
    errors::NekoResult,
    formatters::detect_document_kind,
    models::{DocumentKind, LinkEdge, LinkGraph, LinkNode},
    security,
};

pub fn build_link_graph(workspace: &str) -> NekoResult<LinkGraph> {
    let root = security::normalize_workspace(workspace)?;
    let wiki = Regex::new(r"\[\[([^\]|#]+)").expect("wiki link regex");
    let markdown = Regex::new(r"\[[^\]]+\]\(([^)#]+)").expect("markdown link regex");
    let mut nodes = Vec::new();
    let mut existing = BTreeSet::new();
    let mut edges = Vec::new();
    let mut broken_links = Vec::new();
    for entry in WalkBuilder::new(&root)
        .hidden(true)
        .git_ignore(true)
        .build()
        .filter_map(Result::ok)
    {
        if !entry
            .file_type()
            .map(|kind| kind.is_file())
            .unwrap_or(false)
        {
            continue;
        }
        let relative = security::relative_path(&root, entry.path());
        if detect_document_kind(&relative, None) != DocumentKind::Markdown {
            continue;
        }
        existing.insert(relative.clone());
        let title = fs::read_to_string(entry.path())
            .ok()
            .and_then(|content| {
                content
                    .lines()
                    .find_map(|line| line.strip_prefix("# "))
                    .map(str::to_string)
            })
            .unwrap_or_else(|| relative.clone());
        nodes.push(LinkNode {
            path: relative.clone(),
            title,
        });
    }
    for node in &nodes {
        let full_path = root.join(&node.path);
        let Ok(content) = fs::read_to_string(full_path) else {
            continue;
        };
        for capture in wiki.captures_iter(&content) {
            let target = normalize_markdown_target(&capture[1]);
            let edge = LinkEdge {
                source: node.path.clone(),
                target,
                kind: "wikilink".to_string(),
            };
            if existing.contains(&edge.target) {
                edges.push(edge);
            } else {
                broken_links.push(edge);
            }
        }
        for capture in markdown.captures_iter(&content) {
            let raw = capture[1].trim();
            if raw.starts_with("http://") || raw.starts_with("https://") || raw.starts_with('#') {
                continue;
            }
            let target = normalize_markdown_target(raw);
            let edge = LinkEdge {
                source: node.path.clone(),
                target,
                kind: "markdown".to_string(),
            };
            if existing.contains(&edge.target) {
                edges.push(edge);
            } else {
                broken_links.push(edge);
            }
        }
    }
    Ok(LinkGraph {
        nodes,
        edges,
        broken_links,
    })
}

fn normalize_markdown_target(value: &str) -> String {
    let mut target = value.trim().replace('\\', "/");
    if !target.ends_with(".md") && !target.ends_with(".markdown") {
        target.push_str(".md");
    }
    target
}
