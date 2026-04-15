const Post = require('../models/Post');
const Comment = require('../models/Comment');
const ApiError = require('../errors/ApiError');
const asyncHandler = require('../middlewares/asyncHandler');

// ==================== CREATE ====================
exports.createPost = asyncHandler(async (req, res) => {
  const { title, content, author, tags } = req.body;

  const post = await Post.create({
    title,
    content,
    author,
    tags: tags || []
  });

  res.status(201).json({
    success: true,
    data: post,
    message: 'Пост успішно створено'
  });
});

// ==================== READ ====================
exports.getAllPosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Post.countDocuments();

  res.status(200).json({
    success: true,
    count: posts.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: posts
  });
});

exports.getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw ApiError.notFound('Пост не знайдено');
  }

  const comments = await Comment.find({ post: post._id })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      post,
      comments
    }
  });
});

exports.searchPosts = asyncHandler(async (req, res) => {
  const { q } = req.query;

  const posts = await Post.find(
    { $text: { $search: q } },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });

  res.status(200).json({
    success: true,
    count: posts.length,
    data: posts
  });
});

// ==================== UPDATE ====================
exports.updatePost = asyncHandler(async (req, res) => {
  const { title, content, tags } = req.body;

  const post = await Post.findByIdAndUpdate(
    req.params.id,
    {
      title,
      content,
      tags,
      updatedAt: Date.now()
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!post) {
    throw ApiError.notFound('Пост не знайдено');
  }

  res.status(200).json({
    success: true,
    data: post,
    message: 'Пост успішно оновлено'
  });
});

exports.likePost = asyncHandler(async (req, res) => {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { $inc: { likes: 1 } },
    { new: true }
  );

  if (!post) {
    throw ApiError.notFound('Пост не знайдено');
  }

  res.status(200).json({
    success: true,
    data: post,
    message: 'Лайк додано'
  });
});

// ==================== DELETE ====================
exports.deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw ApiError.notFound('Пост не знайдено');
  }

  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Пост та всі коментарі видалено'
  });
});