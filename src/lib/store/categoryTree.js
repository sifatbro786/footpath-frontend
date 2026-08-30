// src/lib/store/categoryTree.js
//
// Helpers over the nested tree returned by GET /api/categories/tree
//   { success, count, data: [{ _id, name, slug, children: [...] }] }
//
// Why a client-side tree rather than more endpoints: the backend does have
// GET /categories/:id/path for breadcrumbs, but it takes an ObjectId and the
// storefront routes by SLUG (/category/:slug), so using it would need a slug
// lookup first, then a walk up the ancestors, and each of those is a round
// trip on every category page view. The whole tree is small, changes rarely,
// and is already fetched for the filter sidebar. One cached request answers
// "what are the filters", "which category is this slug" and "what is the
// breadcrumb trail" at once.

/** Depth-first flatten, carrying depth so a list can be indented. */
export function flattenTree(nodes = [], depth = 0, out = []) {
    for (const node of nodes) {
        out.push({ ...node, depth });
        if (node.children?.length) flattenTree(node.children, depth + 1, out);
    }
    return out;
}

/**
 * Find a node by slug and return it together with its ancestors, root first.
 * Returns null when the slug is not in the tree (a bad URL, or an inactive
 * category the public tree omits).
 */
export function findCategoryPath(nodes = [], slug) {
    if (!slug) return null;

    const walk = (list, trail) => {
        for (const node of list) {
            const nextTrail = [...trail, node];
            if (node.slug === slug) return nextTrail;
            if (node.children?.length) {
                const found = walk(node.children, nextTrail);
                if (found) return found;
            }
        }
        return null;
    };

    return walk(nodes, []);
}

/**
 * Every descendant id of a category, including its own.
 *
 * Needed because getProducts filters by a single `category` id and matches
 * `{ $or: [{ category: id }, { subCategory: id }] }` — it does NOT walk the
 * tree. So browsing a parent category would otherwise show only products
 * assigned directly to the parent and miss everything filed under its
 * children, which looks like an empty shop.
 *
 * NOTE: the API takes one category id per request, so this list is currently
 * used to decide whether a filter node is "active" rather than to widen the
 * query. Widening needs a backend change (accept a comma-separated list, or
 * resolve descendants server-side) and is tracked for a later phase.
 */
export function collectSubtreeIds(node) {
    if (!node) return [];
    const ids = [node._id];
    for (const child of node.children ?? []) ids.push(...collectSubtreeIds(child));
    return ids;
}

/** Root-first trail as breadcrumb items the UI can render directly. */
export function toBreadcrumbs(trail = []) {
    return trail.map((node) => ({
        label: node.name,
        href: `/category/${node.slug}`,
    }));
}
