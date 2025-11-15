const adminModel = require('../models/admin');
const jwt = require('jsonwebtoken');
 const bcrypt = require('bcrypt');


//----------------------------ADMIN LOGIN----------------------------------

async function adminLogin(req, res) {
  const { email, password } = req.body;
  console.log('req.body', req.body);

  try {
    const admin = await adminModel.findOne({ email });

    if (!admin || password !== admin.password) {
      return res.render('admin/login', { success: null, error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    
    return res.redirect('/dashboard');

  } catch (error) {
    console.error(error);
    res.render('admin/login', { success: null, error: 'Server error' });
  }
}























module.exports = {
    adminLogin
}