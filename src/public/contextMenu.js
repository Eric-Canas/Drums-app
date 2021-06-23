
class Context {
    constructor(menuID, assingMenuID, assignSoundID, canvasID, canvasScreenPercentage = 0.9) {
        // -------------------- INITIALIZE ELEMENTS -----------------------
        this.menu = document.getElementById(menuID);
        this.assignMenu = document.getElementById(assingMenuID);
        this.assignSoundMenu = document.getElementById(assignSoundID);
        this.canvas = document.getElementById(canvasID);
        this.canvasContext = this.canvas.getContext("2d");

        // ---------------- INITIALIZE CANVAS LISTENERS -------------------
        this.canvas.oncontextmenu = this._on_canvas_right_click.bind(this);
        this.canvas.onmousedown = this._on_canvas_mouse_down.bind(this);
        this.canvas.onmousemove = this._on_canvas_mouse_move.bind(this);
        this.canvas.onmouseup = this._on_canvas_mouse_up.bind(this);
        this.assignSoundMenu.onmouseleave = this._on_assign_sound_mouse_out.bind(this)
        document.onclick = this._on_document_left_click.bind(this);
        
        window.onresize = this.set_canvas_width_height.bind(this);
        
        // ---------------  INITIALIZE INTERNAL VARIABLES ----------------
        this.canvasScreenPercentage = canvasScreenPercentage
        this.available_objects = []
        this.placedObjects = []
        this.keepAspectRatio = true;
        this.draggingElement = null;
        this.resizingPlace = null;
        this.objectWasMoved = false;
        this.prevent_next_click = false;
        this.last_element_under_mouse = null;
        this.fill_menu();
        this.fill_assign_menu();
        
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
        if(!this.prevent_next_click){
            const [elementUnderMouse, idx] = this.objectUnderMouse(event);
            if (elementUnderMouse !== null){
                this.close();
                this.open(event, this.assignMenu)
            } else if(!this._isVisible()){
                this.open(event, this.menu);
            } else if (event.target == this.canvas || event.target.tagName == 'BODY'){
                this.close();
            }
        }else{
            this.prevent_next_click = false;
        }
    }

    _on_canvas_mouse_down(event){
        /* Decide if user wants to drag an existent object or not. */
        const [elementUnderMouse, idx] = this.objectUnderMouse(event);
        this.last_element_under_mouse = elementUnderMouse;
        if (elementUnderMouse !== null){
            this.placedObjects.splice(idx, 1);
            const [x, y] = this.toCanvasXY(event);
            this.draggingElement = elementUnderMouse;
            this.draggingElement["x_click_offset"] = x-(elementUnderMouse["x"]*this.canvas.width);
            this.draggingElement["y_click_offset"] = y-(elementUnderMouse["y"]*this.canvas.height);
            this.resizingPlace = this.isMouseAtObjectCorner(event, elementUnderMouse)
            this.objectWasMoved = false;
        }
    }

    _on_assign_sound_mouse_out(event){
        if(event.toElement.id !== assignSoundButtonID){
            this.assignSoundMenuClose();
        }
    }

    _on_canvas_right_click(event){
        /* Check which menu needs to be open and opens it */
        this.close();
        const [objectUnderMouse, idx] = this.objectUnderMouse(event);   
        if (objectUnderMouse === null){
            this.open(event, this.menu);
        } else {
            this.open(event, this.assignMenu);
        }
        event.preventDefault();
    }

    _isVisible(menu){
        /* Returns if the menu is visible right now or not */
        return (this.menu.style.display !== 'none' && this.menu.style.display !== '') || (this.assignMenu.style.display !== 'none' && this.assignMenu.style.display !== '');
    }


