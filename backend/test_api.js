const jwt = require('jsonwebtoken');
require('dotenv').config();

async function test() {
  try {
    const token = jwt.sign({ id: 'e3ac1539-198a-4375-bbc1-93334c7088f0', role: 'owner' }, process.env.JWT_SECRET || 'secret123');

    const res = await fetch('http://localhost:5000/api/properties?page=1&limit=20', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
}
test();
