const responseData = ({ success, message, data, status }) => {
    const response = {
      success: success || false,
      message: message || "",
      data: data !== undefined ? data : {},
      status: status || 400,
    };
    return response;
  };
  
  module.exports = {
    responseData,
  };