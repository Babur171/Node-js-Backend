class PostDto {
  constructor(post) {
    (this._id = post._id),
      (this.content = post.content),
      (this.title = post.title);
    this.image = post.image;
    this.author = post.author;
  }
}

module.exports = PostDto;
