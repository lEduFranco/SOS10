const { Router } = require('express');

const Devcontroller = require('./controllers/DevController');
const SearchController = require('./controllers/SearchController');


const routes = Router();

routes.get('/devs', Devcontroller.index);
routes.post('/devs', Devcontroller.store);

routes.get('/search', SearchController.index);

module.exports = routes;