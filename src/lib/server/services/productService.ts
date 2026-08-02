import 'server-only';
import pool from '@/lib/server/db';
import { Product } from '@/types';

/**
 * Get products list with optional category filter and limit
 */
export async function getProducts(options: { category?: string | null; limit?: number | null }): Promise<Product[]> {
  const { category, limit } = options;

  let query = `
    SELECT p.*, p.thumbnail as image, p.short_description as description, c.name as category_name, c.slug as category_slug,
           (
             SELECT JSON_OBJECT(
               'general', COALESCE(
                 (SELECT JSON_OBJECTAGG(o.name, o.value)
                  FROM options o
                  JOIN product_options po ON o.id = po.option_id
                  WHERE po.product_id = p.id AND o.spec_group = 'general'),
                 JSON_OBJECT()
               ),
               'detailed', COALESCE(
                 (SELECT JSON_OBJECTAGG(o.name, o.value)
                  FROM options o
                  JOIN product_options po ON o.id = po.option_id
                  WHERE po.product_id = p.id AND o.spec_group = 'detailed'),
                 JSON_OBJECT()
               )
             )
           ) as specs
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
  `;
  const params: any[] = [];

  if (category) {
    query += ` WHERE p.deleted_at IS NULL AND (c.slug = ? OR c.parent_id IN (SELECT id FROM categories WHERE slug = ?)) `;
    params.push(category, category);
  } else {
    query += ` WHERE p.deleted_at IS NULL `;
  }

  query += ` ORDER BY p.id DESC `;

  if (limit) {
    query += ` LIMIT ? `;
    params.push(limit);
  }

  const [rows]: any = await pool.execute(query, params);
  return rows;
}

/**
 * Get related products for a list of product IDs and optional relation type
 */
export async function getProductRelations(productIds: number[], type?: string | null): Promise<any[]> {
  let query = `
    SELECT 
      pr.id as relation_id,
      pr.product_id as source_product_id,
      pr.relation_type,
      p.*,
      p.thumbnail as image,
      p.short_description as description,
      c.name as category_name,
      (
        SELECT JSON_OBJECT(
          'general', COALESCE(
            (SELECT JSON_OBJECTAGG(o.name, o.value)
             FROM options o
             JOIN product_options po ON o.id = po.option_id
             WHERE po.product_id = p.id AND o.spec_group = 'general'),
            JSON_OBJECT()
          ),
          'detailed', COALESCE(
            (SELECT JSON_OBJECTAGG(o.name, o.value)
             FROM options o
             JOIN product_options po ON o.id = po.option_id
             WHERE po.product_id = p.id AND o.spec_group = 'detailed'),
            JSON_OBJECT()
          )
        )
      ) as specs
    FROM product_relations pr
    JOIN products p ON pr.related_product_id = p.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE pr.product_id IN (${productIds.map(() => '?').join(',')})
  `;

  const params: any[] = [...productIds];

  if (type) {
    query += ` AND pr.relation_type = ? `;
    params.push(type);
  }

  const [rows]: any = await pool.execute(query, params);
  return rows;
}

/**
 * Add or update product link relation
 */
export async function addProductRelation(productId: number, relatedProductId: number, relationType: string): Promise<number> {
  const [result]: any = await pool.execute(
    `INSERT INTO product_relations (product_id, related_product_id, relation_type) 
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE relation_type = VALUES(relation_type)`,
    [productId, relatedProductId, relationType]
  );
  return result.insertId;
}

/**
 * Delete product link relation
 */
export async function deleteProductRelation(productId: number, relatedProductId: number, relationType: string): Promise<boolean> {
  const [result]: any = await pool.execute(
    'DELETE FROM product_relations WHERE product_id = ? AND related_product_id = ? AND relation_type = ?',
    [productId, relatedProductId, relationType]
  );
  return result.affectedRows > 0;
}
