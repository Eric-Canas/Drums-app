async function onTemplateFinished(){
 save_template();
}

async function save_template(){
    await localforage.clear();
    for(const [idx, object] of context.placedObjects.entries()){
        await save_at_local_forage(idx, object);
    }
    window.location.replace("play.html");
}

async function charge_template(){
    let template_elements = [];
    for (key of await localforage.keys()){
        // If key is a number (just to avoid future cases where other things would be setted here)
        if (!isNaN(key)){
            let element = await localforage.getItem(key);
            const img = document.createElement('img');
            img.src = charge_src(element["img_src"]);
            element["img"] = img;
            element["audio"] = new Audio(charge_src(element["selected_sound_src"]));
            if (element["second_img"] !== null){
                console.log(element["second_img"])
                const second_img = document.createElement('img');
                second_img.src = charge_src(element["second_img"]);
                element["second_img"] = second_img;
            }
            template_elements.push(element);
        }
    }
    return template_elements;
}

function charge_src(src){
    //TODO: Manage it better
    if (typeof(src) === 'string'){
        return 'resources/'+src
    } else {
        return URL.createObjectURL(src)
    }
}

async function save_at_local_forage(name, object){
    let data_to_save = {"img_src" : object["img_name"], "selected_sound_src" : soundCorrespondences[object["selected_sound"]], "x" : object["x"],
                        "y" : object["y"], "dimension_x" : object["dimension_x"], "dimension_y" : object["dimension_y"], "second_img" : object["second_img"]};
    await localforage.setItem(`${name}`, data_to_save);
}