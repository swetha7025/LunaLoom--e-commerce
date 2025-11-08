
const { body, validationResult } = require("express-validator");

//----------------------signup------------------

const signupValidator = [
  body('username')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),

  body('email')
    .trim()
    .isEmail().withMessage('Enter a valid email address'),

  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 5 }).withMessage('Password must be at least 5 characters'),

  body('confirmPassword')
    .trim()
    .notEmpty().withMessage('Confirm password is required')
    .isLength({ min: 5 }).withMessage('Confirm password must be at least 5 characters')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .isLength({ min: 10, max: 10 }).withMessage('Phone number must be 10 digits'),

  
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render('user/signup', {success:null, error: errors.array() });
    }

    next();
  }
];


//--------------------login--------------------------------

const loginValidator =[
 
  body('email')
  .trim()
  .notEmpty().withMessage('Enter a valid email address'),

  body('password')
  .trim()
  .notEmpty().withMessage('Password is required')
  .isLength({min:5}).withMessage('Password must be at least 5 characters'),

  async(req,res,next)=>{
    const errors = validationResult(req)

    if(!errors.isEmpty()){
      return res.render('user/login',{success:null,error:errors.array()})
    }
    next()
  }

]




















module.exports = {
    signupValidator,
    loginValidator
}