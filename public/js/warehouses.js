let warehousesList = [];
let currentStock = [];
let categoriesList = [];
let currentWarehouseId = null;
let warehouseFormMode = "create";
let editingWarehouse = null;

function getWarehouseName(id) {
    const wh = warehousesList.find(w => w.id === id);
    return wh ? wh.name : `#${id}`;
}

function queryElements() {
    // Получаем элементы (форма и ее задний фон)
    modalBackground = document.getElementById("modal-background");
    warehouseFormContainer = document.getElementById("warehouse-form"); // Контейнер формы
    warehouseFormFields = warehouseFormContainer.querySelector("form"); // Сама форма (все поля и подписи)
    // Поля формы
    warehouseName = document.getElementById("warehouse-name");
    warehouseAddress = document.getElementById("warehouse-address");

    warehouseFormTitle = warehouseFormContainer.querySelector("h2");
    warehouseFormSubmitButton = warehouseFormFields.querySelector('input[type="submit"]');


    movementFormContainer = document.getElementById("movement-form"); // Контейнер формы
    movementFormFields = movementFormContainer.querySelector("form"); // Сама форма (все поля и подписи)

    outWarehouseName = document.getElementById("out-warehouse-name");
    inWarehouseName = document.getElementById("in-warehouse-name");
    movementProductName = document.getElementById("movement-product-name");
    movementQuantity = document.getElementById("movement-quantity");
    movementDate = document.getElementById("movement-date");
    movementOperator = document.getElementById("movement-operator");

    movementFormSubmitButton = movementFormFields.querySelector('input[type="submit"]');


    reportFormContainer = document.getElementById("report-form"); // Контейнер формы
    reportFormFields = reportFormContainer.querySelector("form");

    warehouseFilters = document.getElementById("warehouse-filters");
    categoryFilters = document.getElementById("category-filters");
    warehouseFiltersLegend = warehouseFilters.querySelector("legend");
    categoryFiltersLegend = categoryFilters.querySelector("legend");

    reportFormSubmitButton = reportFormFields.querySelector('input[type="submit"]');
}