    open(event, menu) {
        /* Opens the menu in the right place for avoiding to overflow the canvas */
        if (event.y < window.innerHeight / 2) {
            menu.style.bottom = "auto";
            menu.style.top = `${event.y}px`;
        } else {
            menu.style.top = "auto";
            menu.style.bottom = `${window.innerHeight - event.y}px`;
        }

        if (event.x < window.innerWidth / 2) {
            menu.style.right = "auto";
            menu.style.left = `${event.x}px`;
        } else {
            menu.style.left = "auto";
            menu.style.right = `${window.innerWidth - event.x}px`;
        }
        menu.style.display = "block";
    }

    fill_menu(){
        /* Fills the initial empty menu with the objects at the iconCorrespondences array */
        for (const [i, entry] of Object.entries(iconCorrespondeces)){
            const imgElement = document.createElement("img");
            const img_name = entry["img_name"];
            imgElement.src = `resources/${entry["img_name"]}`;
            imgElement.onmousedown = ((event) => this._on_menu_img_mouse_down(event, i)).bind(this);
            this.menu.appendChild(imgElement);
            this.available_objects.push({"img_name" : img_name, "img_element" : imgElement, "sounds" : entry["sounds"], "selected_sound" : entry["default_sound"]});
        }
    }

    fill_assign_menu(){
        /* Fills the initial empty menu with the objects at the iconCorrespondences array */
        for (const [option, callbacks] of Object.entries(assignOptions)){
            let menuElement = document.createElement("div");
            menuElement.className = "menuElement";
            menuElement.textContent = option
            //Bind to this context for accessing to its this variables
            menuElement.onclick = ((event) => {callbacks["onclick"].call(this, event); 
                                              this.drawCanvas(); 
                                              this.prevent_next_click=true;}).bind(this);
            if ( "onmouseenter" in callbacks){
                menuElement.onmouseenter = ((event) => callbacks["onmouseenter"].call(this, event)).bind(this);
            }
            if ("onmouseout" in callbacks){
                menuElement.onmouseout = ((event) => callbacks["onmouseout"].call(this, event)).bind(this);
            }
            if ("assignID" in callbacks){
                menuElement.id = callbacks["assignID"]
            }
            this.assignMenu.appendChild(menuElement);
        }
    }

    fill_assign_sound_menu(){
        let menuElement, soundText, playButton, playLogo, tick;
        for (const sound of this.last_element_under_mouse["sounds"]){
            menuElement = document.createElement("div");
            menuElement.classList.add("menuElement", "sound", "selectable-sound");
            menuElement.title = sound;
            soundText = document.createElement("span");
            soundText.classList.add("menuElement", "sound", "selectable-sound");
            soundText.textContent = sound;
            soundText.title = sound;
            tick = document.createElement("span");
            tick.classList.add("tick-mark", "selectable-sound");
            tick.title = sound;
            console.log(this.last_element_under_mouse)
            if (this.last_element_under_mouse["selected_sound"] === sound){
                tick.classList.add("checked");
            }
            //assign class checkmark to tick

            playLogo = document.createElement("i");
            playLogo.classList.add("fa", "fa-play", "fa-2x")
            playButton = document.createElement("a");
            playButton.className = 'round-button'
            playButton.href = "#";
            playButton.appendChild(playLogo);
            //Bind to this context for accessing to its this variables
            playButton.onclick = ((event) => {reproduceSound(sound)}).bind(this);
            menuElement.onclick = ((event) => {if(event.target.classList.contains("selectable-sound")) this.select_sound(sound);}).bind(this);
            menuElement.appendChild(playButton);
            menuElement.appendChild(soundText);
            menuElement.appendChild(tick);
            this.assignSoundMenu.appendChild(menuElement);
        }
        menuElement = document.createElement("div");
        menuElement.className = "menuElement";
        menuElement.textContent = "Upload Sound"
        //Bind to this context for accessing to its this variables
        menuElement.onclick = ((event) => {console.log("Assign Sound Click (FILL IT)");}).bind(this);
        this.assignSoundMenu.appendChild(menuElement);
    }

    select_sound(sound){
        for (const element of document.getElementsByClassName("tick-mark")){
            if (element.title === sound){
                element.classList.add("checked");
                this.placedObjects[this.placedObjects.length-1]["selected_sound"] = sound;
                this.last_element_under_mouse["selected_sound"] = sound;
            } else{
                element.classList.remove("checked");
            }
        }
    }

