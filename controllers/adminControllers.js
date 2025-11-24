const adminModel = require('../models/admin');
const productModel = require('../models/products')
const { upload } = require("../middleware/multer");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

//--------------------------------ADMIN LOGIN------------------------------------

async function adminLogin(req, res) {
  const { email, password } = req.body;

  try {
    const admin = await adminModel.findOne({ email });

    if (!admin) {
      return res.render('admin/login', { success: null, error: 'Invalid email or password' });
    }

    
    
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    
    res.cookie('adminToken', token, {
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

//---------------------------------DASHBOARD---------------------------

async function adminDashboard(req, res) {
  try {
    const admin = req.auth;

    
    const totalSales = 0;
    const totalOrders = 0;
    const products = 0;
    const customers = 0;

    res.render("admin/dashboard", {
      adminName: admin.email,
      adminImage: "/img/admin-avatar.png",

      totalSales: totalSales,
      totalOrders: totalOrders,
      products: products,
      customers: customers,

      success: null,
      error: null
    });

  } catch (error) {
    console.error(error);

    res.render("admin/dashboard", {
      adminName: null,
      adminImage: null,
      totalSales: 0,
      totalOrders: 0,
      products: 0,
      customers: 0,
      success: null,
      error: "Something went wrong"
    });
  }
}


//---------------------------------PRODUCTS-----------------------------



async function adminProducts(req, res) {
  try {
    const products = await productModel.find();

    res.render("admin/products", {
      products,
      success: null,
      error: null
    });

  } catch (err) {
    res.render("admin/products", {
      products: [],
      success: null,
      error : null
     // error: "Failed to load products"
    });
  }
}

//------------------------------------------ADD PRODUCTS-----------------------

// async function addProducts(req, res) {

//  const { name, category, price, stock, status } = req.body

//      let imagePath =  null
    
//     if (req.file.filename) {
//         imagePath = `/img/${req.file.filename}`;
//     }

    
//     await productModel.create({
//         name,
//         category,
//         price,
//         stock,
//         status,
//         image: imagePath
//     });

//     console.log("addProducts - product created");

//     return res.redirect("/admin/products");
// };

async function addProducts(req, res) {
  try {

    if (req.method === "GET") {
      return res.render("admin/addProducts", { success: null, error: null });
    }



    const { name, category, price, stock, status } = req.body;

  
    let imagePaths = [];

    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(file => `/img/${file.filename}`);
    }

    await productModel.create({
      name,
      category,
      price,
      stock,
      status,
      images: imagePaths   
    });

    console.log("addProducts - product created");

    return res.redirect("/products");

  } catch (err) {
    console.log(err);
    return res.status(500).send("Error adding product");
  }
}



































































module.exports = {
    adminLogin,
    adminDashboard,
    adminProducts,
    addProducts
}