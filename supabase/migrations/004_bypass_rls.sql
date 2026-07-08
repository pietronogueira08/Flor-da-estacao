-- Drop existing restricted policies
DROP POLICY IF EXISTS "Admin total categories" ON categories;
DROP POLICY IF EXISTS "Admin total products" ON products;
DROP POLICY IF EXISTS "Admin total variants" ON product_variants;
DROP POLICY IF EXISTS "Admin total images" ON product_images;
DROP POLICY IF EXISTS "Admin total orders" ON orders;
DROP POLICY IF EXISTS "Admin total order_items" ON order_items;
DROP POLICY IF EXISTS "Admin total stock_movements" ON stock_movements;
DROP POLICY IF EXISTS "Admin upload imagens" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete imagens" ON storage.objects;

-- Create public unrestricted policies for testing
CREATE POLICY "Public total categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public total products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public total variants" ON product_variants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public total images" ON product_images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public total orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public total order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public total stock_movements" ON stock_movements FOR ALL USING (true) WITH CHECK (true);

-- Storage (if needed, buckets might need exact policies)
CREATE POLICY "Public upload imagens" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Public delete imagens" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');
