const express = require("express");
const booksCtrl = require("../controllers/books");
const auth = require("../middlewares/auth");
const multer = require("../middlewares/multer-config");
const sharp = require("../middlewares/sharp");

const router = express.Router();

router.post("/", auth, multer, sharp, booksCtrl.addBook);
router.post("/:id/rating", auth, booksCtrl.addRating);
router.put("/:id", auth, multer, sharp, booksCtrl.modifyBook);
router.delete("/:id", auth, booksCtrl.deleteBook);
router.get("/", booksCtrl.getAllBooks);
router.get("/bestrating", booksCtrl.getBestBooks); // /!\ si la route get/:id est au dessus de /bestrating = error
router.get("/:id", booksCtrl.getOneBook);

module.exports = router;
