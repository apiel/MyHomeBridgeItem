import * as request from 'request';
import { ItemModel } from './../models/item.model';
import { Item } from './../models/item';
import { Observable, Observer } from 'rx';

export class ItemService{
    constructor(private itemModel: ItemModel) {}
    
    get(id: number): Item {
        let item: Item = this.itemModel.get(id);
         if (!item) {
            throw "Unknown item key";
        }
        return item;
    }
    
    toggle(item: Item): string {
        for(let urlKey in item.urls) {
            if (!item.status) {
                item.status = urlKey;
                break;
            }
            else if (item.status === urlKey) {
                item.status = null;
            }
        }
        if (!item.status) {
            item.status = Object.keys(item.urls)[0];
        }
        return item.status;
    }    
    
    setStatus(id: number, status: string): Item {
        let item: Item = this.get(id);

        if (item.urls[status]) {
            item.status = status;
        }
        else if (status === "toggle") {
            item.status = this.toggle(item);
        }
        else {
            throw "Status does not exist";
        }
        this.itemModel.save();
        request(item.urls[item.status]);                  
 
        return item;
    }    
    
    getStatus(id: number): Observable<any> {
        return Observable.create(observer => 
            this.getStatusObserver(observer, id));
    }
    
    getStatusObserver(observer: Observer<any>, id: number): void {
        try {
            let item: Item = this.get(id);            
            if (item.statusUrl) {
                this.getStatusObserverFromUrl(observer, item.statusUrl);
            }
            else {
                observer.onNext(item.status);
                observer.onCompleted();  
            }
        }
        catch(error) {
            observer.onError(error);
            observer.onCompleted();  
        }                  
    }
    
    getStatusObserverFromUrl(observer: Observer<any>, url: string): void {
        request(url, 
            function (error, response, body) {
                var data = JSON.parse(body); 
                if (data && data.status) {
                    observer.onNext(data.status);
                    observer.onCompleted();  
                }
                else {            
                    observer.onError(body);
                    observer.onCompleted();  
                }
            });        
    }
}