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
            {
              title: 'Gaming Mouse',
              description: 'High-precision gaming mouse with customizable RGB lighting',
              price: 59.99,
              rating: 4.7,
              image: 'https://picsum.photos/300/200?random=24'
            },
            {
              title: 'Portable Charger',
              description: '20000mAh power bank with fast charging capability',
              price: 39.99,
              rating: 4.5,
              image: 'https://picsum.photos/300/200?random=25'
            },
            {
              title: 'Bluetooth Keyboard',
              description: 'Slim wireless keyboard compatible with multiple devices',
              price: 49.99,
              rating: 4.3,
              image: 'https://picsum.photos/300/200?random=26'
            },
            {
              title: 'Fitness Tracker',
              description: 'Water-resistant fitness band with heart rate monitoring',
              price: 79.99,
              rating: 4.4,
              image: 'https://picsum.photos/300/200?random=27'
            },
            {
              title: 'Robot Vacuum',
              description: 'Smart robot vacuum with mapping and app control',
              price: 249.99,
              rating: 4.6,
              image: 'https://picsum.photos/300/200?random=28'
            },
            {
              title: 'Blender',
              description: 'High-speed blender for smoothies and food processing',
              price: 89.99,
              rating: 4.5,
              image: 'https://picsum.photos/300/200?random=29'
            },
            {
              title: 'Electric Toothbrush',
              description: 'Rechargeable electric toothbrush with multiple cleaning modes',
              price: 59.99,
              rating: 4.7,
              image: 'https://picsum.photos/300/200?random=30'
            },
            {
              title: 'Smart Thermostat',
              description: 'WiFi-enabled thermostat for energy-efficient home climate control',
              price: 149.99,
              rating: 4.8,
              image: 'https://picsum.photos/300/200?random=31'
            },
            {
              title: 'Electric Scooter',
              description: 'Foldable electric scooter with 15-mile range',
              price: 299.99,
              rating: 4.5,
              image: 'https://picsum.photos/300/200?random=32'
            },
            {
              title: 'Wireless Charging Pad',
              description: 'Qi-compatible wireless charging pad for smartphones',
              price: 29.99,
              rating: 4.2,
              image: 'https://picsum.photos/300/200?random=33'
            },
            {
              title: 'Smart Light Bulbs',
              description: 'Color-changing smart LED bulbs with voice control',
              price: 39.99,
              rating: 4.6,
              image: 'https://picsum.photos/300/200?random=34'
            },
            {
              title: 'Portable Projector',
              description: 'Mini projector with built-in speakers for home entertainment',
              price: 199.99,
              rating: 4.3,
              image: 'https://picsum.photos/300/200?random=35'
            },
            {
              title: 'Digital Drawing Tablet',
              description: 'Graphics tablet for digital art and photo editing',
              price: 79.99,
              rating: 4.7,
              image: 'https://picsum.photos/300/200?random=36'
            },
            {
              title: 'Noise-Cancelling Headphones',
              description: 'Over-ear headphones with active noise cancellation',
              price: 249.99,
              rating: 4.8,
              image: 'https://picsum.photos/300/200?random=37'
            },
            {
              title: 'Smart Door Bell',
              description: 'Video doorbell with two-way audio and motion detection',
              price: 149.99,
              rating: 4.5,
              image: 'https://picsum.photos/300/200?random=38'
            },
            {
              title: 'Portable SSD',
              description: '1TB external SSD with USB-C connectivity',
              price: 159.99,
              rating: 4.7,
              image: 'https://picsum.photos/300/200?random=39'
            },
            {
              title: 'Ergonomic Office Chair',
              description: 'Adjustable office chair with lumbar support',
              price: 199.99,
              rating: 4.6,
              image: 'https://picsum.photos/300/200?random=40'
            },
            {
              title: 'Smart Coffee Maker',
              description: 'Programmable coffee maker with smartphone control',
              price: 129.99,
              rating: 4.4,
              image: 'https://picsum.photos/300/200?random=41'
            },
            {
              title: 'Wireless Presenter',
              description: 'Laser pointer and wireless presenter for presentations',
              price: 29.99,
              rating: 4.3,
              image: 'https://picsum.photos/300/200?random=42'
            },
            {
              title: 'Instant Pot',
              description: 'Multi-functional electric pressure cooker',
              price: 89.99,
              rating: 4.8,
              image: 'https://picsum.photos/300/200?random=43'
            },
            {
              title: 'Drone with Camera',
              description: '4K camera drone with GPS and follow-me mode',
              price: 399.99,
              rating: 4.7,
              image: 'https://picsum.photos/300/200?random=44'
            },
            {
              title: 'Smart Home Security Camera',
              description: 'Indoor WiFi camera with night vision and two-way audio',
              price: 59.99,
              rating: 4.5,
              image: 'https://picsum.photos/300/200?random=45'
            },
            {
              title: 'Electric Shaver',
              description: 'Rechargeable electric shaver with precision trimmer',
              price: 79.99,
              rating: 4.4,
              image: 'https://picsum.photos/300/200?random=46'
            },
            {
              title: 'Portable Bluetooth Speaker',
              description: 'Waterproof Bluetooth speaker with 20-hour battery life',
              price: 69.99,
              rating: 4.6,
              image: 'https://picsum.photos/300/200?random=47'
            },
            {
              title: 'Smart Plant Sensor',
              description: 'WiFi-enabled plant sensor for monitoring soil moisture and sunlight',
              price: 39.99,
              rating: 4.2,
              image: 'https://picsum.photos/300/200?random=48'
            },
            {
              title: 'Electric Standing Desk',
              description: 'Adjustable height standing desk with electric motor',
              price: 349.99,
              rating: 4.7,
              image: 'https://picsum.photos/300/200?random=49'
            },
            {
              title: 'Smart Smoke Detector',
              description: 'WiFi-connected smoke and carbon monoxide detector',
              price: 119.99,
              rating: 4.8,
              image: 'https://picsum.photos/300/200?random=50'
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
