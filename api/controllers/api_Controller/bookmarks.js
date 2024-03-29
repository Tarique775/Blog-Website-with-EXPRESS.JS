const Profile = require('../../models/profile');

exports.getBookMarksController = async (req, res, next) => {
    const { postId } = req.params;

    if (!req.user) {
        return res.status(403).json({
            error: 'You are not authenticate user!',
        });
    }

    let bookmarked = null;
    const userId = req.user._id;

    try {
        const profile = await Profile.findOne({ user: userId });

        if (profile.bookmarks.includes(postId)) {
            await Profile.findOneAndUpdate({ user: userId }, { $pull: { bookmarks: postId } });

            bookmarked = false;
        } else {
            await Profile.findOneAndUpdate({ user: userId }, { $push: { bookmarks: postId } });

            bookmarked = true;
        }

        res.status(200).json({
            bookmarked,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            error: 'Server side problem!',
        });
    }
};
