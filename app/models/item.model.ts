var fs = require('fs');
import { Item } from './item';

export class ItemModel{
    filePath: string = "./data/items.json";
    
    items: Item[];
    
    constructor() {
        this.load();
    }
    
    get(id: number): Item {
        return this.items[id] || null;
    }
    
    load() {
        console.log("Load items.");
        if (fs.existsSync(this.filePath)) {
            this.items = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
        }
        else {
            throw 'Path to memspace folder does not exist: ' + this.filePath;
        }        
    }
    
    save() {
        console.log("Save items.");
        fs.writeFileSync(this.filePath, JSON.stringify(this.items, null, 4), 'utf8');
    }
}