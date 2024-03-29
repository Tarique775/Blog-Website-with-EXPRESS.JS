const Post = require('../../models/post');

exports.getLikesController = async (req, res, next) => {
    const { postId } = req.params;

    if (!req.user) {
        return res.status(403).json({
            error: 'You are not authenticate user!',
        });
    }
    let liked = null;
    const userId = req.user._id;

    try {
        const post = await Post.findById(postId);

        if (post.dislikes.includes(userId)) {
            await Post.findOneAndUpdate({ _id: postId }, { $pull: { dislikes: userId } });
        }

        if (post.likes.includes(userId)) {
            await Post.findOneAndUpdate({ _id: postId }, { $pull: { likes: userId } });

            liked = false;
        } else {
            await Post.findOneAndUpdate({ _id: postId }, { $push: { likes: userId } });

            liked = true;
        }

        const updatePost = await Post.findById(postId);

        res.status(200).json({
            liked,
            totalLikes: updatePost.likes.length,
            totalDislikes: updatePost.dislikes.length,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            error: 'Server side problem!',
        });
    }
};

exports.getDislikesController = async (req, res, next) => {
    const { postId } = req.params;

    if (!req.user) {
        return res.status(403).json({
            error: 'You are not authenticate user!',
        });
    }

    let disliked = null;
    const userId = req.user._id;

    try {
        const post = await Post.findById(postId);

        if (post.likes.includes(userId)) {
            await Post.findOneAndUpdate({ _id: postId }, { $pull: { likes: userId } });
        }

        if (post.dislikes.includes(userId)) {
            await Post.findOneAndUpdate({ _id: postId }, { $pull: { dislikes: userId } });

            disliked = false;
        } else {
            await Post.findOneAndUpdate({ _id: postId }, { $push: { dislikes: userId } });

            disliked = true;
        }

        const updatePost = await Post.findById(postId);

        res.status(200).json({
            disliked,
            totalLikes: updatePost.likes.length,
            totalDislikes: updatePost.dislikes.length,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            error: 'Server side problem!',
        });
    }
};
