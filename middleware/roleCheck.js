const {responseData}=require("../utiles/index")
const checkRole = (requiredRoles) => {
  return (req, res, next) => {
    const userRoleId = req.user ? Number(req.user.role) : null;

    if (!userRoleId || (Array.isArray(requiredRoles) && !requiredRoles.includes(userRoleId))) {
      const response = responseData({
        success: false,
        message: "UnAuthorized",
        status: 403,
      });
      return res.status(403).json(response);
    }

    if (!Array.isArray(requiredRoles) && userRoleId !== requiredRoles) {
      const response = responseData({
        success: false,
        message: "UnAuthorized",
        status: 403,
      });
      return res.status(403).json(response);
    }

    next();
  };
};

module.exports = checkRole;