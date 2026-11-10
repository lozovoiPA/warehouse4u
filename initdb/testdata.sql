INSERT INTO products (name, category, unit)
VALUES 
    ('Кресло офисное', 'Мебель', 'штук, шт.'),
    ('Стол письменный', 'Мебель', 'штук, шт.'),
    ('Ручка шариковая', 'Канцелярия', 'штук, шт.'),
    ('Каша-малаша',           'Продукты питания', 'грамм, г.'),
    ('Остеохондроз',          'Другое',           NULL),
    ('Изобретенный велосипед','Техника',          'штук, шт.'),
    ('Кот в мешке',           'Электроника',      'литров, л.'),
    ('Карандаш жесткость HBee','Канцелярия',      'штук, шт.'),
    ('Краснодарский рай',     'Книги',            NULL),
    ('Вагон цемента',         'Другое',           'штук, шт.'),
    ('Двадцать восемь',       'Книги',            NULL);

INSERT INTO warehouses (name, address) VALUES
    ('Склад Москва-Север', 'г. Москва, ул. Складочная, д. 1, стр. 1'),
    ('Склад Москва-Юг',    'г. Москва, ул. Подольских Курсантов, д. 15, корп. 2'),
    ('Склад Москва-Восток','г. Москва, ш. Энтузиастов, д. 42, стр. 3');

INSERT INTO stock_items (product_id, warehouse_id, quantity) VALUES
    (1, 1, 42),
    (2, 1, 30),
    (3, 1, 25),
    (4, 1, 50),
    (5, 1, 35),
    (6, 1, 28),
    (7, 1, 45),

    (8, 2, 33),
    (9, 2, 40),
    (10, 2, 49),
    (11, 2, 27),
    (1, 2, 31),
    (2, 2, 46),

    (3, 3, 38),
    (4, 3, 44),
    (5, 3, 50),
    (6, 3, 29),
    (7, 3, 41),
    (8, 3, 26),
    (9, 3, 36);

WITH w AS (
    SELECT 
        MAX(CASE WHEN name = 'Склад Москва-Север' THEN id END) AS w1,
        MAX(CASE WHEN name = 'Склад Москва-Юг' THEN id END) AS w2,
        MAX(CASE WHEN name = 'Склад Москва-Восток' THEN id END) AS w3
    FROM warehouses
)
INSERT INTO movements (out_warehouse_id, in_warehouse_id, product_id, quantity, date, operator)
SELECT w1, w2, product_id, quantity, NOW() - (row_num || ' hours')::interval, 'Оператор Иванов' FROM w, (VALUES 
    -- W1 -> W2 (14 movements)
    (1, 1, 10), (2, 2, 5), (3, 3, 10), (4, 4, 15), (5, 5, 10), (6, 6, 8), (7, 7, 10),
    (8, 1, 5), (9, 2, 5), (10, 3, 5), (11, 4, 10), (12, 5, 5), (13, 6, 5), (14, 7, 5)
) AS t(row_num, product_id, quantity);

WITH w AS (
    SELECT 
        MAX(CASE WHEN name = 'Склад Москва-Север' THEN id END) AS w1,
        MAX(CASE WHEN name = 'Склад Москва-Юг' THEN id END) AS w2,
        MAX(CASE WHEN name = 'Склад Москва-Восток' THEN id END) AS w3
    FROM warehouses
)
INSERT INTO movements (out_warehouse_id, in_warehouse_id, product_id, quantity, date, operator)
SELECT w2, w1, product_id, quantity, NOW() - (row_num || ' hours')::interval, 'Оператор Петров' FROM w, (VALUES 
    -- W2 -> W1 (14 movements)
    (15, 8, 10), (16, 9, 10), (17, 10, 15), (18, 11, 7), (19, 1, 11), (20, 2, 16), (21, 8, 5),
    (22, 9, 5), (23, 10, 10), (24, 11, 5), (25, 1, 5), (26, 2, 10), (27, 8, 5), (28, 9, 5)
) AS t(row_num, product_id, quantity);

WITH w AS (
    SELECT 
        MAX(CASE WHEN name = 'Склад Москва-Север' THEN id END) AS w1,
        MAX(CASE WHEN name = 'Склад Москва-Юг' THEN id END) AS w2,
        MAX(CASE WHEN name = 'Склад Москва-Восток' THEN id END) AS w3
    FROM warehouses
)
INSERT INTO movements (out_warehouse_id, in_warehouse_id, product_id, quantity, date, operator)
SELECT w3, w1, product_id, quantity, NOW() - (row_num || ' hours')::interval, 'Оператор Смирнов' FROM w, (VALUES 
    -- W3 -> W1 (14 movements)
    (43, 3, 10), (44, 4, 10), (45, 5, 15), (46, 6, 10), (47, 7, 10), (48, 8, 10), (49, 9, 10),
    (50, 3, 5), (51, 4, 5), (52, 5, 5), (53, 6, 5), (54, 7, 5), (55, 8, 5), (56, 9, 5)
) AS t(row_num, product_id, quantity);

WITH w AS (
    SELECT 
        MAX(CASE WHEN name = 'Склад Москва-Север' THEN id END) AS w1,
        MAX(CASE WHEN name = 'Склад Москва-Юг' THEN id END) AS w2,
        MAX(CASE WHEN name = 'Склад Москва-Восток' THEN id END) AS w3
    FROM warehouses
)
INSERT INTO movements (out_warehouse_id, in_warehouse_id, product_id, quantity, date, operator)
SELECT w3, w2, product_id, quantity, NOW() - (row_num || ' hours')::interval, 'Оператор Попов' FROM w, (VALUES 
    -- W3 -> W2 (14 movements)
    (71, 3, 5), (72, 4, 5), (73, 5, 5), (74, 6, 5), (75, 7, 5), (76, 8, 5), (77, 9, 5),
    (78, 3, 5), (79, 4, 5), (80, 5, 5), (81, 6, 5), (82, 7, 5), (83, 8, 5), (84, 9, 5)
) AS t(row_num, product_id, quantity);
