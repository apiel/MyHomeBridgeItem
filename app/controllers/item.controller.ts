import restify = require('restify');
import { ItemService } from './../services/item.service';
import { Item } from './../models/item';

export default class ItemController {
    constructor(private itemService: ItemService) {}
        
    status(req: restify.Request, res: restify.Response, next: restify.Next) {
        let id = req.params['id'];
        
        this.itemService.getStatus(id)
            .subscribe(data => res.json(200, data));
        
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
    
    all(req: restify.Request, res: restify.Response, next: restify.Next) {
        try {
            let itemsStatus = [];
            this.itemService.all().subscribe(
                itemStatus => itemsStatus.push(itemStatus),
                null,
                () => res.json(200, itemsStatus)
            );            
        }
        catch(e) {
            res.json(200, {error: e});
        }
        return next();
    }     
}
