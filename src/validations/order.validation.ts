const expressValidator = require("express-validator");
const { body } = expressValidator;

export const validateOrder = [
  // Billing Address (required)
  body('shippingAddress.firstName').notEmpty().withMessage('First name is required'),
  body('shippingAddress.lastName').notEmpty().withMessage('Last name is required'),
  body('shippingAddress.address').notEmpty().withMessage('Address is required'),
  body('shippingAddress.country').notEmpty().withMessage('Country is required'),
  // body('shippingAddress.state').notEmpty().withMessage('State is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.zipCode').notEmpty().withMessage('Zip code is required'),
  body('email').notEmpty().withMessage('Email is required'),
  body('phone').notEmpty().withMessage('Phone Number is required'),

  // // Shipping Address (optional object, but if provided, fields are required)
  // body('shippingAddress.firstName')
  //   .optional({ nullable: true })
  //   .notEmpty().withMessage('Shipping first name is required'),
  // body('shippingAddress.lastName')
  //   .optional({ nullable: true })
  //   .notEmpty().withMessage('Shipping last name is required'),
  // body('shippingAddress.address')
  //   .optional({ nullable: true })
  //   .notEmpty().withMessage('Shipping address is required'),
  // body('shippingAddress.country')
  //   .optional({ nullable: true })
  //   .notEmpty().withMessage('Shipping country is required'),
  // body('shippingAddress.state')
  //   .optional({ nullable: true })
  //   .notEmpty().withMessage('Shipping state is required'),
  // body('shippingAddress.city')
  //   .optional({ nullable: true })
  //   .notEmpty().withMessage('Shipping city is required'),
  // body('shippingAddress.zipCode')
  //   .optional({ nullable: true })
  //   .notEmpty().withMessage('Shipping zip code is required'),
  // body('shippingAddress.phone')
  //   .optional({ nullable: true })
  //   .notEmpty().withMessage('Shipping phone is required'),

  // Card Details (required)
  // body('token').notEmpty().withMessage('token is required'),



];
