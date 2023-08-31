class PostDto {
  constructor(post) {
    (this._id = post._id),
      (this.content = post.content),
      (this.title = post.title);
    this.image = post.image;
    this.author = {
      username: post.author.username,
      id: post.author._id,
    };
    this.comments = post?.comments?.length;
    this.likes = post?.likes?.length;
  }
}

module.exports = PostDto;
