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
router.get(
  "/courses",
  asyncHandler(async (req, res) => {
    const course = await Course.findAll({
      attributes: { exclude: ["userId", "createdAt", "updatedAt"] },
      include: [
        {
          model: User,
          attributes: { exclude: ["createdAt", "udpatedAt", "password"] },
        },
      ],
    });
    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: "Sorry, but no courses were found" });
    }
  })
);
// A /api/courses/:id GET route that will return the corresponding course including the User associated with that course and a 200 HTTP status code.
router.get(
  "/courses/:id",
  asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id, {
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: [
        {
          model: User,
          attributes: { exclude: ["createdAt", "updatedAt", "password"] },
        },
      ],
    });
    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: "Sorry, but no course was found" });
    }
  })
);
// A /api/courses POST route that will create a new course, set the Location header to the URI for the newly created course, and return a 201 HTTP status code and no content.
router.post(
  "/courses",
  authenticateUser,
  asyncHandler(async (req, res) => {
    try {
      const course = await Course.create(req.body);
      res.location(`/courses/${course.id}`);
      res.status(201).end();
    } catch (error) {
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
// A /api/courses/:id PUT route that will update the corresponding course and return a 204 HTTP status code and no content.
router.put(
  "/courses/:id",
  authenticateUser,
  asyncHandler(async (req, res) => {
    let course = await Course.findByPk(req.params.id);
    try {
      if (course && req.currentUser.id === course.userId) {
        course.title = req.body.title;
        course.description = req.body.description;
        course.estimatedTime = req.body.estimatedTime;
        course.materialsNeeded = req.body.materialsNeeded;
        await course.update(req.body);
        res.status(204).end();
      } else {
        res
          .status(403)
          .json({ message: "Sorry, but you are not assigned this course" })
          .end();
      }
    } catch (error) {
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
// A /api/courses/:id DELETE route that will delete the corresponding course and return a 204 HTTP status code and no content.
router.delete(
  "/courses/:id",
  authenticateUser,
  asyncHandler(async (req, res) => {
    let course = await Course.findByPk(req.params.id);

    if (course.dataValues.userId === req.currentUser.id) {
      await course.destroy();
      console.log("deleting course");
      res.status(204).end();
    } else {
      console.log(
        "Sorry but your not assigned this course, so you can't delete it"
      );
      res
        .status(418)
        .json({
          message:
            "Sorry but your not assigned this course, so you can't delete it",
        })
        .end();
    }
  })
);
module.exports = router;
