class PostDto {
  constructor(post) {
    (this._id = post._id),
      (this.content = post.content),
      (this.title = post.title);
    this.author = post.author;
  }
}

module.exports = PostDto;
