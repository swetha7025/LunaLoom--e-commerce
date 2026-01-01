const adminModel = require('../models/admin');
const productModel = require('../models/products')
const User = require('../models/user')
const couponModel = require('../models/coupon')
const orderModel = require('../models/order')
const { upload } = require("../middleware/multer")
 const fs = require("fs");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { error } = require('console');


//--------------------------------ADMIN LOGIN------------------------------------

async function adminLogin(req, res) {
  const { email, password } = req.body;

  try {
    const admin = await adminModel.findOne({ email });

    if (!admin || password !==admin.password) {

      return res.render('admin/adminlogin', { success: null, error: 'Invalid email or password' });
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
    res.render('admin/adminlogin', { success: null, error: 'Server error' });
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


//---------------------------------PRODUCTS------------------------------------



async function adminProducts(req, res) {
  try {
    const products = await productModel.find()

    res.render("admin/products", { products,success: null,error: null})
      
    

  } catch (err) {
    res.render("admin/products", {
      products: [],
      success: null,
     error: "Failed to load products"
    });
  }
}

//------------------------------------------ADD PRODUCTS---------------------------

async function addProducts(req, res) {
  try {
    if (req.method === "GET") {
      return res.render("admin/addProducts", { success: null, error: null });
    }

    const { name, category, brand, price, stock, status, description } = req.body;

    
    const sizes = Array.isArray(req.body.sizes)
      ? req.body.sizes
      : req.body.sizes ? [req.body.sizes] : [];

    const fabrics = Array.isArray(req.body.fabrics)
      ? req.body.fabrics
      : req.body.fabrics ? [req.body.fabrics] : [];

    
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(file => `/img/${file.filename}`);
    }

   
    await productModel.create({
      name,
      category,
      brand,
      price,
      stock,
      status,
      description,
      sizes,
      fabrics,
      images: imagePaths
    });

    console.log("addProducts - product created")

    return res.redirect("/products")

  } catch (err) {
    console.log(err);
    return res.render("admin/addProducts", { success: null, error: "Error adding product" })
  }
}


//------------------------------EDIT PRODUCT-------------------------------------



async function editProducts(req, res) {
  try {
    const productId = req.params.id;
    const product = await productModel.findById(productId);

    if (!product) {
      return res.render("admin/editProducts", {  product: {}, success: null, error: "Product not found" })
       
    }

    
    if (req.method === "GET") {
      return res.render("admin/editProducts", { product,  success: null,  error: null  });
        
    }

   
    const { name, category, fabrics, sizes, brand, price, stock, status, description,  deleteImages  } = req.body;

   

    
    const updatedSizes = Array.isArray(sizes) ? sizes : sizes ? [sizes] : [];
    const updatedFabrics = Array.isArray(fabrics) ? fabrics : fabrics ? [fabrics] : [];

    
    let oldImages = product.images || [];

    if (deleteImages) {
      const imagesToDelete = Array.isArray(deleteImages)
        ? deleteImages
        : [deleteImages];

      oldImages = oldImages.filter(img => !imagesToDelete.includes(img));

      imagesToDelete.forEach(imgPath => {

        const filePath = `public${imgPath}`

        if (fs.existsSync(filePath)) { fs.unlinkSync(filePath)}
         
      });
    }

    
    let newImages = [];
    if (req.files) {
      newImages = req.files.map(file => `/img/${file.filename}`);
    }

    const updatedImages = [...oldImages, ...newImages];

    
    await productModel.findByIdAndUpdate(
      productId,
      {
        name,
        category,
        brand,
        price,
        stock,
        status,
        description,
        sizes: updatedSizes,
        fabrics: updatedFabrics,
        images: updatedImages
      },
      { new: true }
    );

    return res.redirect("/products");

  } catch (error) {
    console.log(error);
    return res.render("admin/editProducts", {
      product,
      success: null,
      error: "Error editing product"
    });
  }
}


//---------------------------------DELETE PRODUCT-----------------------------------

async function deleteProduct(req, res) {
  try {
    const productId = req.params.id

    const product = await productModel.findById(productId);
    if (!product){

      return res.render("admin/editProducts",{product:{},success : null, error : "Product not found"});

    }     
     product.images.forEach(imgPath => {
       const path = __dirname + "/../public" + imgPath
     if (fs.existsSync(path)) fs.unlinkSync(path);
     });

    await productModel.findByIdAndDelete(productId)

    console.log("deleteProduct - product deleted")

    res.redirect("/products")
  } catch (error) {
    console.log(error)
    return res.render("admin/products",{product : {} ,success : null, error : "Error editing product"})
    
  }
}

//---------------------------------------------COUPON PAGE--------------------------------

async function couponPage(req,res) {
try {
  
 const coupons = await couponModel.find().sort({createdAt:-1})

 res.render('admin/coupons',{coupons, success : null, error : null})

} catch (error) {

  console.log(error)
  res.render('admin/coupons',{coupons:[], success : null, error : 'Failed to load Coupon'})
  
}  
}

//------------------------------------------ADD COUPONS----------------------------------


async function getAddCouponPage(req, res) {
  try {
    res.render('admin/addCoupon', { success: null,error: null })
     
  } catch (error) {
    console.log(error)
    res.render('admin/addCoupon', {success: null, error: 'Something went wrong' })
    
  }
}


async function addCoupon(req, res) {
  try {
    const { code, discount, expiryDate } = req.body

    if (!code || !discount || !expiryDate) {
      return res.render('admin/addCoupon', {
        success: null,
        error: 'All fields are required'
      })
    }

      const existingCoupon = await couponModel.findOne({ code })

    if (existingCoupon) {
      return res.render('admin/addCoupon', {success: null, error: 'Coupon code already exists' })
      
    }

    await couponModel.create({ code,discount,expiryDate})
     
    
    res.redirect('/coupons')

  } catch (error) {
    console.log(error)
    res.render('admin/addCoupon', {success: null, error: 'Something went wrong'})
  }
}

//-------------------------------------------EDIT COUPON---------------------------------

async function getEditCouponPage(req, res) {
  try {
    const  id  = req.params.id

    const coupon = await couponModel.findById(id)

    if (!coupon) {
      return res.redirect('/coupons')
    }

    res.render('admin/editCoupon', { coupon, success: null,error: null })
     
  } catch (error) {
    console.log(error)
    res.redirect('/coupons')
  }
}

async function updateCoupon(req,res) {
 try {
  
   const { code, discount, expiryDate, status } = req.body

  const id = req.params.id

  const coupon = await couponModel.findById(id)

   if(!coupon){
    return res.redirect('/coupons')
    
   }

   await couponModel.findByIdAndUpdate(id,{code,discount,expiryDate,status},{new:true})

    return res.redirect('/coupons')
      
 } catch (error) {
  console.log(error)
  return res.redirect('/coupons')
 }  
}

//-----------------------------------------------DELETE COUPON----------------------------

async function deleteCoupon(req,res) {
 try {
  
  const {code,discount,expiryDate} = req.body
  const id = req.params.id

  const coupon = await couponModel.findById(id)

  if(!coupon){
    return res.redirect('/coupons')
  }
  await couponModel.findByIdAndDelete(id)
  return res.redirect('/coupons')

 } catch (error) {
  console.log(error)
  return res.redirect('/coupons')
 }
}

//---------------------------------------------CUSTOMERS---------------------------------------


const getCustomersPage = async (req, res) => {
  try {
    const customers = await User.find() 
      .select("name email phoneNumber isBlock")
      .lean()

    res.render("admin/customers", {customers, success: null, error: null })
      
  } catch (error) {
    console.log(error)
    res.render("admin/customers", { customers: [],success: null, error: "Failed to load customers" })
  
  }
}

//-------------------------------------------BLOCK CUSTOMER---------------------------------------

async function blockCustomer(req,res) {
  try {
    
   const { id } = req.params 
    const user = await User.findById(id)

     if(user){
      user.isBlock=!user.isBlock
      await user.save()
     }
     res.redirect("/customers")

  } catch (error) {
    console.log(error)
    res.redirect("/customers")
  }
}

//------------------------------------------ORDER PAGE-------------------------------------------


async function getOrderPage(req, res) {
  try {
    const orders = await orderModel.find()
      .populate("userId", "name")
      .populate("items.product", "name")
      .sort({ createdAt: -1 })
      .lean()

    res.render("admin/admin-orders", { orders,success: null, error: null })
     
  } catch (error) {
    console.log( error)

    res.render("admin/admin-orders", {orders: [],success: null,error: "Failed to load orders" })
     
  }
}












































module.exports = {
    adminLogin,
    adminDashboard,
    adminProducts,
    addProducts,
    editProducts,
    deleteProduct,
    couponPage,
    getAddCouponPage,
    addCoupon,
    getEditCouponPage,
    updateCoupon,
    deleteCoupon,
    getCustomersPage,
    blockCustomer,
    getOrderPage
  
}