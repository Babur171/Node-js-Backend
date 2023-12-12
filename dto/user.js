class UserDto {
  constructor(user) {
    (this._id = user._id),
      (this.email = user.email),
      (this.username = user.username);
      (this.role = user.role);

  }
}

module.exports = UserDto;
