const express = require("express");
const booksCtrl = require("../controllers/books");
const auth = require("../middlewares/auth");
const multer = require("../middlewares/multer-config");

const router = express.Router();

router.post("/", auth, multer, booksCtrl.addBook);

router.post("/:id/rating", auth, booksCtrl.addRating);

router.put("/:id", auth, multer, booksCtrl.modifyBook);

router.delete("/:id", auth, booksCtrl.deleteBook);

router.get("/:id", booksCtrl.getOneBook);

router.get("/bestrating", booksCtrl.getBestBooks);

router.get("/", booksCtrl.getAllBooks);

module.exports = router;
