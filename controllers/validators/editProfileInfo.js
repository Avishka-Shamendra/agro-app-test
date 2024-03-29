const Joi = require('joi');

const ChangePasswordInfo = Joi.object().options({ abortEarly: false }).keys({
    old_pwd:Joi.string().required().label('Old Password'),
    new_pwd: Joi.string().min(6).max(20).required().label("Password"),
    confirm_pwd: Joi.string().required().valid(Joi.ref('new_pwd')).label("Confirmation Password")
    .messages({ 'any.only': '{{#label}} does not match "New Password"' }),
});

const AdminEditInfo = Joi.object().options({ abortEarly: false }).keys({
    //commmon user details
    email: Joi.string().trim().email().max(50).required().label("Email"),
    firstName: Joi.string().trim().min(2).max(20).required().label("First Name"),
    lastName: Joi.string().trim().min(2).max(20).required().label("Last Name"),
    gender: Joi.string().valid('Male','Female','Other').required().label("Gender"),
});

const FarmerEditInfo = Joi.object().options({ abortEarly: false }).keys({
    //commmon user details
    email: Joi.string().trim().email().max(50).required().label("Email"),
    firstName: Joi.string().trim().min(2).max(20).required().label("First Name"),
    lastName: Joi.string().trim().min(2).max(20).required().label("Last Name"),
    gender: Joi.string().valid('Male','Female','Other').required().label("Gender"),
    //farmer special
    contactNo:Joi.string().trim().required()
    .length(10, 'utf8')
    .message('"Contact Number" must be 10 digits')
    .regex(/^\d+$/)
    .message('"Contact Number" contains invalid characters'),
    district: Joi.string().required().label("District"),
    address: Joi.string().trim().required().max(100).label("Address")
    
});

const BuyerEditInfo = Joi.object().options({ abortEarly: false }).keys({
    //commmon user details
    email: Joi.string().email().max(50).required().label("Email"),
    firstName: Joi.string().trim().min(2).max(20).required().label("First Name"),
    lastName: Joi.string().trim().min(2).max(20).required().label("Last Name"),
    gender: Joi.string().valid('Male','Female','Other').required().label("Gender"),
    // buyer special
    contactNo:Joi.string().trim().required()
    .length(10, 'utf8')
    .message('"Contact Number" must be 10 digits')
    .regex(/^\d+$/)
    .message('"Contact Number" contains invalid characters'),
    district: Joi.string().required().label("District"),
});


module.exports = { ChangePasswordInfo, AdminEditInfo, BuyerEditInfo, FarmerEditInfo };


