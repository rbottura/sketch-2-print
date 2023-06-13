let page = document.querySelector('#paged-dummy');

document.querySelector('#page_color_pick').addEventListener('change', (e) => {
    let color = e.target.value
    document.querySelector('#page_bck_color_text').value = e.target.value;
    page.style.backgroundColor = color;
})

document.querySelector('#page_bck_color_text').addEventListener('change', (e) => {
    let color = e.target.value
    console.log(color)
    page.style.backgroundColor = color;
})

document.addEventListener('click', () => {
    // console.log(img)
})

let src;
document.querySelector('#input_bck_img_file').addEventListener('input', (e) => {
    const file = e.target.files[0]; 
    const reader = new FileReader();

    reader.onload = function (loadedEvent) {
        const imageUrl = loadedEvent.target.result;
        src = imageUrl;
        page.style.backgroundImage = `url(${imageUrl})`;
    };

    reader.readAsDataURL(file);
})

document.querySelector('#page_bck_size_text').addEventListener('change', (e) => {
    page.style.backgroundSize = e.target.value;
})

document.querySelector('#page_bck_repeat_text').addEventListener('change', e => {
    page.style.backgroundRepeat = e.target.value;
})

document.querySelector('#page_bck_image_checkbox').addEventListener('change', e => {
    if(e.target.checked && src){
        page.style.backgroundImage = `url(${src})`
    } else {
        page.style.backgroundImage = '';
    }
})