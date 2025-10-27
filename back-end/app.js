const express = require('express');
const app = express();
const multer = require('multer'); 
const path = require('path');
const cors = require('cors');
const connectDB = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { protect,admin } = require('./middleware/authMiddleware');

// Models
const User = require('./models/User');
const Complaint = require('./models/Complaint');
const Comment = require('./models/Comment');

require('dotenv').config();

const PORT = process.env.PORT || 8080;



// Middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true
}))
app.use(cookieParser());
// Serve files from the 'uploads' directory statically at the '/uploads' URL path
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const anonymousUsernames = [
  'Brave Lion', 'Clever Fox', 'Wise Owl', 'Swift Eagle', 'Silent Wolf',
  'Curious Cat', 'Bold Bear', 'Gentle Deer', 'Mighty Tiger', 'Happy Dolphin',
  'Lucky Penguin', 'Calm Turtle', 'Shy Panda', 'Eager Beaver', 'Joyful Robin',
  'Noble Falcon', 'Bright Hawk', 'Daring Jaguar', 'Fierce Panther', 'Loyal Serpent',
  'Patient Shark', 'Quick Sparrow', 'Radiant Stallion', 'Serene Swan', 'Strong Whale',
  'Valiant Phoenix', 'Vigilant Dragon', 'Witty Griffin', 'Zealous Sparrow', 'Amber Wolf',
  'Azure Dragon', 'Crimson Hawk', 'Golden Griffin', 'Jade Serpent', 'Onyx Panther',
  'Ruby Falcon', 'Silver Lion', 'Emerald Fox', 'Mystic Owl', 'Ancient Turtle',
  'Hidden Badger', 'Shadow Fox', 'Spirit Eagle', 'Astral Wolf', 'Cosmic Serpent',
  'Lunar Tiger', 'Solar Hawk', 'Ethereal Deer', 'Wandering Albatross', 'Gallant Horse',
  'Humble Bee', 'Keen Otter', 'Jovial Jay', 'Nimble Rabbit', 'Quiet Mole'
];

// Connect to the database
connectDB();

