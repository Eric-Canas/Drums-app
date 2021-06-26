
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
        this.update_menu();
        this.fill_assign_menu();
        
        // ------------------------ SET THE CANVAS -----------------------
        this.set_canvas_width_height();
    }
    
    set_canvas_width_height(){
        /* Resize the canvas bitmap height and width keeping the drawn objects*/
        this.canvas.height = window.innerHeight*this.canvasScreenPercentage;
        this.canvas.width = window.innerWidth*this.canvasScreenPercentage;
        // Draw the objects that were there
        this.drawCurrentObjects(); 
        this.canvasContext.fill()
    }
    // --------------------------------------------------------- EVENT HANDLERS ---------------------------------------------------------
    _on_document_left_click(event){
        // Prevent those cases when click must be prevent (for example, after dragging)
        if(!this.prevent_next_click){
            const [elementUnderMouse, idx] = this.objectUnderMouse(event);
            // If the click is over an object, open the object menu.
            if (elementUnderMouse !== null){
                this.close();
                this.open(event, this.assignMenu)
            // If no menu is opened, open it
            } else if(!this._isVisible()){
                this.open(event, this.menu);
            // Otherwise, if any menu was open and click is on an empty part of the canvas, close it.
            } else if (event.target == this.canvas || event.target.tagName == 'BODY'){
                this.close();
            }
        }
        // Disable the next click prevention
        this.prevent_next_click = false;
    }

    _on_canvas_right_click(event){
        /* Check which menu needs to be open and opens it */
        // Close any previous menu 
        this.close();
        const [objectUnderMouse, idx] = this.objectUnderMouse(event);   
        // Opens one or another menu depending on what is behind the click (empty part of the canvas or an object).
        if (objectUnderMouse === null){
            this.open(event, this.menu);
        } else {
            this.open(event, this.assignMenu);
        }
        // On the canvas, prevent the default context menu
        event.preventDefault();
    }

    _on_canvas_mouse_down(event){
        /* Decide if user wants to drag an existent object or not. */
        const [elementUnderMouse, idx] = this.objectUnderMouse(event);
        // Set the last element under mouse to the actual element or null.
        this.last_element_under_mouse = elementUnderMouse;
        // If no object is under the mouse ignore the event. Otherwhise...
        if (elementUnderMouse !== null){
            // Delete this element from the placed elements array
            this.placedObjects.splice(idx, 1);
            // Get the actual X, Y positions of the mouse
            const [x, y] = this.toCanvasXY(event);
            // Set the actual dragging element to this one.
            this.draggingElement = elementUnderMouse;
            // Set the movement offsets for a natural dragging
            this.draggingElement["x_click_offset"] = x-(elementUnderMouse["x"]*this.canvas.width);
            this.draggingElement["y_click_offset"] = y-(elementUnderMouse["y"]*this.canvas.height);
            // Decide if it is selected for dragging or for resizing
            this.resizingPlace = this.isMouseAtObjectCorner(event, elementUnderMouse)
            // It has been not moved yet
            this.objectWasMoved = false;
        }
    }

    _on_canvas_mouse_move(event){
        /* Move the dragging element (if any element is being drag) */
        if(this.draggingElement !== null){
            // Close any menu that could be actually opened.
            if (this._isVisible()) this.close();
            // Set that some object has been moved, in order to prevent future click events
            this.objectWasMoved = true;

            let x, y , width, height;
            // If the mouse movement is for resizing, transform the coordinates
            if(this.resizingPlace !== null){
                [x, y, width, height] = this.XYWidthHeightFromResizing(event, this.resizingPlace, this.draggingElement);
            // If the movement is for dragging, set the new coordinates;
            } else {
                [x, y] = this.toCanvasXY(event);
                [x, y] = [x-this.draggingElement["x_click_offset"], y-this.draggingElement["y_click_offset"]];
                [width, height] = this.imgWidthHeightFromPercentage(this.draggingElement["dimension_x"], this.draggingElement["dimension_y"]);
            }
            // Update the canvas
            this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawCurrentObjects();
            this.canvasContext.drawImage(this.draggingElement["img_element"], x, y, width, height);
            this.canvasContext.fill();
        
        // Otherwhise, set the pointers to indicate what can be done.
        } else {
            const [underMouseObject, _ ] = this.objectUnderMouse(event);
            if(underMouseObject !== null){
                const corner = this.isMouseAtObjectCorner(event, underMouseObject);
                // If pointer is at the center of an image use all-scroll pointer, if it is at a corner use the correct corner pointer
                this.canvas.style.cursor = corner === null? 'all-scroll' : `${corner}-resize`;
            // If it is in an empty place use the default pointer
            } else {
                this.canvas.style.cursor = 'default';
            }
        }
    }

    _on_canvas_mouse_up(event){
        /* Once the drag the resize or a click is finished */
        // If last click was over an object
        if (this.draggingElement !== null){
            //----------- SAVE THE OBJECT ONCE PLACED -------------
            let x, y;
            // Determine all its new coordinates if ressized
            if(this.resizingPlace !== null){
                let width, height;
                [x, y, width, height] = this.XYWidthHeightFromResizing(event, this.resizingPlace, this.draggingElement);
                this.draggingElement["dimension_x"] = width/Math.min(this.canvas.height, this.canvas.width);
                this.draggingElement["dimension_y"] = height/Math.min(this.canvas.height, this.canvas.width);
            // Or its new X, Y coordinates if dragged 
            } else {
                [x, y] = this.toCanvasXY(event);
                [x, y] = [(x-this.draggingElement["x_click_offset"]), (y-this.draggingElement["y_click_offset"])];
            }
            // Transform the x,y coordinates to a percentage
            const xPercentage = x/this.canvas.width;
            const yPercentage = y/this.canvas.height;
            delete this.draggingElement["x_click_offset"]; delete this.draggingElement["y_click_offset"];
            console.log("Dragging ELement", this.draggingElement);
            console.log("Previous Placed Objects", this.placedObjects);
            this.placedObjects.push({...this.draggingElement, "x" : xPercentage, "y" : yPercentage});
            console.log("Placed Object", this.placedObjects);
            //------- ERASE IT FROM THE INTERNAL VARIABLES -------
            this.draggingElement = null;
            this.resizingPlace = null;
            // After dragging avoid any mouse click event.
            if (this.objectWasMoved) this.prevent_next_click = true;
        }
        // Disable object moved flag and re-draw the situation
        this.objectWasMoved = false;
        this.drawCanvas();
    }

    // ------------------------------------------------------ MENU CONSISTENCY ---------------------------------------------------------

    open(event, menu) {
        /* Opens the menu in the correc place for avoiding to overflow the canvas */
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

    openAssignSoundMenu(){
        /* Opens the dropdown sound menu */
        this.fill_assign_sound_menu();
        const current_assign_menu_dim = this.assignMenu.getBoundingClientRect();
        this.assignSoundMenu.style.display = "block";
        this.assignSoundMenu.style.marginLeft = (current_assign_menu_dim.right-this.canvas.offsetLeft)+'px';
        this.assignSoundMenu.style.marginTop = current_assign_menu_dim.y+'px';
    }

    close() {
        /* Hide both menus */
        this.menu.style.display = "none";
        this.assignMenu.style.display = "none"
    }

    _isVisible(menu){
        /* Returns if the menu is visible right now or not */
        return (this.menu.style.display !== 'none' && this.menu.style.display !== '') || (this.assignMenu.style.display !== 'none' && this.assignMenu.style.display !== '');
    }

    // ------------------------------------------------------ MENU FULLFILMENT -------------------------------------------------------

    update_menu(){
        /* Fills the images menu  with its actual content */
        let imgElement;
        // Remove previous content
        this.removeMenuContent(this.menu);
        // Empty the array of objects that are actually visible in that menu
        this.available_objects = [];
        // Fills the empty menu with the objects at the iconCorrespondences array
        for (const [i, entry] of Object.entries(iconCorrespondeces)){
            const img_name = entry["img_name"];
            // If the element actually have an imgElement (for example, when it has been imported) associated use it
            if ("img_element" in entry){
                imgElement = entry["img_element"];
            // Otherwise, create it
            } else {
                imgElement = document.createElement("img");
                imgElement.src = `resources/${img_name}`;
            }
            // Add the on_mouse_down event to it. For extracting the corresponding image from each one
            imgElement.onmousedown = ((event) => this._on_menu_img_mouse_down(event, i)).bind(this);
            // Adds its content to the array of available objects for accessing to it later
            this.available_objects.push({"img_name" : img_name, "img_element" : imgElement, "sounds" : entry["sounds"],
                                         "selected_sound" : entry["default_sound"]});
            // Finally, append the element to the menu
            this.menu.appendChild(imgElement);

        }
        // The last element of the menu will always be the Upload Image element
        let menuElement = document.createElement("div");
        menuElement.className = "menuElement";
        menuElement.textContent = "Upload Image";
        menuElement.style.width = "auto";
        // On click, upload the image to the menu
        menuElement.onclick = this.uploadImage.bind(this);
        this.menu.appendChild(menuElement);
    }

    fill_assign_menu(){
        /* Fills the initial empty menu with the objects at the iconCorrespondences array */
        for (const option of assignOptions){
            let menuElement = document.createElement("div");
            menuElement.className = "menuElement";
            menuElement.textContent = option["name"];
            // Assign the corresponding ID if determined 
            if ("assignID" in option) menuElement.id = option["assignID"];
            // Attach all the event listener for each option
            for (const [event, callback] of Object.entries(option["events"])){
                console.log(event, callback);
                menuElement.addEventListener(event, ((event) => callback.call(this, event)).bind(this));
            }
            // Attach the element to the menu
            this.assignMenu.appendChild(menuElement);
        }
    }

    fill_assign_sound_menu(){
        /* Fills the menu for assigning a sound to an element */
        let menuElement, soundText, playButton, playLogo, tick;
        // For each possible sound of the selected object
        for (const sound of this.last_element_under_mouse["sounds"]){
            // Create the parent element
            menuElement = document.createElement("div");
            // Create the children spans
            soundText = document.createElement("span");
            tick = document.createElement("span");
            // Create the children Play button
            playButton = document.createElement("a");
            playLogo = document.createElement("i");
            // Assign all titles ands content
            menuElement.title = soundText.title = tick.title = sound;
            soundText.textContent = sound;
            
            // Assign classes
            menuElement.classList.add("menuElement", "sound", "selectable-sound");
            soundText.classList.add("menuElement", "sound", "selectable-sound");
            tick.classList.add("tick-mark", "selectable-sound");
            playLogo.classList.add("fa", "fa-play", "fa-2x")
            playButton.className = 'round-button'
            
            //Assign the onclick events. Both for reproducing the sound and for assigning it to the current element
            playButton.onclick = ((event) => {reproduceSound(sound)}).bind(this);
            menuElement.onclick = ((event) => {if(event.target.classList.contains("selectable-sound")) this.select_sound(sound);}).bind(this);

            // Append the logo to the play button
            playButton.appendChild(playLogo);
            // Append all sub-elements to the parent div
            menuElement.appendChild(playButton);
            menuElement.appendChild(soundText);
            menuElement.appendChild(tick);
            // Append them to parent element
            this.assignSoundMenu.appendChild(menuElement);
        }
        // Activate the tick element of the selected sound
        this.select_sound(this.last_element_under_mouse["selected_sound"])
        
        // Finally, create the Upload Sound element
        menuElement = document.createElement("div");
        menuElement.className = "menuElement";
        menuElement.textContent = "Upload Sound"
        // Add the upload audio event on click
        menuElement.onclick = this.uploadAudio.bind(this);
        // Append it to the main menu
        this.assignSoundMenu.appendChild(menuElement);
    }

    // -------------------------------------------------------- MENU UTILS -------------------------------------------------------------

    removeMenuContent(menu){
        /* Removes the content of the given menu */
        while (menu.lastElementChild) {
            menu.removeChild(menu.lastElementChild);
        }
        // Hide it
        menu.style.display = "none"
    }

    select_sound(sound){
        /* Select the corresponding sound and attach it to its element */
        //For each element of the sound menu that can be checked
        for (const element of document.getElementsByClassName("tick-mark")){
            // If it is the element checked
            if (element.title === sound){
                // Activate the check div
                element.classList.add("checked");
                // Assign that sound to it correspondent element (by the program logic it always will be the last element checked)
                this.placedObjects[this.placedObjects.length-1]["selected_sound"] = sound;
                this.last_element_under_mouse["selected_sound"] = sound;
            // Otherwise, ensure it is unchecked
            } else {
                element.classList.remove("checked");
            }
        }
    }

    uploadImage(event){
        /* Allows the user to upload an image and places it on the canvas */
        // Simulate a click on the <input type="file" class="uploader"> element
        const inputElement = document.getElementById('uploader');
        inputElement.accept = acceptedImgTypes;
        inputElement.click();
        
        // Attach the logic to the onchange method, for executing it when the user selects a file
        inputElement.onchange = (() => {addImgToOptions(inputElement.files[0],
                                        // The logic for placing the object is called when the onload of the <img> element triggers
                                        (() => {this._on_menu_img_mouse_down(event, this.available_objects.length-1);
                                               this._on_canvas_mouse_up(event);}).bind(this));
                                        this.update_menu();}).bind(this);
    }
    
    uploadAudio(){
        /* Allows the user to upload an audio, and attaches it to the current element */
        // Simulate a click on the <input type="file" class="uploader"> element
        const inputElement = document.getElementById('uploader');
        inputElement.accept = acceptedAudio;
        inputElement.click()

        // Attach the logic to the onchange method, for executing it when the user selects a file
        inputElement.onchange = (() => {const filename =  inputElement.files[0].name.substring(0, inputElement.files[0].name.length-".mp3".length)
                                        addMp3(filename, URL.createObjectURL(inputElement.files[0]));
                                        addSoundToImgName(this.last_element_under_mouse["img_name"], filename);
                                        this.placedObjects[this.placedObjects.length-1]["selected_sound"] = filename;
                                        }).bind(this);
    }

    _on_assign_sound_mouse_out(event){
        if(event.toElement.id !== assignSoundButtonID){
            this.removeMenuContent(this.assignSoundMenu);
        }
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
