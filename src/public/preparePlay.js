async function onTemplateFinished(){
 save_template();
}

async function save_template(){
    await localforage.clear();
    for(const [idx, object] of context.placedObjects.entries()){
        await save_at_local_forage(idx, object);
    }
    window.location.replace("../index.html");
    console.log(await charge_template());
}

async function charge_template(){
    // TODO: Adapt it for allowing also the original sounds, not only user uploaded 
    let template_elements = [];
    for (key of await localforage.keys()){
        // If key is a number (just to avoid future cases where other things would be setted here)
        if (!isNaN(key)){
            let element = await localforage.getItem(key);
            const img = document.createElement('img');
            img.src = URL.createObjectURL(element["img_src"]);
            element["img"] = img;
            element["audio"] = new Audio(URL.createObjectURL(element["selected_sound_src"]));
            template_elements.push(element);
        }
    }
    return template_elements;
}

async function save_at_local_forage(name, object){
    let data_to_save = {"img_src" : object["img_name"], "selected_sound_src" : soundCorrespondences[object["selected_sound"]], "x" : object["x"],
                        "y" : object["y"], "dimension_x" : object["dimension_x"], "dimension_y" : object["dimension_y"]};
    await localforage.setItem(`${name}`, data_to_save);
}