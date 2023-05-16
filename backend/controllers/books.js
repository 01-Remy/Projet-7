const Book = require("../models/book");
const fs = require("fs");

exports.addBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  if (!req.file) {
    return res.status(400).json({ message: "Fichier image manquant !" });
  }
  delete bookObject._id;
  delete bookObject.userId;
  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: req.sharp.imageUrl,
  });
  book
    .save()
    .then(() => res.status(201).json({ message: "Livre enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.addRating = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId === req.auth.userId) {
        res.status(401).json({ message: "Vous ne pouvez pas noter un livre que vous avez ajouté" });
      } else if (book.ratings.includes({ userId: req.auth.userId })) {
        res.status(401).json({ message: "Vous avez déjà noté ce livre" });
      } else if (req.body.rating >= 0 && req.body.rating <= 5) {
        const newRating = {
          userId: req.auth.userId,
          grade: req.body.rating,
        };
        let sum = 0;
        for (let i = 0; i < book.ratings.length; i++) {
          sum += book.ratings[i].grade;
        }
        const average = sum / book.ratings.length;
        book.ratings.push(newRating);
        book.averageRating = average;
        Book.updateOne({ _id: req.params.id }, { book })
          .then(() => res.status(200).json(book))
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: req.sharp.imageUrl,
      }
    : { ...req.body };
  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId !== req.auth.userId) {
        res.status(401).json({ message: "Non-autorisé" });
      } else {
        if (req.file) {
          const filename = book.imageUrl.split("/images/resized/")[1];
          fs.unlink(`images/resized/${filename}`, (err) => {
            if (err) throw err;
          });
        }
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: "Livre modifié !" }))
          .catch((error) => res.status(400).json({ error }));
      }
    })
    .catch((error) => res.status(404).json({ error }));
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId !== req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const filename = book.imageUrl.split("/images/resized/")[1];
        fs.unlink(`images/resized/${filename}`, (err) => {
          if (err) throw err;
          Book.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Livre supprimé !" }))
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => res.status(200).json(book))
    .catch((error) => res.status(404).json({ error }));
};

exports.getBestBooks = (req, res, next) => {
  Book.find()
    .then((books) => {
      books.sort((a, b) => {
        return a.averageRating - b.averageRating;
      });
      const bestBooks = books.slice(-3);
      res.status(200).json(bestBooks);
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};