function loadWarehouses() {
    fetch('/api/warehouses')
        .then(res => res.json())
        .then(warehouses => {
            warehousesList = warehouses;
            fillWarehouseFilters();
            const tbody = document.querySelector('#warehousesTable tbody');

            if (warehouses.length === 0) {
                tbody.innerHTML = '<tr><td colspan="2">Нет складов.</td></tr>';
                return;
            }

            tbody.innerHTML = warehouses.map((w, i) => `
                <tr class="warehouse-row" data-id="${w.id}" onclick="selectWarehouse(${w.id})">
                    <td>${w.name ?? "Не указано"}</td>
                    <td class="row-edit-cell">
                        ${w.address ?? "Не указано"}
                        <div class="row-hover"></div>
                        <div class="row-edit">
                            <button type="button" title="Редактировать" onclick="event.stopPropagation(); showWarehouseForm(warehousesList[${i}])">
                                <span class="material-symbols-outlined">edit</span>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

            if (warehouses.length > 0) {
                selectWarehouse(warehouses[0].id);
            }
        })
        .catch(err => console.error(err));
}

function selectWarehouse(id) {
    currentWarehouseId = id;

    document.querySelectorAll('#warehousesTable tbody tr').forEach(row => {
        row.classList.toggle('active', Number(row.dataset.id) === id);
    });

    loadStockItems(id);
    loadMovements(id);
}


function loadStockItems(warehouseId) {
    const tbody = document.querySelector('#stockItemsTable tbody');
    tbody.innerHTML = '<tr><td colspan="3">Загрузка...</td></tr>';

    fetch(`/api/warehouses/${warehouseId}/stock`)
        .then(res => res.json())
        .then(items => {
            currentStock = items;
            fillMovementProductNames(0);
            if (items.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3">На складе нет товаров.</td></tr>';
                return;
            }
            tbody.innerHTML = items.map(item => `
                <tr>
                    <td>${item.product_sku ?? "Не указано"}</td>
                    <td>${item.product_name ?? "Не указано"}</td>
                    <td>${item.quantity ?? "Не указано"}</td>
                </tr>
            `).join('');
        })
        .catch(err => {
            console.error(err);
            tbody.innerHTML = '<tr><td colspan="3">Ошибка загрузки остатков.</td></tr>';
        });
}

function loadMovements(warehouseId) {
    const tbody = document.querySelector('#movementsTable tbody');
    tbody.innerHTML = '<tr><td colspan="6">Загрузка...</td></tr>';

    fetch(`/api/warehouses/${warehouseId}/movements`)
        .then(res => res.json())
        .then(movements => {
            if (movements.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6">Нет движений.</td></tr>';
                return;
            }
            tbody.innerHTML = movements.map(m => `
                <tr>
                    <td>${m.product_name ?? "Не указано"}</td>
                    <td>${m.quantity ?? "Не указано"}</td>
                    <td>${getWarehouseName(m.out_warehouse_id)}</td>
                    <td>${getWarehouseName(m.in_warehouse_id)}</td>
                    <td>${m.operator ?? "Не указано"}</td>
                    <td>${formatDate(m.date)}</td>
                </tr>
            `).join('');
        })
        .catch(err => {
            console.error(err);
            tbody.innerHTML = '<tr><td colspan="6">Ошибка загрузки движений.</td></tr>';
        });
}

function formatDate(isoString) {
    if (!isoString) return "Не указано";
    //const d = new Date(isoString);
    const d = new Date(new Date(isoString).getTime() + new Date(isoString).getTimezoneOffset() * 60 * 1000);
    if (isNaN(d.getTime())) return "Не указано";
    const pad = n => String(n).padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function editWarehouse(index) {
    console.log("Edit warehouse:", warehousesList[index]);
}

function loadWarehousesPage() {
    queryElements();
    loadWarehouses();

    // Загрузка категорий для фильтров
    fetch('/api/products/categories')
        .then(res => res.json())
        .then(categories => {
            categoriesList = categories.slice();
            console.log(categoriesList)
            fillCategoryFilters();
        })
        .catch(err => console.error(err));

    modalBackground?.addEventListener('click', (event) => { // Любое нажатие ВНЕ формы приводит к ее закрытию
        if (event.target === modalBackground) {
            closeAllForms();
        }
    });

    warehouseFormFields?.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (warehouseFormMode === "edit") {
            const res = await fetch(`/api/warehouses/${editingWarehouse.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name:     warehouseName.value.trim(),
                    address:  warehouseAddress.value.trim()
                })
            });
            if (!res.ok) {
                console.error("Warehouse PUT failed:", await res.json());
                return;
            }
            closeAllForms();
            await loadWarehouses();
            return;
        }

        const payload = {
            name:     warehouseName.value.trim(),
            address:  warehouseAddress.value.trim()
        };

        let req = { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload) 
        };
        let res = await fetch('/api/warehouses', req);

        closeAllForms();
        await loadWarehouses();
    });

    movementProductName?.addEventListener('change', (event) => {
        fillMovementQuantityRestrictions(event.target.value)
    });

    movementFormFields?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const payload = {
            out_warehouse_id: Number(outWarehouseName.value),
            in_warehouse_id: Number(inWarehouseName.value),
            product_id: Number(currentStock.find(x => x.id == movementProductName.value).product_id),
            quantity: Number(movementQuantity.value),
            date: movementDate.value,
            operator: movementOperator.value.trim()
        };

        try {
            const res = await fetch('/api/movements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Movement POST failed:", errorData);
                alert(errorData.message || 'Ошибка при создании отгрузки');
                return;
            }

            closeAllForms();
            
            await loadStockItems(currentWarehouseId);
            await loadMovements(currentWarehouseId);

        } catch (err) {
            console.error("Network error:", err);
        }
    });

    // Кнопки селекта в форме фильтров
    const selectAllWarehousesBtn = warehouseFilters.querySelector('button[title="Выбрать все"]');
    const selectAllCategoriesBtn = categoryFilters.querySelector('button[title="Выбрать все"]');

    selectAllWarehousesBtn.addEventListener('click', () => {
        const anyChecked = isAnyCheckboxChecked(warehouseFilters);
        toggleAllCheckboxes(warehouseFilters, !anyChecked);
    });

    selectAllCategoriesBtn.addEventListener('click', () => {
        const anyChecked = isAnyCheckboxChecked(categoryFilters);
        toggleAllCheckboxes(categoryFilters, !anyChecked);
    });

    reportFormFields?.addEventListener('submit', async (e) => {
        e.preventDefault();
        var check = checkFilters();

        if(!check) { return; }

        const selectedWarehouses = getSelectedValues(warehouseFilters);
        const selectedCategories = getSelectedValues(categoryFilters);

        console.log("Selected Warehouse IDs:", selectedWarehouses);
        console.log("Selected Categories:", selectedCategories);

        try {
            /*
            const res = await fetch('/api/reports/stock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    warehouseIds: selectedWarehouses,
                    categories: selectedCategories
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Report generation failed:", errorData);
                alert(errorData.message || 'Ошибка при создании отчета');
                return;
            }

            const reportData = await res.json();
            console.log("Report Data:", reportData);

            //generateXlsxFromData(reportData);
            */

            const res = await fetch('/api/reports/stock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    warehouseIds: selectedWarehouses,
                    categories: selectedCategories
                })
            });
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'stock_report.xlsx';
            a.click();

            closeAllForms();
        } catch (err) {
            console.error("Network error:", err);
        }
    });
}

function showWarehouseForm(warehouse = null) {
    warehouseFormFields.reset();
    if (warehouse) {
        warehouseFormMode = "edit";
        editingWarehouse = warehouse;
        warehouseFormTitle.textContent = "Редактирование информации о складе";
        warehouseFormSubmitButton.value = "Сохранить";
        warehouseName.value = warehouse.name ?? "";
        warehouseAddress.value = warehouse.address ?? "";
    } else {
        warehouseFormMode = "create";
        editingWarehouse = null;
        warehouseFormTitle.textContent = "Добавление новой точки";
        warehouseFormSubmitButton.value = "Создать";
    }
    modalBackground.classList.toggle("not-visible");
    warehouseFormContainer.classList.toggle("not-visible");
}

