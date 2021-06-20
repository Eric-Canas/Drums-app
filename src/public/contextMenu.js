
class Context {
    constructor(menuID, canvasID, canvasScreenPercentage = 0.9) {
        // -------------------- INITIALIZE ELEMENTS -----------------------
        this.menu = document.getElementById(menuID);
        this.canvas = document.getElementById(canvasID);
        this.canvasContext = this.canvas.getContext("2d");
        // ---------------- INITIALIZE CANVAS LISTENERS -------------------
        this.canvas.oncontextmenu = this._on_canvas_right_click.bind(this);
        this.canvas.onmousedown = this._on_canvas_mouse_down.bind(this);
        this.canvas.onmousemove = this._on_canvas_mouse_move.bind(this);
        this.canvas.onmouseup = this._on_canvas_mouse_up.bind(this);

        document.addEventListener("click", this._on_document_left_click.bind(this), false);
        
        window.onresize = this.set_canvas_width_height.bind(this);
        
        // ---------------  INITIALIZE INTERNAL VARIABLES ----------------
        this.canvasScreenPercentage = canvasScreenPercentage
        this.available_objects = []
        this.placedObjects = []
        this.keepAspectRatio = true;
        this.draggingElement = null;
        this.resizingPlace = null;
        this.fill_menu();
        
        // ------------------------ SET THE CANVAS -----------------------
        this.set_canvas_width_height();
    }
    
    set_canvas_width_height(){
        /* Resize the canvas bitmap height and width keeping the drawn objects*/
        this.canvas.height = window.innerHeight*this.canvasScreenPercentage;
        this.canvas.width = window.innerWidth*this.canvasScreenPercentage;
        this.drawCurrentObjects()
        this.canvasContext.fill()
    }

    _on_document_left_click(event){
        
        if(!this._isVisible()){
            this.open(event);
        } else if (event.target == this.canvas || event.target.tagName == 'BODY'){
            this.close();
        }
    }

    _on_canvas_mouse_down(event){
        /* Decide if user wants to drag an existent object or not. */
        const [elementUnderMouse, idx] = this.objectUnderMouse(event);
        console.log(elementUnderMouse);
        if (elementUnderMouse !== null){
            this.placedObjects.splice(idx, 1);
            const [x, y] = this.toCanvasXY(event);
            this.draggingElement = elementUnderMouse;
            this.draggingElement["x_click_offset"] = x-(elementUnderMouse["x"]*this.canvas.width);
            this.draggingElement["y_click_offset"] = y-(elementUnderMouse["y"]*this.canvas.height);
            this.resizingPlace = this.isMouseAtObjectCorner(event, elementUnderMouse)
        }
    }

    _on_canvas_right_click(event){
        /* Check which menu needs to be open and opens it */
        this.open(event);
        event.preventDefault();
    }

    _isVisible(){
        /* Returns if the menu is visible right now or not */
        return this.menu.style.display !== 'none' && this.menu.style.display !== '' ;
    }


    open(event) {
        /* Opens the menu in the right place for avoiding to overflow the canvas */
        if (event.y < window.innerHeight / 2) {
            this.menu.style.bottom = "auto";
            this.menu.style.top = `${event.y}px`;
        } else {
            this.menu.style.top = "auto";
            this.menu.style.bottom = `${window.innerHeight - event.y}px`;
        }

        if (event.x < window.innerWidth / 2) {
            this.menu.style.right = "auto";
            this.menu.style.left = `${event.x}px`;
        } else {
            this.menu.style.left = "auto";
            this.menu.style.right = `${window.innerWidth - event.x}px`;
        }

        this.menu.style.display = "block";
    }

    fill_menu(){
        /* Fills the initial empty menu with the objects at the iconCorrespondences array */
        for (const [i, entry] of Object.entries(iconCorrespondeces)){
            const imgElement = document.createElement("img");
            const img_name = entry["img_name"];
            imgElement.src = `resources/${entry["img_name"]}`;
            imgElement.onmousedown = ((event) => this._on_menu_img_mouse_down(event, i)).bind(this);
            this.menu.appendChild(imgElement);
            this.available_objects.push({"img_name" : img_name, "img_element" : imgElement});
        }

    }
    
    close() {
        this.menu.style.display = "none";
    }

