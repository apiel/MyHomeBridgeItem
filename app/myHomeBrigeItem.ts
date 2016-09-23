//require('./decorators/restify.decorator.ts');
import restify = require('restify');
import ItemController from './controllers/item.controller';

import { ItemService } from './services/item.service';
import { ItemModel } from './models/item.model';

restify.CORS.ALLOW_HEADERS.push('authorization');

var server = restify.createServer();
server.use(restify.CORS());

let itemModel = new ItemModel();
let itemService = new ItemService(itemModel);
let itemController = new ItemController(itemService);
server.get('/item/:id/status', itemController.status.bind(itemController));
server.get('/item/:id/:status', itemController.setStatus.bind(itemController));

server.listen(3030, function() {
  console.log('%s listening at %s', server.name, server.url);
});