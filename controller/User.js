const User = require("../modal/User");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const UserDto = require("../dto/user");
const jwt = require("jsonwebtoken");
const { SENDGRID_KEY, SENDER_EMAIL_ADDRESS } = require("../config/constants");
const generateToken = require("../config/generateToken");
const axios = require("axios");
const sgMail = require("@sendgrid/mail");
const Token = require("../modal/Token");
const crypto = require("crypto");

const SENDGRID_API_KEY = SENDGRID_KEY;
const SENDER_EMAIL = SENDER_EMAIL_ADDRESS;

const UserController = {
  async register(req, res, next) {
    var validateUser = Joi.object({
      username: Joi.string().required(),
      email: Joi.string().required(),
      password: Joi.string().required(),
      gender: Joi.boolean().required(),
    });
    const { error } = validateUser.validate(req.body);
    if (error) {
      next(error);
    }
    const { username, email, password, gender } = req.body;
    try {
      const emailExist = await User.exists({ email: email });
      if (!emailExist) {
        let user;
        try {
          const hasPassword = await bcrypt.hash(password, 10);
          user = new User({
            username: username,
            email: email,
            password: hasPassword,
            gender: gender,
          });
          await user.save();
        } catch (error) {
          return next(error);
        }
        return res.status(201).json({ user: user });
      } else {
        const error = {
          status: 209,
          message: "Email already exist",
        };
        return next(error);
      }
    } catch (err) {
      return next(err);
    }
  },

  async login(req, res, next) {
    var validateUser = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    });
    const { error } = validateUser.validate(req.body);
    if (error) {
      next(error);
    }
    const { email, password } = req.body;

    let user;
    try {
      user = await User.findOne({ email: email });

      if (user) {
        let pass = await bcrypt.compare(password, user.password);

        if (pass) {
          const newUser = new UserDto(user);
          return res
            .status(200)
            .json({ user: newUser, accessToken: generateToken(user._id) });
        } else {
          let error = {
            status: 401,
            message: "Invalid password",
          };
          return next(error);
        }
      } else {
        let error = {
          status: 401,
          message: "Email not found",
        };
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
  },
  async googleLogin(req, res, next) {
    if (req.isAuthenticated()) {
      const { emails, id, displayName } = req.user;
      let user = {
        _id: id,
        email: emails[0]?.value,
        username: displayName,
      };

      const newUser = new UserDto(user);
      return res
        .status(201)
        .json({ user: newUser, accessToken: generateToken(user._id) });
    }
  },
  async googleLoginApi(req, res, next) {
    const { token } = req.body;
    try {
      const ticket = await axios({
        method: "GET",
        url:
          "https://www.googleapis.com/oauth2/v3/userinfo?access_token=" + token,
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "x-rapidapi-host": "astrology-horoscope.p.rapidapi.com",
          "x-rapidapi-key": "yourapikey",
        },
      });
      return res.status(200).json({ user: ticket.data });
    } catch (error) {
      return next(error); // Token is invalid
    }
  },
  async sendResetEmail(req, res, next) {
    sgMail.setApiKey(SENDGRID_API_KEY);

    var validateEmail = Joi.object({
      email: Joi.string().required(),
    });
    const { error } = validateEmail.validate(req.body);
    if (error) {
      next(error);
    }
    const { email } = req.body;
    let resetToken;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        let data = {
          message: "User does not exist",
          status: 404,
        };
        return next(data);
      }

      let token = await Token.findOne({ userId: user._id });
      if (token) {
        await token.deleteOne();
      }

      resetToken = crypto.randomBytes(3).toString("hex");
      // const hash = await bcrypt.hash(resetToken, 10);
      const tokenData = await new Token({
        userId: user._id,
        token: resetToken.toUpperCase(),
        createdAt: Date.now(),
      });

      tokenData.save();
    } catch (err) {
      return next(error);
    }
    const msg = {
      to: email,
      from: {
        name: "Reset code",
        email: SENDER_EMAIL,
      },
      subject: "Password Reset",
      html: `
      <p>Reset your password code:<strong style="text-transform: uppercase">${resetToken}</strong></p>`,
    };

    try {
      await sgMail.send(msg);
      return res.status(200).json({ sent: "Reset email sent" });
    } catch (error) {
      return next(error);
    }
  },
  async verifyToken(req, res, next) {
    var validateToken = Joi.object({
      token: Joi.string().required(),
    });
    const { error } = validateToken.validate(req.body);
    if (error) {
      next(error);
    }
    const { token } = req.body;

    try {
      let passwordResetToken = await Token.findOne({ token });
      if (!passwordResetToken) {
        const data = {
          message: "Invalid or expired password reset token",
          status: 404,
        };
        return next(data);
      }
      return res.status(200).json({ message: "Token verified" });
    } catch (error) {
      return next(error);
    }
  },
  async resetPassword(req, res, next) {
    var validateData = Joi.object({
      password: Joi.string().required(),
      token: Joi.string().required(),
    });
    const { error } = validateData.validate(req.body);
    if (error) {
      next(error);
    }
    const { token, password } = req.body;
    try {
      let passwordResetToken = await Token.findOne({ token });
      if (!passwordResetToken) {
        const data = {
          message: "Invalid or expired password reset token",
          status: 404,
        };
        return next(data);
      }
      const hasPassword = await bcrypt.hash(password, 10);
      await User.updateOne(
        { _id: passwordResetToken?.userId },
        { $set: { password: hasPassword } },
        { new: true }
      );

      await passwordResetToken.deleteOne();
      return res.status(200).json({ message: "Password Reset Successfully" });
    } catch (err) {
      return next(err);
    }
  },
};
module.exports = UserController;
