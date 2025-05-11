module.exports = {
    beforeRequest: (requestParams, context, ee, next) => {
      if (context.vars.jwt) {
        requestParams.headers = requestParams.headers || {};
        requestParams.headers.Authorization = context.vars.jwt;
      }
      return next();
    }
    
  };
  