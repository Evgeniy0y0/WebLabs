const { validationResult } = require('express-validator');
const ApiError = require('../errors/ApiError');

module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array().map(e => ({ field: e.path, msg: e.msg }));
    throw ApiError.badRequest('Validation error', errorList);
  }
  next();
};