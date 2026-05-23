const colorClasses = new Set([
  "red",
  "yellow",
  "blue",
  "cyan",
  "green",
  "orange",
  "magenta",
  "violet",
  "white",
  "dim",
  "faint",
]);

const ignoredParents = new Set(["code", "pre", "script", "style", "textarea"]);
const colorToken = /\{\{([a-z]+):\s*([^{}]+?)\}\}/g;

function hasClass(node, className) {
  const classes = node.properties?.className;
  return Array.isArray(classes) && classes.includes(className);
}

function shouldSkip(ancestors) {
  return ancestors.some((ancestor) => {
    if (ignoredParents.has(ancestor.tagName)) return true;
    return hasClass(ancestor, "katex") || hasClass(ancestor, "katex-display");
  });
}

function colorizeTextNode(node) {
  const value = node.value;
  const nodes = [];
  let lastIndex = 0;
  let match;

  colorToken.lastIndex = 0;
  while ((match = colorToken.exec(value))) {
    const [, color, text] = match;
    if (!colorClasses.has(color)) continue;

    if (match.index > lastIndex) {
      nodes.push({ type: "text", value: value.slice(lastIndex, match.index) });
    }

    nodes.push({
      type: "element",
      tagName: "span",
      properties: { className: [color] },
      children: [{ type: "text", value: text }],
    });

    lastIndex = match.index + match[0].length;
  }

  if (!nodes.length) return null;
  if (lastIndex < value.length) {
    nodes.push({ type: "text", value: value.slice(lastIndex) });
  }
  return nodes;
}

function visit(node, ancestors = []) {
  if (!node || !Array.isArray(node.children)) return;

  for (let index = 0; index < node.children.length; index += 1) {
    const child = node.children[index];

    if (child.type === "text" && !shouldSkip(ancestors)) {
      const replacement = colorizeTextNode(child);
      if (replacement) {
        node.children.splice(index, 1, ...replacement);
        index += replacement.length - 1;
      }
      continue;
    }

    if (child.type === "element") {
      visit(child, [...ancestors, child]);
    }
  }
}

export default function rehypeTerminalColors() {
  return (tree) => visit(tree);
}
