class PostDtoById {
  constructor(post) {
    (this._id = post._id),
      (this.content = post.content),
      (this.title = post.title);
    this.author = {
      username: post.author.username,
      id: post.author._id,
    };
  }
}

module.exports = PostDtoById;
