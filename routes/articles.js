var express = require('express');
var router = express.Router();
var commentRouter = require('./comments')

// Require model
const Article = require("../models/article");
const Comment = require("../models/comment")

// Create User from HTML Form
router.get("/new", (req, res, next)=> {
  res.render("newArticle")
})

router.post("/", (req, res, next)=>{
  req.body.tags = req.body.tags.split(",").map(el => el.trim());
  Article.create(req.body, (err, article) => {
      console.log(req.body);
      if (err) return next(err);
      res.redirect("/articles")
  }) 
})

// Get update form

router.get("/:id/edit" , (req,res,next) => {
  Article.findById(req.params.id, (err, article)=> {
      if(err) return next(err);
      res.render("updateArticle", { article })
  })
})


// Update single article
router.post(("/:id"), (req, res, next)=>{
  req.body.tags = req.body.tags.split(",").map(el => el.trim());
  var articleId = req.params.id;
  Article.findByIdAndUpdate(articleId, req.body, {new: true}, (err, updatedArticle) =>{
      if (err) return next(err);
      Comment.find({ articleId }, (err, comments)=> {
        if (err) return next(err);
      res.render("articleDetails", { article:updatedArticle, comments } );
      })
  })
})


// Delete article
router.get("/:id/delete", (req, res, next) => {
  var articleId = req.params.id;
  Article.findByIdAndDelete(articleId, (err, article)=>{
      if (err) return next(err);
      Comment.deleteMany({ articleId }, (err, comments)=> {
        if (err) return next(err);
      res.redirect("/articles");
      })
  })
})

// List of articles

router.get("/", (req, res, next)=> {
  Article.find({}, (err, article)=> {
      if (err) return next(err);
      res.render("articles", { article })
  })
})


// Like button
router.get("/:id/like", (req, res, next)=> {
  Article.findByIdAndUpdate(req.params.id, {$inc: {likes: 1}}, {new: true}, (err, article)=>{
    if (err) return next(err);
    // res.render("articleDetails", { article } );
    res.redirect(`/articles/${req.params.id}`)
  })
})

// Dislike button
router.get("/:id/dislike", (req, res, next)=> {
  Article.findByIdAndUpdate(req.params.id, {$inc: {likes: -1}}, {new: true}, (err, article)=>{
    if (err) return next(err);
    res.redirect(`/articles/${req.params.id}`)
  })
})

// Get a single article from DB
router.get("/:id", (req, res, next) => {
  var articleId = req.params.id;
  Article.findById(articleId, (err, article)=>{
    if (err) return next(err);
    Comment.find({ articleId }, (err, comments)=> {
      if (err) return next(err);
      res.render("articleDetails", { article, comments });
    })
  })
})


// Comment router in the end. instead of app.js we are putting comment router here. As no need to access comment without the article.
// router.use("/", commentRouter);

// comments more easier way:

router.post("/:articleid/comments", (req, res, next)=>{
  console.log("inside post comment");
  var articleId = req.params.articleid;
  req.body.articleId = articleId;
  Comment.create(req.body, (err, createdComment)=> {
    if (err) return next(err);
    // update article's  comment array with id of newly created comment.
    Article.findByIdAndUpdate(articleId, {$push: {comments: createdComment.id}}, (err, article)=> {
      if (err) return next(err);
      res.redirect(`/articles/${articleId}`);
    })
  })
})

// Comment edit form 1/2
router.get("/:articleid/comments/:commentId/edit", (req, res, next)=>{
  var articleId = req.params.articleid;
  var CommentId = req.params.commentId;
  Article.findById(articleId, (err, article)=>{
    if (err) return next(err);
    Comment.findById(CommentId, (err, comment)=> {
      if (err) return next(err);
      res.render("editCommentForm", { article, comment });
    })
  })
})

// Update a Comment 2/2
router.post("/:articleid/comments/:commentId", (req, res, next)=>{
  var articleId = req.params.articleid;
  var CommentId = req.params.commentId;
  Article.findById(articleId, (err, article)=> {
    if (err) return next(err);
    Comment.findByIdAndUpdate(CommentId, req.body, (err, comments)=> {
      if (err) return next(err);
      res.redirect(`/articles/${articleId}`);
    })
  })
})

// Delete a comment
router.get("/:articleid/comments/:commentId/delete", (req, res, next)=>{
  var articleId = req.params.articleid;
  var CommentId = req.params.commentId;
  Article.findById(articleId, (err, article)=> {
    if (err) return next(err);
    Comment.findByIdAndDelete(CommentId, (err, comments)=> {
      if (err) return next(err);
      res.redirect(`/articles/${articleId}`);
    })
  })
})


module.exports = router;


