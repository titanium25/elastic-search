// src/db/database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'products.db');

// Connect to SQLite database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database ' + err.message);
  } else {
    console.log('Connected to the SQLite database.');

    // Create a products table and insert mock data
    db.run(
      `CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        price REAL,
        rating REAL,
        image TEXT
      )`,
      (err) => {
        if (err) {
          console.error('Error creating table:', err);
        } else {
          // Insert mock product data
          const insert =
            'INSERT INTO products (title, description, price, rating, image) VALUES (?, ?, ?, ?, ?)';
          const products = [
            {
              title: 'Wireless Headphones',
              description: 'High-quality noise-cancelling headphones',
              price: 199.99,
              rating: 4.5,
              image: 'https://picsum.photos/300/200?random=1',
            },
            {
              title: 'Bluetooth Speaker',
              description: 'Portable speaker with deep bass',
              price: 89.99,
              rating: 4.3,
              image: 'https://picsum.photos/300/200?random=2',
            },
            {
              title: 'Smartphone Stand',
              description: 'Adjustable stand for smartphones and tablets',
              price: 15.99,
              rating: 4.7,
              image: 'https://picsum.photos/300/200?random=3',
            },
            {
              title: 'Mechanical Keyboard',
              description: 'RGB backlit mechanical keyboard',
              price: 109.99,
              rating: 4.8,
              image: 'https://picsum.photos/300/200?random=4',
            },
            {
              title: 'Wireless Mouse',
              description: 'Ergonomic wireless mouse with precision tracking',
              price: 29.99,
              rating: 4.6,
              image: 'https://picsum.photos/300/200?random=5',
            },
            {
              title: 'Laptop Cooling Pad',
              description: 'Cooling pad with adjustable fan speeds',
              price: 25.99,
              rating: 4.4,
              image: 'https://picsum.photos/300/200?random=6',
            },
            {
              title: '4K Monitor',
              description: '27-inch 4K UHD monitor with HDR support',
              price: 349.99,
              rating: 4.7,
              image: 'https://picsum.photos/300/200?random=7',
            },
            {
              title: 'USB-C Hub',
              description: 'Multi-port hub with USB-C, HDMI, and Ethernet',
              price: 49.99,
              rating: 4.2,
              image: 'https://picsum.photos/300/200?random=8',
            },
            {
              title: 'Electric Kettle',
              description: 'Stainless steel electric kettle with auto shut-off',
              price: 39.99,
              rating: 4.5,
              image: 'https://picsum.photos/300/200?random=9',
            },
            {
              title: 'Espresso Machine',
              description: 'Compact espresso machine with milk frother',
              price: 129.99,
              rating: 4.9,
              image: 'https://picsum.photos/300/200?random=10',
            },
            {
              title: 'Air Fryer',
              description: 'Digital air fryer with pre-set cooking programs',
              price: 99.99,
              rating: 4.8,
              image: 'https://picsum.photos/300/200?random=11',
            },
            {
              title: 'Vacuum Cleaner',
              description: 'Cordless vacuum cleaner with powerful suction',
              price: 149.99,
              rating: 4.6,
              image: 'https://picsum.photos/300/200?random=12',
            },
            {
              title: 'Cookware Set',
              description: 'Non-stick cookware set with 10 pieces',
              price: 79.99,
              rating: 4.3,
              image: 'https://picsum.photos/300/200?random=13',
            },
            {
              title: 'Digital Camera',
              description: 'Compact digital camera with 20MP sensor',
              price: 299.99,
              rating: 4.7,
              image: 'https://picsum.photos/300/200?random=14',
            },
            {
              title: 'Bluetooth Earbuds',
              description: 'In-ear wireless earbuds with charging case',
              price: 49.99,
              rating: 4.4,
              image: 'https://picsum.photos/300/200?random=15',
            },
            {
              title: 'Smart Watch',
              description: 'Water-resistant smartwatch with heart rate monitor',
              price: 199.99,
              rating: 4.5,
              image: 'https://picsum.photos/300/200?random=16',
            },
            {
              title: 'Yoga Mat',
              description: 'Non-slip yoga mat with carrying strap',
              price: 19.99,
              rating: 4.8,
              image: 'https://picsum.photos/300/200?random=17',
            },
            {
              title: 'Dumbbell Set',
              description: 'Adjustable dumbbell set for strength training',
              price: 59.99,
              rating: 4.6,
              image: 'https://picsum.photos/300/200?random=18',
            },
            {
              title: 'Camping Tent',
              description: 'Waterproof camping tent for 4 people',
              price: 89.99,
              rating: 4.7,
              image: 'https://picsum.photos/300/200?random=19',
            },
            {
              title: 'Hiking Backpack',
              description: 'Durable hiking backpack with multiple compartments',
              price: 69.99,
              rating: 4.7,
              image: 'https://picsum.photos/300/200?random=20',
            },
            {
              title: 'Smart Door Lock',
              description: 'Keyless entry smart lock with fingerprint recognition',
              price: 199.99,
              rating: 4.6,
              image: 'https://picsum.photos/300/200?random=98',
            },
            {
              title: 'Wireless Earbuds',
              description: 'True wireless earbuds with noise isolation',
              price: 129.99,
              rating: 4.5,
              image: 'https://picsum.photos/300/200?random=99',
            },
            {
              title: 'Smart Scale',
              description: 'Wi-Fi connected scale with body composition analysis',
              price: 69.99,
              rating: 4.4,
              image: 'https://picsum.photos/300/200?random=100',
            },
          ];

          products.forEach((product) => {
            db.run(insert, [
              product.title,
              product.description,
              product.price,
              product.rating,
              product.image,
            ]);
          });

          console.log('Inserted mock product data.');
        }
      }
    );
  }
});

module.exports = db;
