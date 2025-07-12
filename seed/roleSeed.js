const Role = require("../models/Role");

async function seedRoles() {
    await Role.sync(); // hoặc sync({ alter: true }) nếu cần
    await Role.findOrCreate({ where: { name: 'admin' } });
    await Role.findOrCreate({ where: { name: 'user' } });
    console.log('✅ Seeded roles successfully.');
}

seedRoles();