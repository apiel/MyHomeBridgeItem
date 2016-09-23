import restify = require('restify');
import { ItemService } from './../services/item.service';
import { Item } from './../models/item';

export default class ItemController {
    constructor(private itemService: ItemService) {}
        
    status(req: restify.Request, res: restify.Response, next: restify.Next) {
        let id = req.params['id'];
        
        this.itemService.getStatus(id)
            .map(data => res.json(200, {status: data}))
            .subscribe();
        
        return next();
    }     
    
    setStatus(req: restify.Request, res: restify.Response, next: restify.Next) {
        let id = req.params['id'];
        let status = req.params['status'];
        try {
            let item: Item = this.itemService.setStatus(id, status);            
            res.json(200, {status: item.status});
        }
        catch(e) {
            res.json(200, {error: e});
        }
        return next();
    } 
}