function showMovementForm() {
    movementFormFields.reset();

    outWarehouseName.innerHTML = `<option value="${currentWarehouseId}">${getWarehouseName(currentWarehouseId)}</option>`;
    inWarehouseName.innerHTML = warehousesList.filter(x => x.id != currentWarehouseId).map(c =>
                `<option value="${c.id}">${c.name}</option>`
            ).join('');
   // fillMovementProductNames(currentWarehouseId)
    movementDate.value = (new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000)).toISOString().slice(0, -8)

    modalBackground.classList.toggle("not-visible");
    movementFormContainer.classList.toggle("not-visible");
}

function fillMovementProductNames(warehouseId) {
    try {
        if (currentStock.length === 0) {
            movementProductName.innerHTML = `<option value=""><На складе нет товаров></option>`
            movementProductName.disabled = true;
            movementFormSubmitButton.disabled = true;
            return;
        }
        movementProductName.innerHTML = currentStock.map(item => `
            <option value="${item.id}">${item.product_sku} | ${item.product_name}</option>
        `).join('');
        fillMovementQuantityRestrictions(currentStock[0].id)
        movementProductName.disabled = false;
        movementFormSubmitButton.disabled = false;
    }
    catch (err) {
        console.error(err);
        movementProductName.innerHTML = `<option value=""><Возникла ошибка при получении товаров></option>`
        movementProductName.disabled = true;
        movementFormSubmitButton.disabled = true;
    }
}

function fillMovementQuantityRestrictions(stockItemId) {
    var stockItem = currentStock.find(x => x.id == stockItemId)
    if(stockItem == undefined) {
        console.log('item not found in stock')
        return
    }
    console.log(`chosen stock item: ${stockItem.product_sku} (up to ${stockItem.quantity}, id: ${stockItem.product_id})`)
    movementQuantity.min = `1`
    movementQuantity.max = `${stockItem.quantity}`
}

function showReportForm() {
    reportFormFields.reset();

    modalBackground.classList.toggle("not-visible");
    reportFormContainer.classList.toggle("not-visible");
}

function fillWarehouseFilters(){
    var previousFilters =  warehouseFilters.querySelectorAll(".inserted-content");
    if(previousFilters) {
        var len = previousFilters.length;
        for(let i = 0; i < len; i++) {
            warehouseFilters.removeChild(previousFilters[i])
        }
    }
    warehouseFiltersLegend.insertAdjacentHTML("afterend", 
        warehousesList.map( w =>
            `
            <div class="checkbox-alignment-container inserted-content">
                <input type="checkbox" id="warehouse-${w.id}" name="warehouse-${w.id}" class="reset" value="${w.id}">
                <label for="warehouse-${w.id}">${w.name}</label>
            </div>
            `
        ).join('')
    )
}

function fillCategoryFilters(){
    var previousFilters = categoryFilters.querySelectorAll(".inserted-content");
    if(previousFilters) {
        var len = previousFilters.length;
        for(let i = 0; i < len; i++) {
            categoryFilters.removeChild(previousFilters[i])
        }
    }
    categoryFiltersLegend.insertAdjacentHTML("afterend", 
        categoriesList.map( w =>
            `
            <div class="checkbox-alignment-container inserted-content">
                <input type="checkbox" id="category-${categoriesList.indexOf(w)}" name="category-${categoriesList.indexOf(w)}" class="reset" value="${w}">
                <label for="category-${categoriesList.indexOf(w)}">${w}</label>
            </div>
            `
        ).join('')
    )
}

function isAnyCheckboxChecked(fieldset) {
    return fieldset.querySelector('input[type="checkbox"]:checked') !== null;
}

function checkFilters() {
    const hasSelectedWarehouses = isAnyCheckboxChecked(warehouseFilters);
    const hasSelectedCategories = isAnyCheckboxChecked(categoryFilters);

    if (!hasSelectedWarehouses && !hasSelectedCategories) {
        alert("Пожалуйста, выберите хотя бы один склад и категорию.");
        return false;
    }
    return true;
}

function toggleAllCheckboxes(fieldset, selectAll) {
    const checkboxes = fieldset.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach(cb => {
        cb.checked = selectAll;
    });
}

function getSelectedValues(fieldset) {
    const checkedBoxes = fieldset.querySelectorAll('input[type="checkbox"]:checked');
    return Array.from(checkedBoxes).map(cb => {
        return cb.value
    });
}

function closeAllForms() {
    modalBackground.classList.toggle("not-visible");
    warehouseFormContainer.classList.add("not-visible");
    movementFormContainer.classList.add("not-visible");
    reportFormContainer.classList.add("not-visible");
}
