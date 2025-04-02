const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
    {
        commenterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        text: {
            type: String,
            required: true,
        },

        replies: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment",
            }
        ],

        likes: {
          type: [mongoose.Schema.Types.ObjectId],
          ref: "User",
          default: [],
        },
    },
    {
        timestamps: true,
    }
);

const Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;
