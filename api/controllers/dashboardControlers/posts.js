const { validationResult } = require('express-validator');
const readingtime = require('reading-time');
const { errorFormetter } = require('./postsValidation');
const Profile = require('../../models/profile');
const Post = require('../../models/post');

exports.getCreatePosts = (req, res, next) => {
    res.render('pages/dashbord/posts/create-posts', {
        error: {},
        value: {},
        page_name: 'create-posts',
    });
};

exports.postCreatePosts = async (req, res, next) => {
    const { title, body } = req.body;
    let { tags } = req.body;

    const errors = validationResult(req).formatWith(errorFormetter);

    if (!errors.isEmpty()) {
        return res.render('pages/dashbord/posts/create-posts', {
            error: errors.mapped(),
            value: {
                title,
                body,
            },
            page_name: 'create-posts',
        });
    }

    if (tags) {
        tags = tags.split(',');
        tags = tags.map((t) => t.trim());
    }

    const readTime = readingtime(body).text;
    try {
        const post = new Post({
            title,
            body,
            author: req.user._id,
            tags: tags || '',
            thumbnail: '',
            readTime,
            likes: [],
            dislikes: [],
            comments: [],
        });

        if (req.file) {
            post.thumbnail = `/uploads/postImage/${req.file.filename}`;
        }

        const createPost = await post.save();
        await Profile.findOneAndUpdate(
            { user: req.user._id },
            { $push: { posts: createPost._id } },
        );

        // res.redirect(`/dashbord/edit-posts/${createPost._id}`);
        res.redirect('/dashbord/posts');
    } catch (e) {
        next(e);
    }
};

exports.getEditPosts = async (req, res, next) => {
    const { postId } = req.params;

    try {
        const post = await Post.findOne({ author: req.user._id, _id: postId });

        if (!post) {
            const error = new Error('404 not found');
            error.status = 404;
            throw error;
        }

        res.render('pages/dashbord/posts/edit-posts', {
            error: {},
            post,
            page_name: 'my-posts',
        });
    } catch (e) {
        next(e);
    }
};

exports.postEditPosts = async (req, res, next) => {
    let { title, body, tags } = req.body;
    const { postId } = req.params;
    const errors = validationResult(req).formatWith(errorFormetter);

    try {
        const post = await Post.findOne({ author: req.user._id, _id: postId });

        if (!post) {
            const error = new Error('404 not found');
            error.status = 404;
            throw error;
        }
        if (!errors.isEmpty()) {
            return res.render('pages/dashbord/posts/edit-posts', {
                error: errors.mapped(),
                post,
                page_name: 'my-posts',
            });
        }

        if (tags) {
            tags = tags.split(',');
            tags = tags.map((t) => t.trim());
        }
        let { thumbnail } = post;
        if (req.file) {
            thumbnail = `/uploads/postImage/${req.file.filename}`;
        }

        const editPost = await Post.findOneAndUpdate(
            { _id: post._id },
            {
                $set: {
                    title,
                    body,
                    tags,
                    thumbnail,
                },
            },
            { new: true }
        );
        res.redirect(`/dashbord/edit-posts/${editPost._id}`);
    } catch (e) {
        next(e);
    }
};

exports.getDeletePosts = async (req, res, next) => {
    const { postId } = req.params;
    try {
        const post = await Post.findOne({ author: req.user._id, _id: postId });
        if (!post) {
            const error = new Error('404 not found');
            error.status = 404;
            throw error;
        }
        await Post.findOneAndDelete({ _id: postId });
        await Profile.findOneAndUpdate({ user: req.user._id }, { $pull: { posts: postId } });

        res.redirect('/dashbord/posts');
    } catch (e) {
        next(e);
    }
};

exports.getMyPosts = async (req, res, next) => {
    try {
        const posts = await Post.find({ author: req.user._id });
        res.render('pages/dashbord/posts/my-posts', {
            posts,
            page_name: 'my-posts',
        });
    } catch (e) {
        next(e);
    }
};
