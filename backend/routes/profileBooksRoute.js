import express from 'express';
import { ProfileBook } from '../models/profileBookModel.js';
import User from '../models/userModel.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route for Save a new ProfileBook (Protected)
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
    const newProfileBook = {
      title: request.body.title,
      author: request.body.author,
      publishYear: request.body.publishYear,
      user: request.user.id, // Associate book with the logged-in user
    };

    const profileBook = await ProfileBook.create(newProfileBook);

    // Add the profile book to the user's profileBooks array
    await User.findByIdAndUpdate(request.user.id, { $push: { profileBooks: profileBook._id } });

    return response.status(201).send(profileBook);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route for Get All ProfileBooks from database (Protected)
router.get('/', protect, async (request, response) => {
  try {
    const profileBooks = await ProfileBook.find({}).populate('user', 'username'); // Fetch all profile books and populate user

    return response.status(200).json({
      count: profileBooks.length,
      data: profileBooks,
    });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route for Get One ProfileBook from database by id (Protected - still needs ownership check)
router.get('/:id', protect, async (request, response) => {
  try {
    const { id } = request.params;

    const profileBook = await ProfileBook.findById(id).populate('user', 'username');

    if (!profileBook) {
      return response.status(404).json({ message: 'Profile Book not found' });
    }

    // Allow viewing, but only creator can edit/delete (handled in frontend)
    // if (profileBook.user.toString() !== request.user.id) {
    //   return response.status(401).json({ message: 'Not authorized to view this profile book' });
    // }

    return response.status(200).json(profileBook);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route for Update a ProfileBook (Protected)
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
    const profileBook = await ProfileBook.findById(id);

    if (!profileBook) {
      return response.status(404).json({ message: 'Profile Book not found' });
    }

    if (profileBook.user.toString() !== request.user.id) {
      return response.status(401).json({ message: 'Not authorized to update this profile book' });
    }

    const result = await ProfileBook.findByIdAndUpdate(id, request.body);

    if (!result) {
      return response.status(404).json({ message: 'Profile Book not found' });
    }

    return response.status(200).send({ message: 'Profile Book updated successfully' });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route for Delete a profile book (Protected)
router.delete('/:id', protect, async (request, response) => {
  try {
    const { id } = request.params;
    const profileBook = await ProfileBook.findById(id);

    if (!profileBook) {
      return response.status(404).json({ message: 'Profile Book not found' });
    }

    if (profileBook.user.toString() !== request.user.id) {
      return response.status(401).json({ message: 'Not authorized to delete this profile book' });
    }

    const result = await ProfileBook.findByIdAndDelete(id);

    if (!result) {
      return response.status(404).json({ message: 'Profile Book not found' });
    }

    // Remove the profile book from the user's profileBooks array
    await User.findByIdAndUpdate(request.user.id, { $pull: { profileBooks: id } });

    return response.status(200).send({ message: 'Profile Book deleted successfully' });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

export default router; 