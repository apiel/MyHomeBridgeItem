import * as request from 'request';
import { exec } from 'child_process';
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
        else if (item.availableStatus) {
            let itemStatus = item.availableStatus[item.status];
            if (itemStatus.type === 'url') {
                this.requestUrl(itemStatus.value);
            }
            else if (itemStatus.type === 'exec') {
                exec(itemStatus.value);
            }
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
        let availableStatus: string[] = Object.keys(item.availableStatus);
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
    
    all(): Observable<any> {
        return Observable.create(observer => 
            this.allObserver(observer));        
    }
    
    allObserver(observer: Observer<any>) {
        let items: Item[] = this.itemModel.all();
        let itemsKeys = Object.keys(items);
        let waitingForStatus = itemsKeys.length;
        //observer.
        //let itemsStatus = [];
        //console.log(itemsKeys.length);
        for(let key of itemsKeys) {
            //console.log(key);
            this.getStatus(key).subscribe(function(status) {
                observer.onNext(status);
                waitingForStatus--;
                if (waitingForStatus < 1) {
                    observer.onCompleted();
                }
            });
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
                this.getStatusObserverFromUrl(observer, id, item.statusUrl);
            }
            else {
                let status = item.type === "number" ? Number(item.status) : item.status;
                observer.onNext({id: id, status: status});
                observer.onCompleted();  
            }
        }
        catch(error) {
            observer.onError({id: id, error: error});
            observer.onCompleted();  
        }                  
    }
    
    getStatusObserverFromUrl(observer: Observer<any>, id: string, url: string): void {
        request(url, 
            function (error, response, body) {
                var data = JSON.parse(body); 
                if (data && data.status) {
                    observer.onNext({id: id, status: data.status});
                    observer.onCompleted();  
                }
                else {            
                    observer.onError({id: id, error: body});
                    observer.onCompleted();  
                }
            });        
    }
}