    _on_menu_img_mouse_down(event, idx, base_dimension = 0.2){
        /* On click in a menu element */
        this.close()
        const [x, y] = this.toCanvasXY(event);
        this.draggingElement = this.available_objects[idx]
        this.draggingElement["x"] = x/this.canvas.height;
        this.draggingElement["y"] = y/this.canvas.width;
        this.draggingElement["dimension_x"] = (this.draggingElement["img_element"].width/4)/Math.min(this.canvas.height, this.canvas.width);
        this.draggingElement["dimension_y"] = (this.draggingElement["img_element"].height/4)/Math.min(this.canvas.height, this.canvas.width);
        this.draggingElement["x_click_offset"] = 0;
        this.draggingElement["y_click_offset"] = 0;
        
    }

    _on_canvas_mouse_move(event){
        /* Move the dragging element (if any element is being drag) */
        if(this.draggingElement !== null){
            let [x, y , width, height] = [0, 0, 0, 0];
            if(this.resizingPlace !== null){
                [x, y, width, height] = this.XYWidthHeightFromResizing(event, this.resizingPlace, this.draggingElement);
            } else {
                [x, y] = this.toCanvasXY(event);
                [x, y] = [x-this.draggingElement["x_click_offset"], y-this.draggingElement["y_click_offset"]];
                [width, height] = this.imgWidthHeightFromPercentage(this.draggingElement["dimension_x"], this.draggingElement["dimension_y"]);
            }
            this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawCurrentObjects();
            this.canvasContext.drawImage(this.draggingElement["img_element"], x, y, width, height);
            this.canvasContext.fill();
        } else {
            const [underMouseObject, idx] = this.objectUnderMouse(event)
            if(underMouseObject !== null){
                const corner = this.isMouseAtObjectCorner(event, underMouseObject);
                if (corner === null){
                    this.canvas.style.cursor = 'all-scroll';
                } else {
                    this.canvas.style.cursor = `${corner}-resize`;
                }
            } else {
                this.canvas.style.cursor = 'default';
            }
        }
    }

    isMouseAtObjectCorner(event, objecToCheck, allowed_error = 15){
        const [x, y] = this.toCanvasXY(event);
        const [xBox, yBox] = [objecToCheck.x*this.canvas.width, objecToCheck.y*this.canvas.height];
        const [width, height] = this.imgWidthHeightFromPercentage(objecToCheck["dimension_x"], objecToCheck["dimension_y"]);
        // ------------------ TOP-LEFT CORNER ---------------------
        if (x-allowed_error < xBox && x+allowed_error > xBox &&
                 y-allowed_error < yBox && y+allowed_error > yBox){
            return "nw";
        // ------------------ TOP-RIGHT CORNER ---------------------
        } else if (x-allowed_error < xBox+width && x+allowed_error > xBox+width &&
                     y-allowed_error < yBox && y+allowed_error > yBox){
            return "ne"
        // ------------------ BOTTOM-LEFT CORNER ---------------------
        } else if (x-allowed_error < xBox && x+allowed_error > xBox &&
                y-allowed_error < yBox+height && y+allowed_error > yBox+height){
            return "sw"
        // ------------------ BOTTOM-RIGHT CORNER ---------------------
        } else if (x-allowed_error < xBox+width && x+allowed_error > xBox+width &&
            y-allowed_error < yBox+height && y+allowed_error > yBox+height){
            return "se"
        // ----------------------- LEFT SIDE --------------------------
        } else if(x-allowed_error < xBox && x+allowed_error > xBox){
            return "w"
        // ----------------------- RIGTH SIDE -------------------------
        } else if(x-allowed_error < xBox+width && x+allowed_error > xBox+width){
            return "e"
        // ------------------------ TOP SIDE --------------------------
        } else if(y-allowed_error < yBox && y+allowed_error > yBox){
            return "n"
        // ----------------------- BOTTOM SIDE ------------------------
        } else if(y-allowed_error < yBox+height && y+allowed_error > yBox+height){
            return "s"
        // -------------------------- CENTER --------------------------
        } else {
            return null;
        }
    }

