const mongoose = require('mongoose');

const { Schema } = mongoose;

const postSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            maxLength: 200,
            trim: true,
        },
        body: {
            type: String,
            required: true,
            maxLength: 2000000,
            trim: true,
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        tags: {
            type: [String],
            trim: true,
        },
        thumbnail: String,
        readTime: String,
        likes: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        dislikes: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        comments: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Comment',
            },
        ],
    },
    { timestamps: true },
);

postSchema.index(
    {
        title: 'text',
        body: 'text',
        tags: 'text',
    },
    {
        weights: {
            title: 5,
            body: 5,
            tags: 5,
        },
    },
);

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
