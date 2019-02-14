const express = require("express");

const Users = require("./userDb");

const cors = require("cors");

const router = express.Router();
router.use(express.json());
router.use(cors());

// Middleware
function upperCaseName(req, res, next) {
  if (!req.body.name) {
    res.status(400).json({
      message: "Please include a name"
    })
  } else {
    req.body.name = req.body.name.toUpperCase();
  }
  
  next();
}

// GET
router.get("/", async (req, res) => {
  try {
    const users = await Users.get(req.query);
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error retrieving the posts."
    });
  }
});

router.get("/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await Users.getById(userId);
    console.log(user);
    if (!user) {
      res.status(404).json({
        error: "The post with the specified Id does not exist"
      });
    } else {
      res.status(200).json({ user });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "The post information could not be retrieved."
    });
  }
});

router.get("/posts/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const posts = await Users.getUserPosts(userId);
    console.log(posts);
    if (!posts) {
      res.status(404).json({
        error: "The post with the specified Id does not exist"
      });
    } else {
      res.status(200).json({ posts });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "The post information could not be retrieved."
    });
  }
});

// POST

router.post("/", upperCaseName, async (req, res) => {
  const { name } = req.body;
  const newUser = req.body;

  if (!name) {
    return res.status(400).json({
      errorMessage: "Please provide a name for the user"
    });
  }

  try {
    const user = await Users.insert(newUser);
    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "There was an error while saving the post to the database."
    });
  }
});

// PUT

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const changes = req.body;

  if (!changes.name) {
    return res.status(400).json({
      errorMessage: "Please provide text to update the post"
    });
  }

  try {
    const user = await Users.update(id, changes);
    if (!user) {
      res.status(404).json({
        message: "The post with the specified ID does not exist"
      });
    } else {
      res.status(201).json({
        success: true,
        user
      });
    }
  } catch (error) {
    res.status(500).json({
      error: "The post information could not be modified."
    });
  }
});

// DELETE

router.delete("/:id", (req, res) => {
  const id = req.params.id;
  Users.removeUserPosts(id)
  .then(() => {
    Users.remove(id)
    .then(results => {
      if (results) {
        res.status(200).json({
          message: "User deleted"
        })
      } else {
        res.status(404).json({
          message: "Could not delete user at the specified ID"
        })
      }
    })
  })
  .catch(err => {
    res.status(500).json({
      error: "THe user could not be removed."
    })
  })
  

});

module.exports = router;