    assignSoundMenuClose(){
        while (this.assignSoundMenu.lastElementChild) {
            this.assignSoundMenu.removeChild(this.assignSoundMenu.lastElementChild);
        }
        this.assignSoundMenu.style.display = "none"
    }

    openAssignSoundMenu(){
        this.fill_assign_sound_menu();
        const current_assign_menu_dim = this.assignMenu.getBoundingClientRect();
        this.assignSoundMenu.style.display = "block";
        this.assignSoundMenu.style.marginLeft = (current_assign_menu_dim.right-this.canvas.offsetLeft)+'px';
        this.assignSoundMenu.style.marginTop = current_assign_menu_dim.y+'px';
    }
    
    close() {
        this.menu.style.display = "none";
        this.assignMenu.style.display = "none"
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
        this.prevent_next_click = true;
        this.last_element_under_mouse = this.draggingElement
        
    }

    _on_canvas_mouse_move(event){
        /* Move the dragging element (if any element is being drag) */
        if(this.draggingElement !== null){
            this.close();
            this.objectWasMoved = true;
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
                                     "img_element" : this.draggingElement["img_element"], "img_name" : this.draggingElement["img_name"], "sounds" : this.draggingElement["sounds"],
                                    "selected_sound" : this.draggingElement["selected_sound"]});
            //------- ERASE IT FROM THE INTERNAL VARIABLES -------
            this.draggingElement = null;
            this.resizingPlace = null;
            if (this.objectWasMoved){
                this.prevent_next_click = true;
            }
        }
        this.objectWasMoved = false;
        this.drawCanvas();
    }

    imgWidthHeightFromPercentage(dimension_x=0.2, dimension_y=0.2){
        /*Maintain aspect ratio. Percentage is applied on the shorter axis of the canvas. Dimensions x and y always respond to a square with the size of the lower axis*/
        const canvas_min_dim = Math.min(this.canvas.height, this.canvas.width);
        return [dimension_x*canvas_min_dim, dimension_y*canvas_min_dim];
    }

    XYWidthHeightFromResizing(event, resizingPlace, draggingElement){
        /* TODO: AVOID OR SOLVE PROBLEM WITH X,Y negatives (mirroring) */
        const [mouseX, mouseY] = this.toCanvasXY(event);
        let x, y, width, height, x_new_dimension, y_new_dimension, increment, newWidth, newHeight, oldWidth, oldHeight; 
        const [dimension_x, dimension_y] = [draggingElement["dimension_x"], draggingElement["dimension_y"]];
        const canvas_min_dim = Math.min(this.canvas.height, this.canvas.width);
        [x, y] = [draggingElement.x*this.canvas.width, draggingElement.y*this.canvas.height];
        switch(resizingPlace){
            // ------------------ BOTTOM-RIGHT CORNER ---------------------
            case "se":
                [newWidth, newHeight] = [mouseX-x, mouseY-y];
                [oldWidth, oldHeight] = this.imgWidthHeightFromPercentage(dimension_x, dimension_y);
                if ((newWidth-oldWidth) > (newHeight - oldHeight)){
                    x_new_dimension = newWidth/canvas_min_dim;
                    increment = x_new_dimension/dimension_x;
                    y_new_dimension = dimension_y*increment;
                } else {
                    y_new_dimension = newHeight/canvas_min_dim;
                    increment = y_new_dimension/dimension_y;
                    x_new_dimension = dimension_x*increment;
                }
                [width, height] = this.imgWidthHeightFromPercentage(x_new_dimension, y_new_dimension);
                break;
            // ------------------- TOP-RIGHT CORNER ----------------------
            case "ne":
                [oldWidth, oldHeight] = this.imgWidthHeightFromPercentage(dimension_x, dimension_y);
                [newWidth, newHeight] = [mouseX-x, (y+oldHeight)-mouseY];
                if ((newWidth-oldWidth) > (newHeight - oldHeight)){
                    x_new_dimension = newWidth/canvas_min_dim;
                    increment = x_new_dimension/dimension_x;
                    y_new_dimension = dimension_y*increment;
                } else {
                    y_new_dimension = newHeight/canvas_min_dim;
                    increment = y_new_dimension/dimension_y;
                    x_new_dimension = dimension_x*increment;
                }
                y = ((draggingElement.y*this.canvas.height)-(y_new_dimension-dimension_y)*canvas_min_dim);
                [width, height] = this.imgWidthHeightFromPercentage(x_new_dimension, y_new_dimension);
                break;
            // ------------------ BOTTOM-LEFT CORNER -----------------------
            case "sw":
                [oldWidth, oldHeight] = this.imgWidthHeightFromPercentage(dimension_x, dimension_y);
                [newWidth, newHeight] = [(x-mouseX)+oldWidth, mouseY-y];
                if ((newWidth - oldWidth) > (newHeight - oldHeight)){
                    x_new_dimension = newWidth/canvas_min_dim;
                    increment = x_new_dimension/dimension_x;
                    y_new_dimension = dimension_y*increment;
                } else {
                    y_new_dimension = newHeight/canvas_min_dim;
                    increment = y_new_dimension/dimension_y;
                    x_new_dimension = dimension_x*increment;
                }
                x = (draggingElement.x*this.canvas.width)-((x_new_dimension-dimension_x)*canvas_min_dim);
                [width, height] = this.imgWidthHeightFromPercentage(x_new_dimension, y_new_dimension);
                
                break;
            // ------------------- TOP-LEFT CORNER -------------------------
            case "nw":
                [oldWidth, oldHeight] = this.imgWidthHeightFromPercentage(dimension_x, dimension_y);
                [newWidth, newHeight] = [(x-mouseX)+oldWidth, (y+oldHeight)-mouseY];
                if ((newWidth - oldWidth) > (newHeight - oldHeight)){
                    x_new_dimension = newWidth/canvas_min_dim;
                    increment = x_new_dimension/dimension_x;
                    y_new_dimension = dimension_y*increment;
                } else {
                    y_new_dimension = newHeight/canvas_min_dim;
                    increment = y_new_dimension/dimension_y;
                    x_new_dimension = dimension_x*increment;
                }
                x = (draggingElement.x*this.canvas.width)-((x_new_dimension-dimension_x)*canvas_min_dim);
                y = ((draggingElement.y*this.canvas.height)-(y_new_dimension-dimension_y)*canvas_min_dim);
                [width, height] = this.imgWidthHeightFromPercentage(x_new_dimension, y_new_dimension);
                
                break;
            // -------------------- RIGHT SIDE ----------------------------
            case "e":
                [height, width] = [dimension_y*canvas_min_dim, mouseX-x];
                break;
            // ------------------- BOTTOM SIDE ----------------------------
            case "s":
                [height, width] = [mouseY-y, dimension_x*canvas_min_dim];
                break;
            // -------------------- LEFT SIDE -----------------------------
            case "w":
                [height, width] = [dimension_y*canvas_min_dim, dimension_x*canvas_min_dim+(x-mouseX)];
                x = mouseX;
                break;
            // -------------------- TOP SIDE ------------------------------
            case "n":
                [height, width] = [dimension_y*canvas_min_dim+(y-mouseY), dimension_x*canvas_min_dim];
                y = mouseY;
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
    drawCanvas(){
        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCurrentObjects();
        this.canvasContext.fill();
    }
    drawCurrentObjects(){
        /*  Draws all the current placed objects in the canvas (fill() is not called. It should be called before)*/
        for (const element of this.placedObjects){
            const x = element.x*this.canvas.width;
            const y = element.y*this.canvas.height;
            const [width, height] = this.imgWidthHeightFromPercentage(element["dimension_x"], element["dimension_y"]);
            this.canvasContext.drawImage(element["img_element"], x, y, width, height);
        }
    }


}
