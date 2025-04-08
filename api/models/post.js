const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      required: true,
    },

    img: {
      type: String,
    },

    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },

    comments: [
      {
        commentedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },

        text: {
          type: String,
          required: true,
        },

        likes: {
          type: [mongoose.Schema.Types.ObjectId],
          ref: "User",
          default: [],
        },

        replies: [
          {
            repliedBy: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              required: true,
            },

            text: {
              type: String,
              required: true,
            },

            likes: {
              type: [mongoose.Schema.Types.ObjectId],
              ref: "User",
              default: [],
            },

            parentReplyId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
              default: null,
            },

            createdAt: {
              type: Date,
              default: Date.now,
            },

            updatedAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