// --- Multer Configuration ---
const storage = multer.diskStorage({
  // destination: function determines the folder where files will be saved
  destination: function (req, file, cb) {
    // 'cb' is a callback function (error, destination_folder)
    cb(null, 'uploads/'); // Save files in the 'uploads/' folder
  },
  // filename: function determines the name of the file inside the 'uploads/' folder
  filename: function (req, file, cb) {
    // We create a unique filename to prevent overwrites
    // It uses the original fieldname, the current timestamp, and the original file extension
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Create the multer instance with the storage configuration
const upload = multer({ storage: storage });

app.get('/', (req, res) => {
	res.send('Hello World!');
});

// User Registration Endpoint
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1. Check if a user with this email already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User with that email already exists.' });
    }

    // 2. Hash the password for security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate a random anonymous name for the new user
    const randomIndex = Math.floor(Math.random() * anonymousUsernames.length);
    const randomName = anonymousUsernames[randomIndex];

    // 3. Create the new user in the database
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      anonymousName: randomName,
    });

    // 4. If the user was created successfully, generate a token
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
      });

      res.cookie('token', token,{
        maxAge: 30*24*60*60*1000, // 30 days
      });
      // 5. Send a success response with user data and the token
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        anonymousName: user.anonymousName,
        token: token,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data received.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// User Login Endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if a user with that email exists
    const user = await User.findOne({ email });

    // 2. If user exists, compare the provided password with the stored hashed password
    if (user && (await bcrypt.compare(password, user.password))) {
      // Passwords match. Create a token.
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
      });

      // 3. Set the token in an HTTP-Only cookie
      res.cookie('token', token, {
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      // 4. Send the user's data back in the response
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      // User not found or password doesn't match
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// User Logout Endpoint
app.post('/api/auth/logout', (req, res) => {
  res.cookie('token', '');
  res.status(200).json({ message: 'Logged out successfully' });
});

// Protected Complaint Creation Endpoint
app.post('/api/complaints', protect,upload.single('image'), async (req, res) => {
  const { title, description } = req.body;

  // Basic validation
  if (!title || !description) {
    return res.status(400).json({ message: 'Please provide a title and description.' });
  }

  try {
    const complaint = await Complaint.create({
      title,
      description,
      author: req.user._id, // The 'protect' middleware gives us req.user
    });

    res.status(201).json(complaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get All Complaints Endpoint with Search Functionality
app.get('/api/complaints', async (req, res) => {
  try {
    // Check if a 'search' query parameter exists in the URL
    const keyword = req.query.search ? {
      // Create a filter object to search in title OR description
      // $or performs an OR condition
      // $regex provides regex capabilities for case-insensitive search
      $or: [
        { title: { $regex: req.query.search, $options: 'i' } }, // 'i' for case-insensitive
        { description: { $regex: req.query.search, $options: 'i' } },
      ],
    } : {}; // If no search query, the filter object is empty ({})

    // Apply the filter object (keyword) to the find() method
    const complaints = await Complaint.find({ ...keyword })
      .populate('author', 'anonymousName')
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Protected Get My Complaints Endpoint
app.get('/api/complaints/mycomplaints', protect, async (req, res) => {
  try {
    const complaints = await Complaint.find({ author: req.user._id })
      .populate('author', 'anonymousName')
      .sort({ createdAt: -1 });
      
    res.status(200).json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Protected Get Single Complaint Endpoint
app.get('/api/complaints/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('author', 'anonymousName');

    if (complaint) {
      res.status(200).json(complaint);
    } else {
      res.status(404).json({ message: 'Complaint not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});
// Protected Update Complaint Endpoint
app.put('/api/complaints/:id', protect, async (req, res) => {
  const { title, description } = req.body;

  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Ownership Check
    // Make sure the logged-in user is the author of the complaint
    if (complaint.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Update the fields
    complaint.title = title || complaint.title;
    complaint.description = description || complaint.description;

    const updatedComplaint = await complaint.save();
    res.status(200).json(updatedComplaint);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});



// Protected Delete Complaint Endpoint
app.delete('/api/complaints/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // --- Ownership Check ---
    if (complaint.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await complaint.deleteOne(); // Or Complaint.findByIdAndDelete(req.params.id)
    res.status(200).json({ message: 'Complaint removed' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});



// Protected Upvote Complaint Endpoint
app.post('/api/complaints/:id/upvote', protect, async (req, res) => {
  try {
    // Find a complaint that matches the ID AND where the user has NOT already voted
    const complaint = await Complaint.findOneAndUpdate(
      { _id: req.params.id, upvotes: { $ne: req.user._id } }, 
      {
        $push: { upvotes: req.user._id },
        $inc: { upvoteCount: 1 }        
      },
      { new: true } 
    );

    // If complaint is null, it means the user had already voted or the complaint doesn't exist.
    if (!complaint) {
      return res.status(400).json({ message: 'Complaint not found or you have already upvoted.' });
    }

    res.status(200).json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Protected Remove Upvote Complaint Endpoint
app.delete('/api/complaints/:id/upvote', protect, async (req, res) => {
  try {
    // Find a complaint that matches the ID AND where the user HAS voted
    const complaint = await Complaint.findOneAndUpdate(
      { _id: req.params.id, upvotes: req.user._id }, // Query checks if user ID is in the array
      {
        $pull: { upvotes: req.user._id }, 
        $inc: { upvoteCount: -1 }        
      },
      { new: true }
    );

    if (!complaint) {
      return res.status(400).json({ message: 'Complaint not found or you have not upvoted it.' });
    }

    res.status(200).json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});


// Protected Add Comment to Complaint Endpoint
app.post('/api/complaints/:id/comments', protect, async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ message: 'Comment text is required.' });
  }

  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    // Create the new comment
    const comment = await Comment.create({
      text,
      author: req.user._id,
      complaint: req.params.id,
    });

    // Add the comment's ID to the complaint's comments array
    complaint.comments.push(comment._id);
    await complaint.save();

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Protected Get Comments for a Complaint Endpoint
app.get('/api/complaints/:id/comments', protect, async (req, res) => {
  try {
    const comments = await Comment.find({ complaint: req.params.id })
      .populate('author', 'anonymousName') // Show the author's name
      .sort({ createdAt: -1 });   // Show newest comments first

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Protected Delete Comment Endpoint
app.delete('/api/comments/:commentId', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    // --- Ownership Check ---
    // Allow deletion if the user is the author OR if the user is an admin
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Remove the comment ID from the parent complaint's array
    await Complaint.findByIdAndUpdate(comment.complaint, {
      $pull: { comments: req.params.commentId },
    });

    // Delete the comment document
    await comment.deleteOne(); // Use deleteOne() on the document instance

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Admin: Get All Complaints Sorted by Upvotes
app.get('/api/admin/complaints', protect, admin, async (req, res) => {
  try {
    const complaints = await Complaint.find({})
      .populate('author', 'name email')
      .sort({ upvoteCount: -1 }); // Sort by upvoteCount, descending

    res.status(200).json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Admin: Increment Strikes for a Complaint
app.patch('/api/complaints/:id/strike', protect, admin, async (req, res) => {
  try {
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { $inc: { strikes: 1 } },
      { new: true } // This option returns the updated document
    );

    if (updatedComplaint) {
      res.status(200).json(updatedComplaint);
    } else {
      res.status(404).json({ message: 'Complaint not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});



// Protected User Profile Endpoint
app.get('/api/users/profile', protect, (req, res) => {
  if (req.user) {
    res.status(200).json(req.user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

 
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

