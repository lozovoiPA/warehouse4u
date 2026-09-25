var materialIcons = 
    "open_in_new,filter_alt,settings,add";

function appendStyleLink(url) {
    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';

    document.head.appendChild(link);
    link.href = url;
}

function appendMaterialIcons(icon_names) {
    const url = `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&icon_names=${icon_names}`;
    appendStyleLink(url);
}

function loadLogo(currentEndpoint) {
    const topnav = document.getElementById("topnav");
    if (topnav === null) {
        console.log("Element with id \"topnav\" couldn't be found. Navigation bar will not be rendered.");
        return;
    }
    appendMaterialIcons(materialIcons);
    const links = `
        <a ${currentEndpoint=="home" ? `class="active" href=""` : `href="/"`}>Главная</a>
        <a ${currentEndpoint=="warehouses" ? `class="active" href=""` : `href="/warehouses"`}>Склады</a>
        <a ${currentEndpoint=="catalogue" ? `class="active" href=""` : `href="/catalogue"`}>Каталог</a>
        <a ${currentEndpoint=="docs" ? `class="active" href=""` : `href="/docs"`}>Документация</a>
    `

    topnav.innerHTML = `
        <div class="logo">
            <img src="https://cdn-icons-png.flaticon.com/512/1778/1778141.png"/>
            <span>ВашСклад</span>
        </div>

        ${links}

        <div class="attribution">
            <a href="https://github.com/lozovoiPA/warehouse4u" style="max-width: 120px;">
                Проект на GitHub
                <span class="material-symbols-outlined" style="font-size:0.9em">open_in_new</span>
            </a>

            <a href="https://www.flaticon.com/free-icon/packaging_1778141" target="_blank" title="box icons">
                Логотип сделан mynamepong на Flaticon
                <span class="material-symbols-outlined" style="font-size:0.9em">open_in_new</span>
            </a>
        </div>
    `
}