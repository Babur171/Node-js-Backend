const User = require("../modal/User");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const UserDto = require("../dto/user");
const jwt = require("jsonwebtoken");
const Roles = require("../modal/Roles.js");
const { SENDGRID_KEY, SENDER_EMAIL_ADDRESS } = require("../config/constants");
const generateToken = require("../config/generateToken");
const axios = require("axios");
const Token = require("../modal/Token.js");
const crypto = require("crypto");
const { responseData } = require("../utiles");

const SENDGRID_API_KEY = SENDGRID_KEY;
const SENDER_EMAIL = SENDER_EMAIL_ADDRESS;

const UserController = {
  async register(req, res, next) {
    var validateUser = Joi.object({
      username: Joi.string().required(),
      email: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
      password: Joi.string().required(),
      gender: Joi.boolean().required(),
      role: Joi.string().required(),
    });
    const { error } = validateUser.validate(req.body);
    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      const response = responseData({
        success: false,
        message: errorMessage,
        status: 400,
      });
      return res.status(400).json(response);
    }
    const { username, email, password, gender, role } = req.body;
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
            role: role,
          });
          await user.save();
        } catch (error) {
          const response = responseData({
            success: false,
            message: error,
            status: 400,
          });
          return res.status(400).json(response);
        }
        const response = responseData({
          success: true,
          data: user,
          status: 201,
        });
        return res.status(201).json(response);
      } else {
        const response = responseData({
          success: false,
          message: "Email already exist",
          status: 209,
        });

        return res.status(209).json(response)
      }
    } catch (error) {
      
      const response = responseData({
        success: false,
        message: error,
        status: 400,
      });
      return res.status(400).json(response)
    }
  },

  async login(req, res, next) {
    var validateUser = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    });
    const { error } = validateUser.validate(req.body);
    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      const response = responseData({
        success: false,
        message: errorMessage,
        status: 400,
      });
      return res.status(400).json(response);
    }
    const { email, password } = req.body;

    let user;
    try {
      user = await User.findOne({ email: email });

      if (user) {
        let pass = await bcrypt.compare(password, user.password);

        if (pass) {
          const newUser = new UserDto(user);
          const response = responseData({
            success: true,
            status: 200,
            data:{ user: newUser, accessToken: generateToken(user._id)}
          });
          return res
            .status(200)
            .json(response);
        } else {
          const response = responseData({
            success: false,
            message:  "Invalid password",
            status: 401,
          });
          return res.status(400).json(response);
         
        }
      } else {
        const response = responseData({
          success: false,
          message: "Email not found",
          status: 401,
        });
        return res.status(400).json(response);
       
      }
    } catch (error) {
      const response = responseData({
        success: false,
        message: error,
        status: 400,
      });
      return res.status(400).json(response);
     
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

  async userRoles(req, res, next) {
    try {
      const roles = await Roles.find();
      const response = responseData({
        success: true,
        message: "",
        data:roles,
        status: 200,
      });
      return res.status(200).json(response);
    } catch (error) {
      const response = responseData({
        success: false,
        message:error,
        status: 400,
      });
      return res.status(400).json(response);
    }
  },

  async doctorsList(req, res, next) {
    try {
      const doctors = await User.find({role:704})
      const list=doctors.length ? doctors.map((item)=>({
        _id: item._id,
        username: item.username,
        gender: item.gender,
        role:item.role,
      })):[];
      const response = responseData({
        success: true,
        message: "",
        data:list,
        status: 200,
      });
      return res.status(200).json(response);
    } catch (error) {
      const response = responseData({
        success: false,
        message:error,
        status: 400,
      });
      return res.status(400).json(response);
    }
  },

  async addUserRoles(req, res, next) {
    var validateUser = Joi.object({
      name: Joi.string().required(),
    });

    const { error } = validateUser.validate(req.body);
    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      const response = responseData({
        success: false,
        message: errorMessage,
        status: 400,
      });
      return res.status(400).json(response);
    }

    const { name } = req.body;
    try {
      const roleExist = await Roles.exists({ name: name });
      if (!roleExist) {
        let role;
        try {
          role = new Roles({
            name: name,
          });
          await role.save();
        } catch (error) {
          const response = responseData({
            success: false,
            message: error,
            status: 400,
          });
          return res.status(400).json(response);
         
        }
        const response = responseData({
          success: true,
          data:role,
          status: 200,
        });
        return res.status(201).json(response);
      } else {
        const response = responseData({
          success: false,
          message: "Role already exist",
          status: 209,
        });
        return res.status(209).json(response);
       
      }
    } catch (err) {
      const response = responseData({
        success: false,
        message: err,
        status: 400,
      });
      return res.status(400).json(response);
    }
  },
};
module.exports = UserController;
