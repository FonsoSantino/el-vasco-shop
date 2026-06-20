export function setupSchema(db: any) {
  // Brand Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS Brand (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      imageId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Category Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS Category (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      parentId TEXT,
      imageId TEXT,
      filters TEXT,
      "order" INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Auto-migrate filters column if it doesn't exist
  try {
    db.prepare("SELECT filters FROM Category LIMIT 1").get();
  } catch (e) {
    db.exec("ALTER TABLE Category ADD COLUMN filters TEXT");
  }

  // Product Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS Product (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      discount REAL DEFAULT 0,
      sku TEXT,
      stock INTEGER DEFAULT 0,
      categoryId TEXT NOT NULL,
      brandId TEXT,
      status TEXT DEFAULT 'ACTIVE',
      isFeatured BOOLEAN DEFAULT 0,
      isSpecialOrder BOOLEAN DEFAULT 0,
      specifications TEXT,
      flavors TEXT,
      imageId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoryId) REFERENCES Category(id) ON DELETE RESTRICT,
      FOREIGN KEY (brandId) REFERENCES Brand(id) ON DELETE SET NULL
    )
  `);

  try {
    db.prepare("SELECT flavors FROM Product LIMIT 1").get();
  } catch (e) {
    db.exec("ALTER TABLE Product ADD COLUMN flavors TEXT");
  }

  try {
    db.prepare("SELECT imageId FROM Product LIMIT 1").get();
  } catch (e) {
    db.exec("ALTER TABLE Product ADD COLUMN imageId TEXT");
  }

  try {
    db.prepare("SELECT isSpecialOrder FROM Product LIMIT 1").get();
  } catch (e) {
    db.exec("ALTER TABLE Product ADD COLUMN isSpecialOrder BOOLEAN DEFAULT 0");
  }

  // Inventory Movement Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS InventoryMovement (
      id TEXT PRIMARY KEY,
      productId TEXT NOT NULL,
      type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      reason TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (productId) REFERENCES Product(id) ON DELETE CASCADE
    )
  `);

  // Orders Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS Orders (
      id TEXT PRIMARY KEY,
      fullName TEXT NOT NULL,
      phone TEXT,
      deliveryType TEXT,
      province TEXT,
      city TEXT,
      address TEXT,
      postalCode TEXT,
      company TEXT,
      observations TEXT,
      subtotal REAL,
      shipping REAL DEFAULT 0,
      total REAL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Order Items Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS OrderItems (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      productId TEXT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (orderId) REFERENCES Orders(id) ON DELETE CASCADE
    )
  `);
}
