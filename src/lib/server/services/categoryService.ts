import 'server-only';
import pool from '@/lib/server/db';
import { Category } from '@/types';

export interface CategoryNode extends Category {
  children: CategoryNode[];
}

/**
 * Fetch and construct the hierarchical categories tree from the database
 */
export async function getCategoriesTree(): Promise<CategoryNode[]> {
  const [rows]: any = await pool.query(
    'SELECT id, parent_id, name, slug, icon FROM categories ORDER BY parent_id ASC, name ASC'
  );

  const categoryMap: { [key: number]: CategoryNode } = {};
  const tree: CategoryNode[] = [];

  rows.forEach((row: any) => {
    categoryMap[row.id] = { ...row, children: [] };
  });

  rows.forEach((row: any) => {
    const category = categoryMap[row.id];
    if (row.parent_id === null) {
      tree.push(category);
    } else {
      const parent = categoryMap[row.parent_id];
      if (parent) {
        parent.children.push(category);
      } else {
        tree.push(category);
      }
    }
  });

  return tree;
}
