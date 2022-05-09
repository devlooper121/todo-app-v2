let btn = document.getElementById("menu-btn");

btn.addEventListener("click", ()=>{
    let menu = document.getElementById("menu");
    menu.classList.toggle("appear");
    if(btn.innerHTML === '<span class="material-symbols-outlined">menu_open</span>'){
        btn.innerHTML = `<span class="material-symbols-outlined">menu</span>`;
    }else{
        btn.innerHTML = `<span class="material-symbols-outlined">menu_open</span>`;
    }
})