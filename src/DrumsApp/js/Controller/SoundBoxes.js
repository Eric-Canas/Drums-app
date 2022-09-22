import {isPointInRect} from '../Helpers/Utils.js'
import {SoundInterface} from '../Controller/SoundInterface.js'
import {MOST_RELEVANT_HANDS_OF_SEQUENCE, RELEVANT_MARKS} from '../Model/Constants.js'

class SoundBoxes{
    constructor(canvas){
        this.canvas = canvas;
        this.canvas_min_dim = Math.min(canvas.canvas.width, canvas.canvas.height);
        this.build();
    }

    async build() {
        await this.charge_boxes(); //from localForage
        this.SoundInterface = new SoundInterface(this.boxes);
        await setTimeout(this.drawState.bind(this), 500);

    }

    async charge_boxes(){
        this.boxes = await charge_template();
        for (let idx = 0; idx < this.boxes.length; idx++){
            this.boxes[idx]["pending_callbacks"] = 0
            this.boxes[idx]["hitted"] = false;
        }
        this.add_adapted_dimensions();
    }
    
    add_adapted_dimensions(){
        for (let idx = 0; idx < this.boxes.length; idx++){
            this.boxes[idx]["dimension_x_adapted"] = this.boxes[idx]["dimension_x"]*(this.canvas_min_dim/this.canvas.canvas.width);
            this.boxes[idx]["dimension_y_adapted"] = this.boxes[idx]["dimension_y"]*(this.canvas_min_dim/this.canvas.canvas.height);
        }
    }

    drawState(){
        this.canvas.clearCanvas();
        for(const box of this.boxes){
            const img = box["hitted"] && box["second_img"]? box["second_img"] : box["img"];
            this.canvas.drawImage(img, box["x"], box["y"], box["dimension_x"], box["dimension_y"]);
        }
        this.canvas.context.fill();

    }

    hitAt(x, y){
        //Returns the corresponding sound of the hitted box, or null otherwise
        for (const [idx, box] of Object.entries(this.boxes)){
            if (isPointInRect(x, y, [box["x"], box["y"], box["dimension_x_adapted"], box["dimension_y_adapted"]])){
                return idx;
            }
        }
        return null;
    }

    hittedSoundBox(hand_sequence){
        //Given a sequence array of a hand, checks if the hand entered on a box at any part of this sequence
        for (let hand of MOST_RELEVANT_HANDS_OF_SEQUENCE){
            hand = hand_sequence[hand];
            for (const [x, y] of RELEVANT_MARKS){
                const hitted_box = this.hitAt(hand[x], hand[y]);
                if (hitted_box !== null){
                    return hitted_box;
                }
            }
        }
        return null;
    }

    playIfHit(x, y){
        const hittedBoxIdx = this.hitAt(x, y);
        this.playSound(hittedBoxIdx)
    }

    playSound(hitted_box_index){
        if (hitted_box_index !== null){
            this.SoundInterface.playSound(hitted_box_index);
            this.mark_as_hitted(parseInt(hitted_box_index));
        }
    }

    mark_as_hitted(hitted_box_index, seconds = 0.4){
        this.boxes[hitted_box_index]["hitted"] = true;
        this.boxes[hitted_box_index]["pending_callbacks"]++;
        setTimeout(this.mark_as_non_hitted.bind(this, hitted_box_index), seconds*1000);
        this.drawState()
    }

    mark_as_non_hitted(hitted_box_index){
        this.boxes[hitted_box_index]["pending_callbacks"]--;
        if (this.boxes[hitted_box_index]["pending_callbacks"] === 0){
            this.boxes[hitted_box_index]["hitted"] = false;
            this.drawState();
        }
    }


}

export {SoundBoxes};