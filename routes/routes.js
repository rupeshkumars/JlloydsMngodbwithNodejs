module.exports = function(apiRoutes) {


    var UserController = require('../controllers/UserController');


    apiRoutes.post('/validate_company_name', middleware.authenticateApi, UserController.ValidateCompanyName);
    apiRoutes.post('/list_of_users', middleware.authenticateApi, middleware.OnlyAccesByAdmin, UserController.listofcompanies);
    apiRoutes.post('/update_user', middleware.authenticateApi, middleware.OnlyAccesByAdmin, UserController.updateInformation);
    apiRoutes.post('/post_login', UserController.postlogin);
    apiRoutes.post('/user_registrations', UserController.userRegistrations);


};