    _on_canvas_mouse_up(event){
        if (this.draggingElement !== null){
            //----------- SAVE THE OBJECT ONCE PLACED -------------
            let [x, y] = this.toCanvasXY(event);
            [x, y] = [(x-this.draggingElement["x_click_offset"]), (y-this.draggingElement["y_click_offset"])];
            let dimension_x = this.draggingElement["dimension_x"];
            let dimension_y = this.draggingElement["dimension_y"];
            if(this.resizingPlace !== null){
                let width, height;
                [x, y, width, height] = this.XYWidthHeightFromResizing(event, this.resizingPlace, this.draggingElement);
                dimension_x = width/Math.min(this.canvas.height, this.canvas.width);
                dimension_y = height/Math.min(this.canvas.height, this.canvas.width);
            }

            const xPercentage = x/this.canvas.width;
            const yPercentage = y/this.canvas.height;
            this.placedObjects.push({"x" : xPercentage, "y" : yPercentage, "dimension_x" : dimension_x, "dimension_y" : dimension_y,                                     
                                     "img_element" : this.draggingElement["img_element"], "img_name" : this.draggingElement["img_name"]});
            console.log({"x" : xPercentage, "y" : yPercentage, "dimension_x" : dimension_x, "dimension_y" : dimension_y,                                     
            "img_element" : this.draggingElement["img_element"], "img_name" : this.draggingElement["img_name"]});                                     
            //------- ERASE IT FROM THE INTERNAL VARIABLES -------
            this.draggingElement = null;
            this.resizingPlace = null;
            this.menu.style.display = 'block' //prevent menu to re-apear
        }
    }

    imgWidthHeightFromPercentage(dimension_x=0.2, dimension_y=0.2){
        /*Maintain aspect ratio. Percentage is applied on the shorter axis of the canvas. Dimensions x and y always respond to a square with the size of the lower axis*/
        const canvas_min_dim = Math.min(this.canvas.height, this.canvas.width);
        return [dimension_x*canvas_min_dim, dimension_y*canvas_min_dim];
    }

    XYWidthHeightFromResizing(event, resizingPlace, draggingElement){
        /* TODO: AVOID OR SOLVE PROBLEM WITH X,Y negatives (mirroring) */
        const [mouseX, mouseY] = this.toCanvasXY(event);
        let x, y, width, height, x_new_dimension, y_new_dimension;
        switch(resizingPlace){
            case "se":
                const [dimension_x, dimension_y] = [draggingElement["dimension_x"], draggingElement["dimension_y"]];
                [x, y] = [draggingElement.x*this.canvas.width, draggingElement.y*this.canvas.height];
                const [newWidth, newHeight] = [mouseX-x, mouseY-y];
                const [oldWidth, oldHeight] = this.imgWidthHeightFromPercentage(dimension_x, dimension_y);
                const canvas_min_dim = Math.min(this.canvas.height, this.canvas.width);
                if ((newWidth-oldWidth) > (newHeight - oldHeight)){
                    x_new_dimension = newWidth/canvas_min_dim;
                    const increment = x_new_dimension/dimension_x;
                    y_new_dimension = dimension_y*increment;
                } else {
                    y_new_dimension = newHeight/canvas_min_dim;
                    const increment = y_new_dimension/dimension_y;
                    x_new_dimension = dimension_x*increment;
                }

                [width, height] = this.imgWidthHeightFromPercentage(x_new_dimension, y_new_dimension);
                break;
        }
        return [x, y, width, height];
    }

    toCanvasXY(event){
        /* Get X, Y position from event, transformed to canvas coordinates */
        return [event.clientX-this.canvas.offsetLeft, event.clientY-this.canvas.offsetTop]
    }

    objectUnderMouse(event){
        /* Returns the correspondent object under the mouse and its index. Or null if there is no object behind. */
        const [x, y] = this.toCanvasXY(event);
        for (const [i, element] of Object.entries(this.placedObjects)){
            const xBox = element.x*this.canvas.width;
            const yBox = element.y*this.canvas.height;
            const [widthBox, heightBox] = this.imgWidthHeightFromPercentage(element["dimension_x"], element["dimension_y"]);
            if(x > xBox && x <= xBox + widthBox && y > yBox && y <= yBox + heightBox){
                return [element, i];
            }
        }
        return [null, 0];
        
    }

    drawCurrentObjects(){
        /*  Draws all the current placed objects in the canvas (fill() is not called. It should be called before)*/
        for (const element of this.placedObjects){
            const x = element.x*this.canvas.width;
            const y = element.y*this.canvas.height;
            const [width, height] = this.imgWidthHeightFromPercentage(element["dimension_x"], element["dimension_y"])
            this.canvasContext.drawImage(element["img_element"], x, y, width, height);
        }
    }


}
