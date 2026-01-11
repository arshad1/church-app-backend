const axios = require('axios');

async function createAdminUser() {
    try {
        const response = await axios.post('http://localhost:3000/api/auth/register', {
            email: 'admin@church.com',
            password: 'admin123',
            name: 'Admin User',
            role: 'ADMIN'
        });

        console.log('Admin user created successfully!');
        console.log('Email:', response.data.user.email);
        console.log('Role:', response.data.user.role);
        console.log('Token:', response.data.token);
    } catch (error) {
        if (error.response) {
            console.error('Error:', error.response.data.message);
        } else {
            console.error('Error:', error.message);
        }
    }
}

createAdminUser();
