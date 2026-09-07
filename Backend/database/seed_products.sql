-- MURAKAZA - Product catalog seed
-- Adds a full range of Student Supplies and Office Equipment products with names + images.
-- Run with:
--   psql -U postgres -d murakaza_db -f backend/database/seed_products.sql
--
-- Safe to re-run: it clears existing products first so you don't get duplicates.
-- (Comment out the DELETE line below if you want to keep existing rows.)

DELETE FROM products;

-- ============================
-- STUDENT SUPPLIES
-- ============================
INSERT INTO products (name, category, price, quantity, description, image_url) VALUES
('Exercise Book (A4, 96 pages)', 'student_supplies', 500,  200, 'A4 size exercise book, 96 pages, ruled', 'https://placehold.co/400x300/1b7a43/ffffff?text=Exercise+Book+A4'),
('Exercise Book (A5, 48 pages)', 'student_supplies', 300,  200, 'A5 size exercise book, 48 pages, ruled', 'https://placehold.co/400x300/1b7a43/ffffff?text=Exercise+Book+A5'),
('Spiral Notebook', 'student_supplies', 1500, 100, '100-page spiral bound notebook', 'https://placehold.co/400x300/1b7a43/ffffff?text=Spiral+Notebook'),
('Mathematical Set', 'student_supplies', 2500, 80,  'Complete geometry set with compass, protractor and rulers', 'https://placehold.co/400x300/1b7a43/ffffff?text=Mathematical+Set'),
('School Bag', 'student_supplies', 15000, 40, 'Durable school backpack with multiple compartments', 'https://placehold.co/400x300/1b7a43/ffffff?text=School+Bag'),
('Ballpoint Pen (Blue)', 'student_supplies', 200,  500, 'Smooth-writing blue ballpoint pen', 'https://placehold.co/400x300/1b7a43/ffffff?text=Blue+Pen'),
('Ballpoint Pen (Black)', 'student_supplies', 200,  500, 'Smooth-writing black ballpoint pen', 'https://placehold.co/400x300/1b7a43/ffffff?text=Black+Pen'),
('HB Pencil (Pack of 12)', 'student_supplies', 1200, 150, 'Pack of 12 HB graphite pencils', 'https://placehold.co/400x300/1b7a43/ffffff?text=HB+Pencils'),
('Eraser', 'student_supplies', 150,  300, 'Soft white eraser, smudge-free', 'https://placehold.co/400x300/1b7a43/ffffff?text=Eraser'),
('30cm Ruler', 'student_supplies', 300,  250, 'Clear plastic 30cm ruler', 'https://placehold.co/400x300/1b7a43/ffffff?text=30cm+Ruler'),
('Pencil Sharpener', 'student_supplies', 250,  200, 'Metal pencil sharpener with container', 'https://placehold.co/400x300/1b7a43/ffffff?text=Sharpener'),
('Highlighter Set (5 colors)', 'student_supplies', 3000, 60,  'Set of 5 assorted color highlighters', 'https://placehold.co/400x300/1b7a43/ffffff?text=Highlighters'),
('Crayons Set (24 colors)', 'student_supplies', 2500, 70,  'Box of 24 assorted wax crayons', 'https://placehold.co/400x300/1b7a43/ffffff?text=Crayons'),
('Scientific Calculator', 'student_supplies', 12000, 45, 'Scientific calculator for secondary & university students', 'https://placehold.co/400x300/1b7a43/ffffff?text=Calculator'),
('Glue Stick', 'student_supplies', 500,  180, 'Non-toxic washable glue stick', 'https://placehold.co/400x300/1b7a43/ffffff?text=Glue+Stick'),
('Correction Fluid (Tipex)', 'student_supplies', 800,  120, 'Quick-dry correction fluid with brush', 'https://placehold.co/400x300/1b7a43/ffffff?text=Correction+Fluid'),
('Clear File Folder (A4)', 'student_supplies', 500,  200, 'A4 transparent document folder', 'https://placehold.co/400x300/1b7a43/ffffff?text=File+Folder'),
('Ring Binder File', 'student_supplies', 3500, 90,  'A4 lever arch ring binder file', 'https://placehold.co/400x300/1b7a43/ffffff?text=Ring+Binder'),
('School Lunch Box', 'student_supplies', 6000, 50,  'Insulated plastic lunch box', 'https://placehold.co/400x300/1b7a43/ffffff?text=Lunch+Box'),
('Water Bottle (1L)', 'student_supplies', 3500, 80,  'Reusable 1 litre school water bottle', 'https://placehold.co/400x300/1b7a43/ffffff?text=Water+Bottle'),
('English Dictionary', 'student_supplies', 8000, 35,  'Compact English dictionary for students', 'https://placehold.co/400x300/1b7a43/ffffff?text=Dictionary'),
('World Atlas Map', 'student_supplies', 6500, 25,  'Illustrated world atlas for geography class', 'https://placehold.co/400x300/1b7a43/ffffff?text=World+Atlas'),
('Watercolor Paint Set', 'student_supplies', 4500, 40,  '12-color watercolor paint set with brush', 'https://placehold.co/400x300/1b7a43/ffffff?text=Paint+Set'),
('Box of Chalk (White)', 'student_supplies', 1000, 100, 'Box of 50 white classroom chalk sticks', 'https://placehold.co/400x300/1b7a43/ffffff?text=Chalk+Box'),
('Marker Set (Whiteboard)', 'student_supplies', 3000, 70,  'Set of 4 whiteboard markers, assorted colors', 'https://placehold.co/400x300/1b7a43/ffffff?text=Marker+Set');

