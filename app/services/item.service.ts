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
        
        if (item.type === "number") {
            this.setStatusOfTypeNumber(item, status);
        }
        else {
            this.setStatusOfTypeString(item, status);
        }
        this.itemModel.save();
        if (item.url) {
            this.requestUrl(item.url.replace(':value', item.status));            
        }
        else if (item.urls) {
            this.requestUrl(item.urls[item.status]);
        }         
        return item;
    }    
    
    requestUrl(url: string) {
        console.log('Call url: ' + url);
        request(url);
    }
    
    setStatusOfTypeNumber(item: Item, status: string): void {
        if (isNaN(Number(status))) {
            throw "Status is not a number.";
        }
        else {
            item.status = status;
        }        
    }
    
    setStatusOfTypeString(item: Item, status: string): void {
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
                observer.onNext(item.type === "number" ? Number(item.status) : item.status);
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