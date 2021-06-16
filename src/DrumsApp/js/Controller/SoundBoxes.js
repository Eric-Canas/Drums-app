import {isPointInRect} from '../Helpers/Utils.js'

class SoundBoxes{
    constructor(){
        //Keys are built as key --> sound name, value --> box
        //Boxes are structured as x, y, height, length
        this.boxes = {'hihat' : [0.5, 0.5, 0.5, 0.5]};
    }

    addBoxes(sound, box){
        this.boxes[sound] = box;
    }

    hitAt(x, y){
        //Returns the corresponding sound of the hitted box, or null otherwise
        for (const [sound, rect] of Object.entries(this.boxes)){
            if (isPointInRect(x, y, rect)){
                return sound;
            }
        }
        return null;
    }
    
}

export {SoundBoxes};