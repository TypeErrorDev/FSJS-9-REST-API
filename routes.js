"use strict";
//Import dependencies
const express = require("express");
const { User, Course } = require("./models");
const { authenticateUser } = require("./middleware/authenticateUser");

const router = express.Router();

function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}
// USER ROUTES
// A /api/users GET route that will return all properties and values for the currently authenticated User along with a 200 HTTP status code.
router.get(
  "/users",
  authenticateUser,
  asyncHandler(async (req, res) => {
    const user = req.currentUser;
    res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddress: user.emailAddress,
    });
  })
);
// A /api/users POST route that will create a new user, set the Location header to "/", and return a 201 HTTP status code and no content.
router.post(
  "/users",
  asyncHandler(async (req, res) => {
    try {
      await User.create(req.body);
      res.location("/");
      res.status(201).end();
    } catch (error) {
      // console.log('Error', error.name);
      if (
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeUniqueConstraintError"
      ) {
        const errors = error.errors.map((err) => err.message);
        res.status(400).json({ errors });
      } else {
        throw error;
      }
    }
  })
);

// COURSE ROUTES
// A /api/courses GET route that will return all courses including the User associated with each course and a 200 HTTP status code.

// A /api/courses/:id GET route that will return the corresponding course including the User associated with that course and a 200 HTTP status code.

// A /api/courses POST route that will create a new course, set the Location header to the URI for the newly created course, and return a 201 HTTP status code and no content.

// A /api/courses/:id PUT route that will update the corresponding course and return a 204 HTTP status code and no content.

// A /api/courses/:id DELETE route that will delete the corresponding course and return a 204 HTTP status code and no content.

module.exports = router;