-- ============================
-- OFFICE EQUIPMENT
-- ============================
INSERT INTO products (name, category, price, quantity, description, image_url) VALUES
('Office Chair (Ergonomic)', 'office_equipment', 45000,  15, 'Adjustable ergonomic office chair with lumbar support', 'https://placehold.co/400x300/14532d/ffffff?text=Office+Chair'),
('Office Desk', 'office_equipment', 85000,  10, 'Wooden office desk with drawers', 'https://placehold.co/400x300/14532d/ffffff?text=Office+Desk'),
('HP LaserJet Printer', 'office_equipment', 180000, 5,  'Black and white laser printer, USB & WiFi', 'https://placehold.co/400x300/14532d/ffffff?text=Laser+Printer'),
('All-in-One Printer/Scanner/Copier', 'office_equipment', 250000, 4, '3-in-1 inkjet printer, scanner and copier', 'https://placehold.co/400x300/14532d/ffffff?text=All-in-One+Printer'),
('Flatbed Scanner', 'office_equipment', 95000,  6,  'High-resolution A4 flatbed document scanner', 'https://placehold.co/400x300/14532d/ffffff?text=Scanner'),
('Photocopier Machine', 'office_equipment', 950000, 2,  'Heavy-duty commercial photocopier', 'https://placehold.co/400x300/14532d/ffffff?text=Photocopier'),
('Paper Shredder', 'office_equipment', 65000,  8,  'Cross-cut paper shredder, 10-sheet capacity', 'https://placehold.co/400x300/14532d/ffffff?text=Paper+Shredder'),
('Laptop Computer', 'office_equipment', 650000, 6,  'Business laptop, Core i5, 8GB RAM, 256GB SSD', 'https://placehold.co/400x300/14532d/ffffff?text=Laptop'),
('Desktop Computer Set', 'office_equipment', 550000, 4,  'Desktop PC with monitor, keyboard and mouse', 'https://placehold.co/400x300/14532d/ffffff?text=Desktop+PC'),
('Computer Monitor (24")', 'office_equipment', 120000, 12, '24-inch full HD LED monitor', 'https://placehold.co/400x300/14532d/ffffff?text=Monitor'),
('Wireless Keyboard & Mouse Combo', 'office_equipment', 25000,  20, 'Wireless keyboard and mouse combo set', 'https://placehold.co/400x300/14532d/ffffff?text=Keyboard+%26+Mouse'),
('Printer Ink Cartridge (Black)', 'office_equipment', 18000,  30, 'Genuine black ink cartridge', 'https://placehold.co/400x300/14532d/ffffff?text=Ink+Cartridge'),
('Toner Cartridge', 'office_equipment', 45000,  18, 'Compatible laser printer toner cartridge', 'https://placehold.co/400x300/14532d/ffffff?text=Toner+Cartridge'),
('Multimedia Projector', 'office_equipment', 420000, 5,  'HD multimedia projector for presentations', 'https://placehold.co/400x300/14532d/ffffff?text=Projector'),
('Whiteboard (Magnetic, 120x90cm)', 'office_equipment', 55000,  10, 'Magnetic dry-erase whiteboard with stand', 'https://placehold.co/400x300/14532d/ffffff?text=Whiteboard'),
('Filing Cabinet (4-Drawer)', 'office_equipment', 130000, 7,  'Steel lockable 4-drawer filing cabinet', 'https://placehold.co/400x300/14532d/ffffff?text=Filing+Cabinet'),
('Heavy-Duty Stapler', 'office_equipment', 8000,   40, 'Heavy-duty stapler for up to 100 sheets', 'https://placehold.co/400x300/14532d/ffffff?text=Heavy+Duty+Stapler'),
('Hole Punch Machine', 'office_equipment', 6000,   35, '2-hole punch machine for A4 paper', 'https://placehold.co/400x300/14532d/ffffff?text=Hole+Punch'),
('Desktop Calculator', 'office_equipment', 9000,   45, '12-digit desktop calculator', 'https://placehold.co/400x300/14532d/ffffff?text=Desktop+Calculator'),
('UPS Backup Power (650VA)', 'office_equipment', 45000,  15, 'Uninterruptible power supply, 650VA', 'https://placehold.co/400x300/14532d/ffffff?text=UPS+Backup'),
('WiFi Router', 'office_equipment', 35000,  20, 'Dual-band wireless office router', 'https://placehold.co/400x300/14532d/ffffff?text=WiFi+Router'),
('A4 Paper Ream (500 sheets)', 'office_equipment', 6500,   100, 'Premium A4 80gsm printing paper, 500 sheets', 'https://placehold.co/400x300/14532d/ffffff?text=A4+Paper+Ream'),
('Box of Envelopes (A4)', 'office_equipment', 4000,   60, 'Box of 50 brown A4 envelopes', 'https://placehold.co/400x300/14532d/ffffff?text=Envelopes'),
('Binder Clips (Assorted, 12pcs)', 'office_equipment', 2000,   90, 'Assorted size binder clips, pack of 12', 'https://placehold.co/400x300/14532d/ffffff?text=Binder+Clips'),
('Office Safe Box', 'office_equipment', 150000, 6,  'Fireproof steel cash and document safe', 'https://placehold.co/400x300/14532d/ffffff?text=Safe+Box'),
('Conference Table (6-Seater)', 'office_equipment', 380000, 3,  'Wooden conference table, seats 6', 'https://placehold.co/400x300/14532d/ffffff?text=Conference+Table');