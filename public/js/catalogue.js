let categoriesList = [];
let unitsList = [];
let productsList = [];
let formMode = "create"; // "create" | "edit"
let editingProduct = null;

function loadProducts() {
    fetch('/api/products')
        .then(res => res.json())
        .then(products => {
            productsList = products;
            const tbody = document.querySelector('#productsTable tbody');

            if (products.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4">В каталоге нет товаров.</td></tr>';
                return;
            }

            tbody.innerHTML = products.map((p, i) => `
                <tr>
                    <td>${p.sku ?? "Не указано"}</td>
                    <td>${p.name ?? "Не указано"}</td>
                    <td>${p.category ?? "Не указано"}</td>
                    <td class="row-edit-cell">
                        ${p.unit ?? "Не указано"}
                        <div class="row-hover"></div>
                        <div class="row-edit"><button type="button" title="Редактировать" onclick="showProductForm(productsList[${i}])"><span class="material-symbols-outlined">edit</span></button></div>
                    </td>
                </tr>
            `).join('');
        })
        .catch(err => console.error(err));
}

function queryElements() {
    // Получаем элементы (форма и ее задний фон)
    modalBackground = document.getElementById("modal-background");
    productFormContainer = document.getElementById("product-form"); // Контейнер формы
    productFormFields = productFormContainer.querySelector("form"); // Сама форма (все поля и подписи)
    // Поля формы
    productName = document.getElementById("product-name");
    productCategory = document.getElementById("product-category");
    productUnits = document.getElementById("product-units");
    productFormTitle = productFormContainer.querySelector("h2");
    productFormSubmitButton = productFormFields.querySelector('input[type="submit"]');
}

function loadCatalogue() {
    queryElements();
    loadProducts();

    // Заполнение полей списков значений значениями из БД
    fetch('/api/products/categories')
        .then(res => res.json())
        .then(categories => {
            categoriesList = categories.slice();
            productCategory.innerHTML = categories.map(c =>
                `<option value="${c}">${c}</option>`
            ).join('');
            productCategory.innerHTML += `<option value="">Не указано</option>`;
        })
        .catch(err => console.error(err));
    fetch('/api/products/units')
        .then(res => res.json())
        .then(units => {
            unitsList = units.slice();
            productUnits.innerHTML = units.map(u =>
                `<option value="${u}">${u}</option>`
            ).join('');
            productUnits.innerHTML += `<option value="">Не указано</option>`;
        })
        .catch(err => console.error(err));

    modalBackground?.addEventListener('click', (event) => { // Любое нажатие ВНЕ формы приводит к ее закрытию
        if (event.target === modalBackground) {
            closeProductForm();
        }
    });
    productFormFields?.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (formMode === "edit") {
            // TODO: обработка сохранения изменений товара
            return;
        }

        const payload = {
            name:     productName.value.trim(),
            category: productCategory.value || null,
            units:    productUnits.value || null,
        };

        console.log("Product POST submit request:");
        console.log(payload);

        let req = { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload) 
        };
        let res = await fetch('/api/products', req);

        console.log(req);
        console.log(res);

        closeProductForm();
        await loadProducts();
    });
    // showProductForm(); <-- test
}

// Без аргумента - режим создания, с товаром - режим редактирования
function showProductForm(product = null) {
    productFormFields.reset();
    if (product) {
        formMode = "edit";
        editingProduct = product;
        productFormTitle.textContent = "Редактирование товара";
        productFormSubmitButton.value = "Сохранить";
        productName.value = product.name ?? "";
        productCategory.value = product.category ?? "";
        productUnits.value = product.unit ?? "";
    } else {
        formMode = "create";
        editingProduct = null;
        productFormTitle.textContent = "Создание товара";
        productFormSubmitButton.value = "Создать";
    }
    modalBackground.classList.toggle("not-visible");
}

function closeProductForm() {
    modalBackground.classList.toggle("not-visible");
}

function getCategoryValues() {
    fetch('/api/products/categories')
}