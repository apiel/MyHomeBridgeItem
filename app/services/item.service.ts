import * as request from 'request';
import { ItemModel } from './../models/item.model';
import { Item } from './../models/item';
import { Observable, Observer } from 'rx';

export class ItemService{
    constructor(private itemModel: ItemModel) {}
        
    toggle(availableStatus: string[], status: string): string {
        for(let val of availableStatus) {
            if (!status) {
                status = val;
                break;
            }
            else if (status === val) {
                status = null;
            }
        }
        if (!status) {
            status = availableStatus[0];
        }
        return status;
    }    
    
    setStatus(id: string, status: string): Item {
        let item: Item = this.itemModel.get(id);
        
        let availableStatus: string[] = item.urls ? Object.keys(item.urls) : item.availableStatus;
        if (availableStatus.indexOf(status) > -1) {
            item.status = status;
        }
        else if (status === "toggle") {
            item.status = this.toggle(availableStatus, item.status);
        }
        else {
            throw "Status does not exist";
        }
        this.itemModel.save();
        if (item.urls) {
            request(item.urls[item.status]);                  
        }
 
        return item;
    }    
    
    getStatus(id: string): Observable<any> {
        return Observable.create(observer => 
            this.getStatusObserver(observer, id));
    }
    
    getStatusObserver(observer: Observer<any>, id: string): void {
        try {
            let item: Item = this.itemModel.get(id);            
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