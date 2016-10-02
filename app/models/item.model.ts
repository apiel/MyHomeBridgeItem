var fs = require('fs'); // look for typescript solution
var path = require('path'); // look for typescript solution
import { Item } from './item';

export class ItemModel{
    filePath: string = "/../data/items.json";
    
    items: Item[];
    
    constructor() {
        this.filePath = path.dirname(require.main.filename) + this.filePath;
        this.load();
    }
    
    all(): Item[] {
        return this.items;
    }
    
    get(id: string): Item {
        let item: Item = this.items[id];
         if (!item) {
            throw "Unknown item key";
        }        
        return item;
    }
    
    load() {
        console.log("Load items.");
        if (fs.existsSync(this.filePath)) {
            this.items = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
        }
        else {
            throw 'Path to data model folder does not exist: ' + this.filePath;
        }        
    }
    
    save() {
        console.log("Save items.");
        fs.writeFileSync(this.filePath, JSON.stringify(this.items, null, 4), 'utf8');
    }
}