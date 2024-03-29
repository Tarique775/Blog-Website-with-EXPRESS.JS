const Post = require('../../models/post');

const Comment = require('../../models/comment');

exports.postCommentController = async (req, res, next) => {
    const { postId } = req.params;

    const { body } = req.body;

    if (!req.user) {
        return res.status(403).json({
            error: 'You are not authenticate user!',
        });
    }

    const comment = new Comment({
        post: postId,
        user: req.user._id,
        body,
        replies: [],
    });

    try {
        const createComment = await comment.save();

        await Post.findOneAndUpdate({ _id: postId }, { $push: { comments: createComment._id } });

        const commentJSON = await Comment.findById(createComment._id).populate({
            path: 'user',
            select: 'profilePics userName',
        });

        global.io.emit('new_comment', commentJSON);

        return res.status(201).json(commentJSON);
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            error: 'Server side problem!',
        });
    }
};

exports.postRepliesController = async (req, res, next) => {
    const { commentId } = req.params;

    const { body } = req.body;

    if (!req.user) {
        return res.status(403).json({
            error: 'You are not authenticate user!',
        });
    }

    const reply = {
        body,
        user: req.user._id,
        createAt: new Date(),
    };

    try {
        await Comment.findOneAndUpdate({ _id: commentId }, { $push: { replies: reply } });
        const replies = await Comment.findById(commentId).populate('user', 'userName profilePics');
        global.io.emit('new_reply', replies);
        // console.log(replies);
        res.status(201).json(replies);
        // profilePics: req.user.profilePics,
        // userName: req.user.userName,
        // id: req.user._id,
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            error: 'Server side problem!',
        });
    }
};
