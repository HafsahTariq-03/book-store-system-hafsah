import express from 'express';
import { Book } from '../models/bookModel.js';
import User from '../models/userModel.js'; // Import the User model
import { protect } from '../middleware/authMiddleware.js'; // Import the protect middleware

const router = express.Router();

// Route for Save a new Book (Protected)
router.post('/', protect, async (request, response) => {
  try {
    if (
      !request.body.title ||
      !request.body.author ||
      !request.body.publishYear
    ) {
      return response.status(400).send({
        message: 'Send all required fields: title, author, publishYear',
      });
    }
    const newBook = {
      title: request.body.title,
      author: request.body.author,
      publishYear: request.body.publishYear,
      user: request.user.id, // Associate book with the logged-in user
    };

    const book = await Book.create(newBook);

    // Add the book to the user's books array
    await User.findByIdAndUpdate(request.user.id, { $push: { books: book._id } });

    return response.status(201).send(book);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route for Get All Books from database (Protected - fetch only user's books)
router.get('/', protect, async (request, response) => {
  try {
    const books = await Book.find({ user: request.user.id }); // Filter by user ID

    return response.status(200).json({
      count: books.length,
      data: books,
    });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route for Get One Book from database by id (Protected)
router.get('/:id', protect, async (request, response) => {
  try {
    const { id } = request.params;

    const book = await Book.findById(id);

    if (!book || book.user.toString() !== request.user.id) {
      return response.status(404).json({ message: 'Book not found or not authorized' });
    }

    return response.status(200).json(book);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route for Update a Book (Protected)
router.put('/:id', protect, async (request, response) => {
  try {
    if (
      !request.body.title ||
      !request.body.author ||
      !request.body.publishYear
    ) {
      return response.status(400).send({
        message: 'Send all required fields: title, author, publishYear',
      });
    }

    const { id } = request.params;
    const book = await Book.findById(id);

    if (!book) {
      return response.status(404).json({ message: 'Book not found' });
    }

    if (book.user.toString() !== request.user.id) {
      return response.status(401).json({ message: 'Not authorized to update this book' });
    }

    const result = await Book.findByIdAndUpdate(id, request.body);

    if (!result) {
      return response.status(404).json({ message: 'Book not found' });
    }

    return response.status(200).send({ message: 'Book updated successfully' });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route for Delete a book (Protected)
router.delete('/:id', protect, async (request, response) => {
  try {
    const { id } = request.params;
    const book = await Book.findById(id);

    if (!book) {
      return response.status(404).json({ message: 'Book not found' });
    }

    if (book.user.toString() !== request.user.id) {
      return response.status(401).json({ message: 'Not authorized to delete this book' });
    }

    const result = await Book.findByIdAndDelete(id);

    if (!result) {
      return response.status(404).json({ message: 'Book not found' });
    }

    // Remove the book from the user's books array
    await User.findByIdAndUpdate(request.user.id, { $pull: { books: id } });

    return response.status(200).send({ message: 'Book deleted successfully' });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

export default router;
