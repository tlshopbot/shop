"use strict"




let common_json_data;




let user_key;
let user_data;
let orders_count;
let basket_list;
let basket_products_list = new Object();
let basket_products_id_list = [];
let basket_products_count_list = [];
let userId;
// const userId = 1000597955;
let user_id;
let bot_id = '251807';
let delivery = 'pickup';
let form_data = {
    method: 'pickup',
    adressPickup: null,
    adressCourier: null,
    date: null,
    time: null,
    phone: null,
    comment: null,
    pay: null
};
let admin_flag = false;



function get_user_key() {
    const post_user_keyData = {
        bot_id: bot_id,
        telegram_id: userId
    };
    let my_user_keyHeaders = new Headers();
    my_user_keyHeaders.append('Content-Type', 'application/json');
    fetch('https://api.bot-t.com/v1/bot/user/view-by-telegram-id?token=7723075467:AAEHIRezunqN-fb__mqG4akqIHGZd3r9X5g', {
        method: 'POST',
        headers: my_user_keyHeaders,
        body: JSON.stringify(post_user_keyData),
    }).then((user_key_data) => {
        return user_key_data.json();
    }).then((json_user_key_data) => {
        user_key = json_user_key_data['data']['secret_user_key'];
        user_id = json_user_key_data['data']['id'];
        user_data = json_user_key_data;
    }).then(() => {
        get_basket();
        get_count();
        delete_all_product();
        profile_manag();
        admin();
    });
};


function get_basket() {
    const post_get_basketData = {
        bot_id: bot_id,
        secret_user_key: user_key,
        user_id: user_id
    };
    let my_get_basketHeaders = new Headers();
    my_get_basketHeaders.append('Content-Type', 'application/json');
    fetch('https://api.bot-t.com/v1/shopcart/cart/get', {
        method: 'POST',
        headers: my_get_basketHeaders,
        body: JSON.stringify(post_get_basketData),
    }).then((basket_data) => {
        return basket_data.json();
    }).then((json_basket_data) => {
        basket_list = json_basket_data['data'];
        for (let i = 0; i < basket_list['items'].length; i++) {
            basket_products_list[basket_list['items'][i]['id']] = basket_list['items'][i]['count'];
        };
        if (basket_list['warnings'][0]) {
            new Promise(() => {
                for (let i = 0; i < basket_list['warnings'].length; i++) {
                    remove_product(basket_list['warnings'][i]['category_id']);
                }
            }).then(() => {
                get_basket();
            });
        } else {
            create_basket(basket_list);
        };
    });
};




function get_count() {
    const post_get_countData = {
        bot_id: bot_id,
        secret_user_key: user_key,
        user_id: user_id
    };
    let my_get_countHeaders = new Headers();
    my_get_countHeaders.append('Content-Type', 'application/json');
    fetch('https://api.bot-t.com/v1/shopcart/order/count', {
        method: 'POST',
        headers: my_get_countHeaders,
        body: JSON.stringify(post_get_countData),
    }).then((count_data) => {
        return count_data.json();
    }).then((json_count_data) => {
        orders_count = json_count_data['data'];
    });
};


function add_product(product_id) {
    const post_add_productData = {
        bot_id: bot_id,
        category_id: product_id,
        secret_user_key: user_key,
        user_id: user_id
    };
    let my_add_productHeaders = new Headers();
    my_add_productHeaders.append('Content-Type', 'application/json');
    fetch('https://api.bot-t.com/v1/shopcart/cart/add', {
        method: 'POST',
        headers: my_add_productHeaders,
        body: JSON.stringify(post_add_productData),
    }).then((add_product_data) => {
        return add_product_data.json();
    }).then((json_add_product_data) => {
        get_basket();
    });
};


function remove_product(product_id) {
    const post_remove_productData = {
        bot_id: bot_id,
        category_id: product_id,
        secret_user_key: user_key,
        user_id: user_id
    };
    let my_remove_productHeaders = new Headers();
    my_remove_productHeaders.append('Content-Type', 'application/json');
    fetch('https://api.bot-t.com/v1/shopcart/cart/subtract', {
        method: 'POST',
        headers: my_remove_productHeaders,
        body: JSON.stringify(post_remove_productData),
    }).then((remove_product_data) => {
        return remove_product_data.json();
    }).then((json_remove_product_data) => {
        get_basket();
    });
};



function uppdate_categories() {
    let category_list = document.getElementsByClassName('category_list')[0];
    let path = document.getElementsByClassName('path')[0];
    category_list.remove();
    path.remove();
    create_categories(common_json_data, 0);
};


function create_categories(json_data, category_id) { //создание категорий
    if (category_id == 0) {
        let path = document.createElement('section');
        path.classList.add('path');
        catalog.append(path);
        let category_name = document.createElement('p');
        path.append(category_name);
        category_name.outerHTML = '<p class="category_name">Главная</p>';
    } else {
        let path = document.createElement('section');
        path.classList.add('path');
        catalog.append(path);
        let category_back = document.createElement('svg');
        path.append(category_back);
        category_back.outerHTML = `<svg class="category_back" width="10" height="19" viewBox="0 0 10 19" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 1.5L1.72591 8.41039C1.32515 8.79111 1.30929 9.42476 1.69052 9.82504L9 17.5"
                            stroke="#0C0C0C" stroke-width="2" stroke-linecap="round" />
                    </svg>`;
        let category_name = document.createElement('p');
        path.append(category_name);
        category_name.outerHTML = `<p class="category_name">${json_data['design']['title']}</p>`;
        json_data = json_data['children'];
    };

    let category_list = document.createElement('section');
    category_list.classList.add('category_list');
    category_list.id = category_id;
    catalog.append(category_list);
    for (let i = 0; i < json_data.length; i++) { //цикл основных категорий
        let hide = false;
        if (admin_flag) {
            if ((json_data[i]['is_hide'] == true) || (json_data[i]['is_hide'] == false && json_data[i]['is_view'] == true)) {
                hide = true;
            }
        } else if (json_data[i]['is_hide'] == false && json_data[i]['is_view'] == true) {
            hide = true;
        };
        if (hide) { //если не скрыт
            let discript = json_data[i]['design']['description'].split('\r\n').join('<br>');
            if (json_data[i]['typeObg']['id'] == '0') { //если категория
                let category = document.createElement('article');
                category_list.append(category);
                category.outerHTML = `<article class="category" id="${json_data[i]['id']}">
                        <div class="container">
                            <img src="${json_data[i]['design']['image']}" class="img" loading="lazy" fetchpriority="auto" aria-hidden="true" draggable="false" style="object-fit: contain; object-position: 50% 50%;"></img>
                        </div>
                        <div class="info">
                            <p class="name">${json_data[i]['design']['title']}</p>
                            <p class="discript">${discript}</p>
                        </div>
                    </article>`;
                let cart_category = document.createElement('article');
                cart.append(cart_category);
                if (false) {
                    cart_category.outerHTML = `<article class="cart_category hide" id="cart_${json_data[i]['id']}">
                        <div class="cart_path">
                            <svg class="cart_back" width="10" height="19" viewBox="0 0 10 19" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 1.5L1.72591 8.41039C1.32515 8.79111 1.30929 9.42476 1.69052 9.82504L9 17.5"
                                    stroke="#0C0C0C" stroke-width="2" stroke-linecap="round" />
                            </svg>
                            <p class="cart_path_name">Карточка категории</p>
                        </div>
                        <div class="cart_info">
                            <div class="cart_container">
                                <img src="${json_data[i]['design']['image']}" class="cart_img_change" loading="lazy" fetchpriority="auto" aria-hidden="true" draggable="false" style="object-fit: contain; object-position: 50% 50%;"></img>
                                <label for="fileInput" class="upload_img_change">
                                    <svg class="add_category_svg_change" width="28" height="28" viewBox="0 0 14 14" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7 1V13" stroke-width="2" stroke-linecap="round" />
                                        <path d="M1 7H13" stroke-width="2" stroke-linecap="round" />
                                    </svg>
                                </label>
                            </div>
                            <input type="file" class="fileInput_change" id="fileInput" accept="image/*" required>
                            <input class="cart_name_input_change" type="text" value="${json_data[i]['design']['title']}" placeholder="Название" />
                            <textarea class="cart_discript_input_change" type="text" placeholder="Описание" rows="4">${json_data[i]['design']['description']}</textarea>
                        </div>
                        <div class="save_category_change disactive_but">
                            <p class="save_category_text">Сохранить</p>
                        </div>
                    </article>`
                } else {
                    cart_category.outerHTML = `<article class="cart_category hide" id="cart_${json_data[i]['id']}">
                        <div class="cart_path">
                            <svg class="cart_back" width="10" height="19" viewBox="0 0 10 19" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 1.5L1.72591 8.41039C1.32515 8.79111 1.30929 9.42476 1.69052 9.82504L9 17.5"
                                    stroke="#0C0C0C" stroke-width="2" stroke-linecap="round" />
                            </svg>
                            <p class="cart_path_name">Карточка категории</p>
                        </div>
                        <div class="cart_info">
                            <img src="${json_data[i]['design']['image']}" class="cart_img" loading="lazy" fetchpriority="auto" aria-hidden="true" draggable="false" style="object-fit: contain; object-position: 50% 50%;"></img>
                            <p class="cart_name">${json_data[i]['design']['title']}</p>
                            <p class="cart_discript">${discript}</p>
                        </div>
                    </article>`
                }
            } else { //если товар
                let disactive_flag = '';
                let hide_flag = 'hide';
                let hide_none_flag = '';
                let product_count = 0;
                if (basket_products_list[json_data[i]['id']]) {
                    product_count = basket_products_list[json_data[i]['id']];
                    hide_flag = '';
                    hide_none_flag = 'hide';
                    if (product_count == json_data[i]['setting']['count']) {
                        disactive_flag = 'disactive';
                    };
                };
                let product = document.createElement('product');
                category_list.append(product);
                product.outerHTML = `<article class="product" id="${json_data[i]['id']}">
                    <div class="container">
                        <img src="${json_data[i]['design']['image']}" class="img" loading="lazy" fetchpriority="auto" aria-hidden="true" draggable="false" style="object-fit: contain; object-position: 50% 50%;"></img>
                    </div>
                    <div class="info">
                        <p class="name">${json_data[i]['design']['title']}</p>

                        <div class="discript">${discript}</div>
                        <div class="price_info">
                            <p class="count">В наличии: ${json_data[i]['setting']['count']} шт.</p>
                            <p class="price">${json_data[i]['price']['full']}</p>
                        </div>
                        <div class="add">
                            <p class="add_none_text ${hide_none_flag}">В КОРЗИНУ</p>
                            <svg class="minus ${hide_flag}" width="14" height="2" viewBox="0 0 14 2" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1H13" stroke-width="2" stroke-linecap="round" />
                            </svg>
                            </svg>
                            <p class="add_text ${hide_flag}">${product_count}</p>
                            <svg class="plus ${hide_flag} ${disactive_flag}" width="14" height="14" viewBox="0 0 14 14" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 1V13" stroke-width="2" stroke-linecap="round" />
                                <path d="M1 7H13" stroke-width="2" stroke-linecap="round" />
                            </svg>
                        </div>
                    </div>
                </article>`
                let cart_product = document.createElement('article');
                cart.append(cart_product);
                if (false) {
                    cart_product.outerHTML = `<article class="cart_product hide" id="cart_${json_data[i]['id']}">
                    <div class="cart_path">
                        <svg class="cart_back" width="10" height="19" viewBox="0 0 10 19" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 1.5L1.72591 8.41039C1.32515 8.79111 1.30929 9.42476 1.69052 9.82504L9 17.5"
                                stroke="#0C0C0C" stroke-width="2" stroke-linecap="round" />
                        </svg>
                        <p class="cart_path_name">Карточка продукта</p>
                    </div>
                    <div class="cart_info">
                        <div class="cart_container">
                            <img src="${json_data[i]['design']['image']}" class="cart_img_change" loading="lazy" fetchpriority="auto" aria-hidden="true" draggable="false" style="object-fit: contain; object-position: 50% 50%;"></img>
                            <label for="fileInput" class="upload_img_change">
                                <svg class="add_category_svg" width="28" height="28" viewBox="0 0 14 14" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 1V13" stroke-width="2" stroke-linecap="round" />
                                    <path d="M1 7H13" stroke-width="2" stroke-linecap="round" />
                                </svg>
                            </label>
                        </div>
                        <input type="file" class="fileInput_change" id="fileInput" accept="image/*" required>
                        <input class="cart_name_input_change" type="text" value="${json_data[i]['design']['title']}" placeholder="Название" />
                        <textarea class="cart_discript_input_change" type="text" placeholder="Описание" rows="4">${json_data[i]['design']['description']}</textarea>
                        <input class="cart_count_input_change" type="text" value="${json_data[i]['setting']['count']}" placeholder="Количество" />
                        <input class="cart_price_input_change" type="text" value="${json_data[i]['price']['full'].slice(0, -2)}" placeholder="Цена" />
                        <div class="cart_price_menu">
                            <p class="cart_price">${json_data[i]['price']['full']}</p>
                            <div class="cart_add">
                                <svg class="cart_minus ${hide_flag}" width="14" height="2" viewBox="0 0 14 2" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 1H13" stroke-width="2" stroke-linecap="round" />
                                </svg>
                                <p class="cart_add_text ${hide_flag}">${product_count}</p>
                                <svg class="cart_plus ${disactive_flag}" width="14" height="14" viewBox="0 0 14 14" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 1V13" stroke-width="2" stroke-linecap="round" />
                                    <path d="M1 7H13" stroke-width="2" stroke-linecap="round" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div class="save_category_change disactive_but">
                        <p class="save_category_text">Сохранить</p>
                    </div>
                </article>`
                } else {
                    cart_product.outerHTML = `<article class="cart_product hide" id="cart_${json_data[i]['id']}">
                    <div class="cart_path">
                        <svg class="cart_back" width="10" height="19" viewBox="0 0 10 19" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 1.5L1.72591 8.41039C1.32515 8.79111 1.30929 9.42476 1.69052 9.82504L9 17.5"
                                stroke="#0C0C0C" stroke-width="2" stroke-linecap="round" />
                        </svg>
                        <p class="cart_path_name">Карточка продукта</p>
                    </div>
                    <div class="cart_info">
                        <img src="${json_data[i]['design']['image']}" class="cart_img" loading="lazy" fetchpriority="auto" aria-hidden="true" draggable="false" style="object-fit: contain; object-position: 50% 50%;"></img>
                        <p class="cart_name">${json_data[i]['design']['title']}</p>
                        <p class="cart_discript">${discript}</p>
                        <div class="cart_price_info">
                            <p class="cart_count">В наличии: ${json_data[i]['setting']['count']} шт.</p>
                        </div>
                        <div class="cart_price_menu">
                            <p class="cart_price">${json_data[i]['price']['full']}</p>
                            <div class="cart_add">
                                <p class="cart_add_none_text ${hide_none_flag}">В КОРЗИНУ</p>
                                <svg class="cart_minus ${hide_flag}" width="14" height="2" viewBox="0 0 14 2" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 1H13" stroke-width="2" stroke-linecap="round" />
                                </svg>
                                <p class="cart_add_text ${hide_flag}">${product_count}</p>
                                <svg class="cart_plus ${hide_flag} ${disactive_flag}" width="14" height="14" viewBox="0 0 14 14" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 1V13" stroke-width="2" stroke-linecap="round" />
                                    <path d="M1 7H13" stroke-width="2" stroke-linecap="round" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </article>`
                };
            };
        };
    };
    if (admin_flag) {
        let add_category = document.createElement('article');
        category_list.append(add_category);
        add_category.outerHTML = `<article class="add_category">
                        <div class="add_category_plus">
                            <svg class="add_category_svg" width="28" height="28" viewBox="0 0 14 14" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 1V13" stroke-width="2" stroke-linecap="round" />
                                <path d="M1 7H13" stroke-width="2" stroke-linecap="round" />
                            </svg>
                        </div>
                    </article>`;
        let add_cart = document.createElement('article');
        cart.append(add_cart)
        add_cart.outerHTML = `<article class="add_cart hide">
                    <div class="cart_adm_path">
                        <svg class="cart_back" width="10" height="19" viewBox="0 0 10 19" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 1.5L1.72591 8.41039C1.32515 8.79111 1.30929 9.42476 1.69052 9.82504L9 17.5"
                                stroke="#0C0C0C" stroke-width="2" stroke-linecap="round" />
                        </svg>
                        <p class="cart_path_name">Карточка продукта</p>
                    </div>
                    <div class="cart_info">
                        <div class="cart_container">
                            <svg class="cart_img_none" width="1629" height="1629" viewBox="0 0 1629 1629" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M773.667 0.466655C742.067 2.73332 726.867 4.19999 709.4 6.46666C531.133 29.4 366.467 110.467 238.467 238.467C118.467 358.467 38.5999 512.733 11.1333 677.667C2.73328 728.333 0.466614 757.8 0.466614 814.333C0.466614 860.467 1.39995 878.733 5.79995 914.333C28.0666 1094.73 109.267 1261.13 238.467 1390.2C362.867 1514.6 523.267 1595.4 695.133 1620.33C740.867 1626.87 761 1628.2 814.333 1628.2C867.667 1628.2 887.8 1626.87 933.533 1620.33C1149 1589.13 1344.6 1470.33 1474.33 1291.67C1547.53 1191 1597.27 1072.47 1617.53 951C1625.93 900.333 1628.2 870.867 1628.2 814.333C1628.2 768.2 1627.27 749.933 1622.87 714.333C1600.6 533.933 1519.4 367.533 1390.2 238.467C1264.73 112.867 1103.4 32.2 929 7.66666C891.667 2.46666 868.867 0.866655 824.333 0.466655C800.2 0.199988 777.4 0.199988 773.667 0.466655ZM878.333 116.333C1043.13 131.8 1193 202.2 1309.67 319C1461 470.2 1534.47 679.8 1510.87 892.333C1495.27 1033 1437 1166.07 1343.8 1273.4L1332.33 1286.6L1327 1280.73C1324.07 1277.53 1197.67 1142.07 1046.2 979.667C894.733 817.267 682.867 589.933 575.267 474.6L379.667 264.733L386.733 259.133C407.267 242.6 445.267 217.667 476.333 200.333C567.933 149.267 677.4 118.467 785 113.8C805 113 857 114.333 878.333 116.333ZM482.333 541.667C578.067 644.333 789.667 871.267 952.6 1046.07L1249 1363.93L1241.93 1369.53C1211.67 1393.93 1156.73 1427.93 1117 1446.73C1040.33 1483 963.667 1504.07 877 1512.47C828.867 1517.13 761 1515.13 710.333 1507.53C561 1484.87 425.933 1416.6 319 1309.67C167.667 1158.47 94.2 948.867 117.8 736.333C133.4 595.667 191.667 462.6 284.867 355.267L296.333 342.067L302.333 348.6C305.667 352.2 386.6 439.133 482.333 541.667Z" fill="#505050"/>
                            </svg>
                            <img class="cart_adm_img hide" loading="lazy" fetchpriority="auto" aria-hidden="true" draggable="false" style="object-fit: contain; object-position: 50% 50%;"></img>
                            <label for="fileInput" class="upload_img">
                                <svg class="add_category_svg" width="28" height="28" viewBox="0 0 14 14" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 1V13" stroke-width="2" stroke-linecap="round" />
                                    <path d="M1 7H13" stroke-width="2" stroke-linecap="round" />
                                </svg>
                            </label>
                        </div>
                        <div class="type_toggle">
                            <div class="type_category choiced">Категория</div>
                            <div class="type_product">Товар</div>
                        </div>
                        <input type="file" id="fileInput" accept="image/*" required>
                        <input class="cart_name_input" type="text" placeholder="Название *" />
                        <textarea class="cart_discript_input" type="text" placeholder="Описание" rows="4"></textarea>
                        <input class="cart_count_input hide" type="text" placeholder="Количество *" />
                        <input class="cart_price_input hide" type="text" placeholder="Цена *" />
                    </div>
                    <div class="save_category disactive_but">
                        <p class="save_category_text">Сохранить</p>
                    </div>
                </article>`
        adm_add_category();
    }
    show_cart();
    add();
    open_categories();
    back_to_category();
};


function create_basket(basket_list) {
    let basket_product = document.getElementsByClassName('basket_product');
    for (let i = 0; i < basket_product.length;) {
        basket_product[0].remove();
    };
    let basket_empty = document.getElementsByClassName('basket_empty')[0];
    let basket_full = document.getElementsByClassName('basket_full')[0];
    let basket_product_list = document.getElementsByClassName('basket_product_list')[0];
    let basket_path = document.getElementsByClassName('basket_path')[0];
    let form_path = document.getElementsByClassName('form_path')[0];
    let form = document.getElementsByClassName('form')[0];
    basket_path.classList.remove('hide');
    form_path.classList.add('hide');
    form.classList.add('hide');
    if (basket_list['items'].length > 0) {
        basket_empty.classList.add('hide');
        basket_full.classList.remove('hide');
        for (let i = 0; i < basket_list['items'].length; i++) {
            let disactive_flag = '';
            let disactive_flag_minus = '';
            let hide_flag = 'hide';
            let product_count = 0;
            if (basket_products_list[basket_list['items'][i]['id']]) {
                product_count = basket_products_list[basket_list['items'][i]['id']];
                hide_flag = '';
                if (product_count == basket_list['items'][i]['product']['setting']['count']) {
                    disactive_flag = 'disactive';
                };
                if (basket_list['items'][i]['count'] <= 1) {
                    disactive_flag_minus = 'disactive';
                }
            };
            let basket_product = document.createElement('article');
            basket_product_list.append(basket_product);
            basket_product.outerHTML = `<article class="basket_product" id="${parseInt(basket_list['items'][i]['id'])}">
                        <div class="container">
                            <img src="${basket_list['items'][i]['product']['design']['image']}" class="basket_product_img" loading="lazy" fetchpriority="auto" aria-hidden="true" draggable="false" style="object-fit: contain; object-position: 50% 50%;">
                        </div>
                        <div class="basket_product_info">
                            <p class="basket_product_name">${basket_list['items'][i]['product']['design']['title']}</p>
                            <div class="basket_product_price_info">
                                <p class="basket_product_price">${basket_list['items'][i]['price']}</p>
                            </div>
                            <svg class="basket_product_trash" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.9375 28C8.21563 28 7.59744 27.7387 7.08294 27.216C6.56844 26.6933 6.31163 26.0658 6.3125 25.3333V8H6C5.44772 8 5 7.55228 5 7C5 6.44772 5.44772 6 6 6H11.5625V5C11.5625 4.44772 12.0102 4 12.5625 4H18.4375C18.9898 4 19.4375 4.44772 19.4375 5V6H25C25.5523 6 26 6.44772 26 7C26 7.55228 25.5523 8 25 8H24.6875V25.3333C24.6875 26.0667 24.4303 26.6947 23.9158 27.2173C23.4013 27.74 22.7835 28.0009 22.0625 28H8.9375ZM22.7158 8H8.5V26L22.7158 26V8ZM12 21.6667C12 22.219 12.4477 22.6667 13 22.6667C13.5523 22.6667 14 22.219 14 21.6667V11.6667C14 11.1144 13.5523 10.6667 13 10.6667C12.4477 10.6667 12 11.1144 12 11.6667V21.6667ZM17 21.6667C17 22.219 17.4477 22.6667 18 22.6667C18.5523 22.6667 19 22.219 19 21.6667V11.6667C19 11.1144 18.5523 10.6667 18 10.6667C17.4477 10.6667 17 11.1144 17 11.6667V21.6667Z" fill="#454545"/>
                            </svg>
                            <div class="basket_product_count hide">${basket_list['items'][i]['product']['setting']['count']}</div>
                            <div class="basket_product_add">
                                <svg class="basket_product_minus ${hide_flag} ${disactive_flag_minus}" width="14" height="2" viewBox="0 0 14 2"
                                    fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 1H13" stroke-width="2" stroke-linecap="round" />
                                </svg>
                                </svg>
                                <p class="basket_product_add_text ${hide_flag}">${basket_list['items'][i]['count']}</p>
                                <svg class="basket_product_plus ${disactive_flag}" width="14" height="14" viewBox="0 0 14 14" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 1V13" stroke-width="2" stroke-linecap="round" />
                                    <path d="M1 7H13" stroke-width="2" stroke-linecap="round" />
                                </svg>
                            </div>
                        </div>
                    </article>`;
        };
    };
    let result_text_sum = document.getElementsByClassName('result_text_sum')[0];
    let pay_text_sum = document.getElementsByClassName('pay_text_sum')[0];
    result_text_sum.textContent = basket_list['sum_full'];
    if (delivery == 'pickup') {
        pay_text_sum.textContent = basket_list['sum_full'];
    } else if (delivery == 'courier') {
        if (parseInt(basket_list['sum_full'].slice(0, -2)) < 1000) {
            pay_text_sum.textContent = parseInt(basket_list['sum_full'].slice(0, -2)) + 150 + ' ₽';
        }
    };
    add_basket();
    delete_product();
};


function add() { //Манипуляция количеством
    let product = document.getElementsByClassName('product');
    let cart_product = document.getElementsByClassName('cart_product');
    for (let i = 0; i < product.length; i++) {
        let minus = document.getElementsByClassName('product')[i].getElementsByClassName('minus')[0];
        let cart_minus = cart_product[i].getElementsByClassName('cart_minus')[0];
        let add_text = document.getElementsByClassName('product')[i].getElementsByClassName('add_text')[0];
        let cart_add_text = cart_product[i].getElementsByClassName('cart_add_text')[0];
        let plus = document.getElementsByClassName('product')[i].getElementsByClassName('plus')[0];
        let cart_plus = cart_product[i].getElementsByClassName('cart_plus')[0];
        let count = document.getElementsByClassName('product')[i].getElementsByClassName('count')[0];
        let cart_count = cart_product[i].getElementsByClassName('cart_count')[0];
        let add_none_text = document.getElementsByClassName('product')[i].getElementsByClassName('add_none_text')[0];
        let cart_add_none_text = cart_product[i].getElementsByClassName('cart_add_none_text')[0];
        if (!basket_products_list[product[i].id]) {
            basket_products_list[product[i].id] = 0;
        };
        cart_add_none_text.addEventListener('click', () => {
            add_none_text.classList.add('hide');
            cart_add_none_text.classList.add('hide');
            plus.classList.remove('hide');
            cart_plus.classList.remove('hide');
            minus.classList.remove('hide');
            add_text.classList.remove('hide');
            add_text.textContent = parseInt(add_text.textContent) + 1;
            cart_minus.classList.remove('hide');
            cart_add_text.classList.remove('hide');
            cart_add_text.textContent = parseInt(cart_add_text.textContent) + 1;
            if ((parseInt(add_text.textContent) > parseInt(count.textContent.slice(11, -4)))) {
                add_text.textContent = parseInt(add_text.textContent) - 1;
                cart_add_text.textContent = parseInt(cart_add_text.textContent) - 1;
            } else {
                basket_products_list[product[i].id] += 1;
                add_product(product[i].id);
            };
            if ((parseInt(add_text.textContent) == parseInt(count.textContent.slice(11, -4)))) {
                plus.classList.add('disactive');
                cart_plus.classList.add('disactive');
            };
        });
        add_none_text.addEventListener('click', () => {
            add_none_text.classList.add('hide');
            cart_add_none_text.classList.add('hide');
            plus.classList.remove('hide');
            cart_plus.classList.remove('hide');
            minus.classList.remove('hide');
            add_text.classList.remove('hide');
            add_text.textContent = parseInt(add_text.textContent) + 1;
            cart_minus.classList.remove('hide');
            cart_add_text.classList.remove('hide');
            cart_add_text.textContent = parseInt(cart_add_text.textContent) + 1;
            if ((parseInt(add_text.textContent) > parseInt(count.textContent.slice(11, -4)))) {
                add_text.textContent = parseInt(add_text.textContent) - 1;
                cart_add_text.textContent = parseInt(cart_add_text.textContent) - 1;
            } else {
                basket_products_list[product[i].id] += 1;
                add_product(product[i].id);
            };
            if ((parseInt(add_text.textContent) == parseInt(count.textContent.slice(11, -4)))) {
                plus.classList.add('disactive');
                cart_plus.classList.add('disactive');
            };
        });
        plus.addEventListener('click', () => {
            minus.classList.remove('hide');
            add_text.classList.remove('hide');
            add_text.textContent = parseInt(add_text.textContent) + 1;
            cart_minus.classList.remove('hide');
            cart_add_text.classList.remove('hide');
            cart_add_text.textContent = parseInt(cart_add_text.textContent) + 1;
            if ((parseInt(add_text.textContent) > parseInt(count.textContent.slice(11, -4)))) {
                add_text.textContent = parseInt(add_text.textContent) - 1;
                cart_add_text.textContent = parseInt(cart_add_text.textContent) - 1;
            } else {
                basket_products_list[product[i].id] += 1;
                add_product(product[i].id);
            };
            if ((parseInt(add_text.textContent) == parseInt(count.textContent.slice(11, -4)))) {
                plus.classList.add('disactive');
                cart_plus.classList.add('disactive');
            };
        });
        cart_plus.addEventListener('click', () => {
            cart_minus.classList.remove('hide');
            cart_add_text.classList.remove('hide');
            cart_add_text.textContent = parseInt(cart_add_text.textContent) + 1;
            minus.classList.remove('hide');
            add_text.classList.remove('hide');
            add_text.textContent = parseInt(add_text.textContent) + 1;
            if ((parseInt(cart_add_text.textContent) > parseInt(cart_count.textContent.slice(11, -4)))) {
                cart_add_text.textContent = parseInt(cart_add_text.textContent) - 1;
                add_text.textContent = parseInt(add_text.textContent) - 1;
            } else {
                basket_products_list[product[i].id] += 1;
                add_product(product[i].id);
            };
            if ((parseInt(cart_add_text.textContent) == parseInt(cart_count.textContent.slice(11, -4)))) {
                cart_plus.classList.add('disactive');
                plus.classList.add('disactive');
            };
        });
        minus.addEventListener('click', () => {
            basket_products_list[product[i].id] -= 1;
            remove_product(product[i].id);
            add_text.textContent = parseInt(add_text.textContent) - 1;
            cart_add_text.textContent = parseInt(cart_add_text.textContent) - 1;
            if (add_text.textContent <= 0) {
                plus.classList.add('hide');
                cart_plus.classList.add('hide');
                minus.classList.add('hide');
                add_text.classList.add('hide');
                cart_minus.classList.add('hide');
                cart_add_text.classList.add('hide');
                cart_add_none_text.classList.remove('hide');
                add_none_text.classList.remove('hide');
            };
            plus.classList.remove('disactive');
            cart_plus.classList.remove('disactive');
            let basket_full = document.getElementsByClassName('basket_full')[0];
            let basket_empty = document.getElementsByClassName('basket_empty')[0];
            basket_full.classList.add('hide');
            basket_empty.classList.remove('hide');
            for (let j = 0; j < basket_products_list.length; j++) {
                if (basket_products_list[product[j].id] > 0) {
                    basket_full.classList.remove('hide');
                    basket_empty.classList.add('hide');
                }
            };
        });
        cart_minus.addEventListener('click', () => {
            basket_products_list[product[i].id] -= 1;
            remove_product(product[i].id);
            cart_add_text.textContent = parseInt(cart_add_text.textContent) - 1;
            add_text.textContent = parseInt(add_text.textContent) - 1;
            if (cart_add_text.textContent <= 0) {
                plus.classList.add('hide');
                cart_plus.classList.add('hide');
                minus.classList.add('hide');
                add_text.classList.add('hide');
                cart_minus.classList.add('hide');
                cart_add_text.classList.add('hide');
                cart_add_none_text.classList.remove('hide');
                add_none_text.classList.remove('hide');
            };
            cart_plus.classList.remove('disactive');
            plus.classList.remove('disactive');
            let basket_full = document.getElementsByClassName('basket_full')[0];
            let basket_empty = document.getElementsByClassName('basket_empty')[0];
            basket_full.classList.add('hide');
            basket_empty.classList.remove('hide');
            for (let j = 0; j < basket_products_list.length; j++) {
                if (basket_products_list[product[j].id] > 0) {
                    basket_full.classList.remove('hide');
                    basket_empty.classList.add('hide');
                }
            };
        });
    };
};


function add_basket() {
    let basket_product = document.getElementsByClassName('basket_product');
    for (let i = 0; i < basket_product.length; i++) {
        let basket_product_minus = basket_product[i].getElementsByClassName('basket_product_minus')[0];
        let basket_product_add_text = basket_product[i].getElementsByClassName('basket_product_add_text')[0];
        let basket_product_plus = basket_product[i].getElementsByClassName('basket_product_plus')[0];
        let basket_product_count = basket_product[i].getElementsByClassName('basket_product_count')[0];
        basket_product_plus.addEventListener('click', () => {
            basket_product_minus.classList.remove('hide');
            basket_product_add_text.classList.remove('hide');
            basket_product_add_text.textContent = parseInt(basket_product_add_text.textContent) + 1;
            if ((parseInt(basket_product_add_text.textContent) > parseInt(basket_product_count.textContent))) {
                basket_product_add_text.textContent = parseInt(basket_product_add_text.textContent) - 1;
            } else {
                basket_products_list[basket_product[i].id] += 1;
                add_product(basket_product[i].id);
            };
            if ((parseInt(basket_product_add_text.textContent) == parseInt(basket_product_count.textContent))) {
                basket_product_plus.classList.add('disactive');
            };
        });
        basket_product_minus.addEventListener('click', () => {
            if (basket_product_add_text.textContent <= 1) {
                basket_product_minus.classList.add('disactive');
            } else {
                basket_product_add_text.textContent = parseInt(basket_product_add_text.textContent) - 1;
                basket_product_plus.classList.remove('disactive');
                remove_product(basket_product[i].id);
                basket_products_list[basket_product[i].id] -= 1;
            };
        });
    };
};


function delete_product() {
    let basket_product_trash = document.getElementsByClassName('basket_product_trash');
    let basket_product = document.getElementsByClassName('basket_product');
    for (let i = 0; i < basket_product.length; i++) {
        let product_id = basket_product[i].id;
        let product = basket_product[i];
        basket_product_trash[i].addEventListener('click', () => {
            const post_delete_productData = {
                bot_id: bot_id,
                category_id: product_id,
                secret_user_key: user_key,
                user_id: user_id
            };
            let my_delete_productHeaders = new Headers();
            my_delete_productHeaders.append('Content-Type', 'application/json');
            fetch('https://api.bot-t.com/v1/shopcart/cart/remove', {
                method: 'POST',
                headers: my_delete_productHeaders,
                body: JSON.stringify(post_delete_productData),
            }).then((delete_product_data) => {
                return delete_product_data.json();
            }).then((json_delete_product_data) => {
                get_basket();
            });
            product.remove();
            delete basket_products_list[product_id];
            if (basket_product.length < 1) {
                let basket_full = document.getElementsByClassName('basket_full')[0];
                let basket_empty = document.getElementsByClassName('basket_empty')[0];
                basket_full.classList.add('hide');
                basket_empty.classList.remove('hide');
            };
        });
    };
};


function delete_all_product() {
    let delete_but = document.getElementsByClassName('delete')[0];
    delete_but.addEventListener('click', () => {
        let basket_product = document.getElementsByClassName('basket_product');
        for (let i = 0; i < basket_product.length; i++) {
            delete basket_products_list[basket_product[i].id];
        };
        const post_delete_all_productData = {
            bot_id: bot_id,
            secret_user_key: user_key,
            user_id: user_id
        };
        let my_delete_all_productHeaders = new Headers();
        my_delete_all_productHeaders.append('Content-Type', 'application/json');
        fetch('https://api.bot-t.com/v1/shopcart/cart/remove-all', {
            method: 'POST',
            headers: my_delete_all_productHeaders,
            body: JSON.stringify(post_delete_all_productData),
        }).then((delete_all_product_data) => {
            return delete_all_product_data.json();
        });
        let basket_full = document.getElementsByClassName('basket_full')[0];
        let basket_empty = document.getElementsByClassName('basket_empty')[0];
        basket_full.classList.add('hide');
        basket_empty.classList.remove('hide');
    });
};


function show_cart() { //Открытие карточки
    let product = document.getElementsByClassName('product');
    let cart_category = document.getElementsByClassName('cart_category');
    let category = document.getElementsByClassName('category');
    let cart_product = document.getElementsByClassName('cart_product');
    let catalog = document.getElementsByClassName('catalog')[0];
    let cart = document.getElementsByClassName('cart')[0];
    for (let i = 0; i < product.length; i++) {//Открытие карточки продкута
        let img = product[i].getElementsByClassName('img')[0];
        let cart_back = cart_product[i].getElementsByClassName('cart_path')[0];
        img.addEventListener('click', () => {
            catalog.classList.add('hide');
            cart.classList.remove('hide');
            for (let j = 0; j < cart_category.length; j++) {
                cart_category[j].classList.add('hide');
            }
            for (let j = 0; j < cart_product.length; j++) {
                cart_product[j].classList.add('hide');
            }
            cart_product[i].classList.remove('hide');
        });
        cart_back.addEventListener('click', () => {
            catalog.classList.remove('hide');
            cart.classList.add('hide');
            cart_product[i].classList.add('hide');
        });
    };
    if (admin_flag) {
        for (let i = 0; i < category.length; i++) {//Открытие карточки продкута
            let img = category[i].getElementsByClassName('img')[0];
            let cart_back = cart_category[i].getElementsByClassName('cart_path')[0];
            img.addEventListener('click', (event) => {
                event.stopPropagation();
                catalog.classList.add('hide');
                cart.classList.remove('hide');
                for (let j = 0; j < cart_category.length; j++) {
                    cart_category[j].classList.add('hide');
                }
                for (let j = 0; j < cart_product.length; j++) {
                    cart_product[j].classList.add('hide');
                }
                cart_category[i].classList.remove('hide');
            });
            cart_back.addEventListener('click', () => {
                catalog.classList.remove('hide');
                cart.classList.add('hide');
                cart_category[i].classList.add('hide');
            });
        };
    }
};


function findById(data, id) {
    // Проверяем, является ли текущий элемент объектом
    if (typeof data === 'object' && data !== null) {
        // Если у текущего элемента есть свойство 'id' и оно равно искомому, возвращаем элемент
        if (data.id === id) {
            return data;
        }

        // Рекурсивно обходим все свойства объекта
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                const result = findById(data[key], id);
                if (result) {
                    return result;
                }
            }
        }
    }

    // Если элемент не найден, возвращаем null
    return null;
}


function findCategoryById(data, id) {
    // Проверяем, является ли текущий элемент объектом
    if (typeof data === 'object' && data !== null) {
        // Если у текущего элемента есть свойство 'id' и оно равно искомому, возвращаем его category_id
        if (data.id === id) {
            return data.category_id;
        }

        // Рекурсивно обходим все свойства объекта
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                const result = findCategoryById(data[key], id);
                if (result !== undefined) {
                    return result;
                }
            }
        }
    }

    // Если элемент не найден, возвращаем undefined
    return undefined;
}


function open_categories() { //открытие категории
    let path = document.getElementsByClassName('path')[0];
    let category_list = document.getElementsByClassName('category_list')[0];
    let category = document.getElementsByClassName('category');
    let cart_category = document.getElementsByClassName('cart_category');
    let cart_product = document.getElementsByClassName('cart_product');
    let add_cart = document.getElementsByClassName('add_cart');

    for (let i = 0; i < category.length; i++) {
        let open = category[i];
        open.addEventListener('click', () => {
            let category_id = category[i].id;
            let json_data_new = findById(common_json_data, parseInt(category_id));

            path.remove();
            category_list.remove();
            for (let i = 0; i < cart_category.length;) {
                cart_category[0].remove();
            };
            for (let i = 0; i < cart_product.length;) {
                cart_product[0].remove();
            };
            for (let i = 0; i < add_cart.length;) {
                add_cart[0].remove();
            };
            create_categories(json_data_new, parseInt(category_id));
        });
    };
};


function back_to_category() { //Назад в категорию
    let path = document.getElementsByClassName('path')[0];
    let category_list = document.getElementsByClassName('category_list')[0];
    let cart_category = document.getElementsByClassName('cart_category');
    let cart_product = document.getElementsByClassName('cart_product');
    let category_name = document.getElementsByClassName('category_name')[0];
    let add_cart = document.getElementsByClassName('add_cart');

    path.addEventListener('click', () => {
        if (category_name.innerText != 'Главная') {
            let category_id = category_list.id;
            let category_father_id = findCategoryById(common_json_data, parseInt(category_id));
            // let category_father_id = jsonpath.query(common_json_data, `$..[?(@.id == ${category_id})].category_id`);
            let json_data_new;
            if (category_father_id == 0) {
                json_data_new = common_json_data;
            } else {
                json_data_new = findById(common_json_data, parseInt(category_father_id));
                // json_data_new = jsonpath.query(common_json_data, `$..[?(@.id == ${category_father_id})]`);
            };
            path.remove();
            category_list.remove();
            for (let i = 0; i < cart_category.length;) {
                cart_category[0].remove();
            };
            for (let i = 0; i < cart_product.length;) {
                cart_product[0].remove();
            };
            for (let i = 0; i < add_cart.length;) {
                add_cart[0].remove();
            };
            create_categories(json_data_new, category_father_id);
        }
    });
};

let isFormManagActive = true;

function form_manag() {
    if (!isFormManagActive) return;

    const now = new Date();
    // Получаем смещение времени по UTC (в минутах)
    const utcOffset = now.getTimezoneOffset();

    // Московское время (UTC+3)
    const mskOffset = 3 * 60; // 3 часа в минутах

    // Вычисляем время по МСК
    const mskTime = new Date(now.getTime() + (utcOffset + mskOffset) * 60 * 1000);

    // Форматируем время в удобный формат
    const year_msk = mskTime.getFullYear();
    const month_msk = (mskTime.getMonth() + 1).toString().padStart(2, '0'); // Месяцы начинаются с 0
    const day_msk = mskTime.getDate().toString().padStart(2, '0');
    const hours_msk = mskTime.getHours().toString().padStart(2, '0');
    const dayOfWeek = now.getDay();
    let adress_pickup;
    let adress_courier;
    let form_back = document.getElementsByClassName('form_back')[0];
    let time = document.getElementsByClassName('time')[0];
    let date_pickup1 = document.getElementsByClassName('date_pickup1')[0];
    let date_pickup2 = document.getElementsByClassName('date_pickup2')[0];
    let date_courier = document.getElementsByClassName('date_courier')[0];
    let date_pickup1_hour = date_pickup1.getElementsByClassName('hour');
    let date_pickup2_hour = date_pickup2.getElementsByClassName('hour');
    let date_courier_hour = date_courier.getElementsByClassName('hour');
    let date_pickup1_day = date_pickup1.getElementsByClassName('day')[0];
    let date_pickup2_day = date_pickup2.getElementsByClassName('day')[0];
    let date_courier_day = date_courier.getElementsByClassName('day')[0];
    let method_toggle = document.getElementsByClassName('method_toggle')[0];
    let choice_delivery = document.getElementsByClassName('choice_delivery')[0];
    let choice = document.getElementsByClassName('choice')[0];
    let choice_pickup = document.getElementsByClassName('choice_pickup')[0];
    let choice_courier = document.getElementsByClassName('choice_courier')[0];
    let choice_close = document.getElementsByClassName('choice_close')[0];
    let method_pickup = document.getElementsByClassName('method_pickup')[0];
    let method_courier = document.getElementsByClassName('method_courier')[0];
    let method_pickup_info = document.getElementsByClassName('method_pickup_info')[0];
    let method_courier_info = document.getElementsByClassName('method_courier_info')[0];
    let method_pickup_but = document.getElementsByClassName('method_pickup_info')[0];
    let choice_pickup_adress = document.getElementsByClassName('choice_pickup_adress')[0];
    let choice_adress = document.getElementsByClassName('choice_adress')[0];
    let choice_adress_pickup = document.getElementsByClassName('choice_adress_pickup')[0];
    let choice_adress_pickup1 = document.getElementsByClassName('choice_adress_pickup1')[0];
    let choice_adress_close = document.getElementsByClassName('choice_adress_close')[0];
    let pickup_address_text = document.getElementsByClassName('pickup_address_text')[0];
    let pickup_address_text_selected = document.getElementsByClassName('pickup_address_text_selected')[0];
    let pickup_address = document.getElementsByClassName('pickup_address')[0];
    let method_pickup_but_change = document.getElementsByClassName('method_pickup_but_change')[0];
    let method_pickup_but_add = document.getElementsByClassName('method_pickup_but_add')[0];
    let method_courier_but = document.getElementsByClassName('method_courier_but')[0];
    let choice_delivery_adress = document.getElementsByClassName('choice_delivery_adress')[0];
    let choice1 = choice_delivery_adress.getElementsByClassName('choice')[0];
    let choice_delivery_close = document.getElementsByClassName('choice_delivery_close')[0];
    let method_courier_but_change = document.getElementsByClassName('method_courier_but_change')[0];
    let method_courier_but_add = document.getElementsByClassName('method_courier_but_add')[0];
    let courier_address_text = document.getElementsByClassName('courier_address_text')[0];
    let courier_address_text_selected = document.getElementsByClassName('courier_address_text_selected')[0];
    let courier_address = document.getElementsByClassName('courier_address')[0];
    let delivery_adress = document.getElementsByClassName('delivery_adress')[0];
    let phone = document.getElementsByClassName('phone')[0];
    let comment = document.getElementsByClassName('comment')[0];
    let transfer = document.getElementsByClassName('transfer')[0];
    let pay = document.getElementsByClassName('pay')[0];
    let cash = document.getElementsByClassName('cash')[0];
    let pay_but = document.getElementsByClassName('pay_but')[0];

    const hoursContainer = document.querySelector('.hours');
    let isDragging = false;
    let startX, scrollLeft;

    // Начало перетаскивания
    hoursContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.pageX - hoursContainer.offsetLeft;
        scrollLeft = hoursContainer.scrollLeft;
    });

    // Во время перетаскивания
    hoursContainer.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - hoursContainer.offsetLeft;
        const walk = (x - startX) * 1.5; // Умножаем на 1.5 для более плавного скролла
        hoursContainer.scrollLeft = scrollLeft - walk;
    });

    // Конец перетаскивания
    hoursContainer.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Выход курсора за пределы контейнера
    hoursContainer.addEventListener('mouseleave', () => {
        isDragging = false;
    });

    // Для touch-устройств (телефоны/планшеты)
    hoursContainer.addEventListener('touchstart', (e) => {
        isDragging = true;
        startX = e.touches[0].pageX - hoursContainer.offsetLeft;
        scrollLeft = hoursContainer.scrollLeft;
    });

    hoursContainer.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const x = e.touches[0].pageX - hoursContainer.offsetLeft;
        const walk = (x - startX) * 1.5;
        hoursContainer.scrollLeft = scrollLeft - walk;
    });

    hoursContainer.addEventListener('touchend', () => {
        isDragging = false;
    });



    form_back.addEventListener('click', () => {
        isFormManagActive = false;
    });

    function date_pickup1_manag(hours_msk) {
        for (let j = 0; j < date_pickup1_hour.length; j++) {
            date_pickup1_hour[j].classList.remove('active_input');
        }
        for (let i = 0; i < date_pickup1_hour.length; i++) {
            if (!(parseInt(date_pickup1_hour[i].textContent.split(":")[0]) >= parseInt(hours_msk))) {
                date_pickup1_hour[i].classList.add('hide');
            } else {
                date_pickup1_hour[i].classList.remove('hide');
                date_pickup1_hour[i].addEventListener('click', () => {
                    for (let j = 0; j < date_pickup1_hour.length; j++) {
                        date_pickup1_hour[j].classList.remove('active_input');
                    }
                    date_pickup1_hour[i].classList.add('active_input');
                    pay_check()
                });
            };
        };
    };
    function date_pickup2_manag(hours_msk) {
        for (let j = 0; j < date_pickup2_hour.length; j++) {
            date_pickup2_hour[j].classList.remove('active_input');
        }
        for (let i = 0; i < date_pickup2_hour.length; i++) {
            if (!(parseInt(date_pickup2_hour[i].textContent.split(":")[0]) >= parseInt(hours_msk) + 1)) {
                date_pickup2_hour[i].classList.add('hide');
            } else {
                date_pickup2_hour[i].classList.remove('hide');
                date_pickup2_hour[i].addEventListener('click', () => {
                    for (let j = 0; j < date_pickup2_hour.length; j++) {
                        date_pickup2_hour[j].classList.remove('active_input');
                    }
                    date_pickup2_hour[i].classList.add('active_input');
                    pay_check()
                });
            };
        };
    };
    function date_courier_manag(hours_msk) {
        for (let j = 0; j < date_courier_hour.length; j++) {
            date_courier_hour[j].classList.remove('active_input');
        }
        for (let i = 0; i < date_courier_hour.length; i++) {
            if (!(parseInt(date_courier_hour[i].textContent.split(":")[0]) >= parseInt(hours_msk) + 1)) {
                date_courier_hour[i].classList.add('hide');
            } else {
                date_courier_hour[i].classList.remove('hide');
                date_courier_hour[i].addEventListener('click', () => {
                    for (let j = 0; j < date_courier_hour.length; j++) {
                        date_courier_hour[j].classList.remove('active_input');
                    }
                    date_courier_hour[i].classList.add('active_input');
                    pay_check()
                });
            };
        };
    };

    // function date_pickup1_hour_num_manag() {
    //     if (!(date_pickup1_hour[date_pickup1_hour.length - 1].textContent.split(":")[0] - hours_msk <= 0)) {
    //         date_pickup1_manag(hours_msk);
    //         date_pickup1_day.value = `${year_msk}-${month_msk}-${day_msk}`;
    //         date_pickup1_day.min = `${year_msk}-${month_msk}-${day_msk}`;
    //         date_pickup1_day.max = `${year_msk}-${month_msk}-${parseInt(day_msk) + 2}`;
    //     } else {
    //         date_pickup1_manag(0);
    //         date_pickup1_day.value = `${year_msk}-${month_msk}-${parseInt(day_msk) + 1}`;
    //         date_pickup1_day.min = `${year_msk}-${month_msk}-${parseInt(day_msk) + 1}`;
    //         date_pickup1_day.max = `${year_msk}-${month_msk}-${parseInt(day_msk) + 3}`;
    //     };
    // };
    // function date_pickup2_hour_num_manag() {
    //     if (!(date_pickup2_hour[date_pickup2_hour.length - 1].textContent.split(":")[0] - hours_msk <= 0) && !(dayOfWeek == 0) && !(dayOfWeek == 6)) {
    //         date_pickup2_manag(hours_msk);
    //         date_pickup2_day.value = `${year_msk}-${month_msk}-${day_msk}`;
    //         date_pickup2_day.min = `${year_msk}-${month_msk}-${day_msk}`;
    //         date_pickup2_day.max = `${year_msk}-${month_msk}-${parseInt(day_msk) + 2}`;
    //     } else if ((date_pickup2_hour[date_pickup2_hour.length - 1].textContent.split(":")[0] - hours_msk <= 0) && !(dayOfWeek == 0) && !(dayOfWeek == 6)) {
    //         date_pickup2_manag(0);
    //         date_pickup2_day.value = `${year_msk}-${month_msk}-${parseInt(day_msk) + 1}`;
    //         date_pickup2_day.min = `${year_msk}-${month_msk}-${parseInt(day_msk) + 1}`;
    //         date_pickup2_day.max = `${year_msk}-${month_msk}-${parseInt(day_msk) + 3}`;
    //     } else if (dayOfWeek == 6) {
    //         date_pickup2_manag(0);
    //         date_pickup2_day.value = `${year_msk}-${month_msk}-${parseInt(day_msk) + 2}`;
    //         date_pickup2_day.min = `${year_msk}-${month_msk}-${parseInt(day_msk) + 2}`;
    //         date_pickup2_day.max = `${year_msk}-${month_msk}-${parseInt(day_msk) + 2}`;
    //     } else if (dayOfWeek == 0) {
    //         date_pickup2_manag(0);
    //         date_pickup2_day.value = `${year_msk}-${month_msk}-${parseInt(day_msk) + 1}`;
    //         date_pickup2_day.min = `${year_msk}-${month_msk}-${parseInt(day_msk) + 1}`;
    //         date_pickup2_day.max = `${year_msk}-${month_msk}-${parseInt(day_msk) + 2}`;
    //     };
    // };
    // function date_courier_hour_num_manag() {
    //     if (!(date_courier_hour[date_courier_hour.length - 1].textContent.split(":")[0] - hours_msk <= 0)) {
    //         date_courier_manag(hours_msk);
    //         date_courier_day.value = `${year_msk}-${month_msk}-${day_msk}`;
    //         date_courier_day.min = `${year_msk}-${month_msk}-${day_msk}`;
    //         date_courier_day.max = `${year_msk}-${month_msk}-${parseInt(day_msk) + 2}`;
    //     } else {
    //         date_courier_manag(0);
    //         date_courier_day.value = `${year_msk}-${month_msk}-${parseInt(day_msk) + 1}`;
    //         date_courier_day.min = `${year_msk}-${month_msk}-${parseInt(day_msk) + 1}`;
    //         date_courier_day.max = `${year_msk}-${month_msk}-${parseInt(day_msk) + 3}`;
    //     };
    // };

    function getNextDays(year, month, day, daysToAdd) {
        const date = new Date(year, month - 1, day); // month - 1, так как в JS месяцы 0-11
        date.setDate(date.getDate() + daysToAdd);

        return {
            year: date.getFullYear(),
            month: String(date.getMonth() + 1).padStart(2, '0'), // +1 и форматирование до 2 цифр
            day: String(date.getDate()).padStart(2, '0')
        };
    }

    function date_pickup1_hour_num_manag() {
        const lastHour = parseInt(date_pickup1_hour[date_pickup1_hour.length - 1].textContent.split(":")[0]);
        const isTodayAvailable = lastHour - hours_msk > 0;

        if (isTodayAvailable) {
            date_pickup1_manag(hours_msk);
            const nextDay = getNextDays(year_msk, month_msk, day_msk, 0);
            const maxDay = getNextDays(year_msk, month_msk, day_msk, 2);

            date_pickup1_day.value = `${nextDay.year}-${nextDay.month}-${nextDay.day}`;
            date_pickup1_day.min = `${nextDay.year}-${nextDay.month}-${nextDay.day}`;
            date_pickup1_day.max = `${maxDay.year}-${maxDay.month}-${maxDay.day}`;
        } else {
            date_pickup1_manag(0);
            const nextDay = getNextDays(year_msk, month_msk, day_msk, 1);
            const maxDay = getNextDays(year_msk, month_msk, day_msk, 3);

            date_pickup1_day.value = `${nextDay.year}-${nextDay.month}-${nextDay.day}`;
            date_pickup1_day.min = `${nextDay.year}-${nextDay.month}-${nextDay.day}`;
            date_pickup1_day.max = `${maxDay.year}-${maxDay.month}-${maxDay.day}`;
        }
    }

    function date_pickup2_hour_num_manag() {
        const lastHour = parseInt(date_pickup2_hour[date_pickup2_hour.length - 1].textContent.split(":")[0]);
        const isTodayAvailable = lastHour - hours_msk > 0;

        if (isTodayAvailable && ![0, 6].includes(dayOfWeek)) {
            date_pickup2_manag(hours_msk);
            const nextDay = getNextDays(year_msk, month_msk, day_msk, 0);
            const maxDay = getNextDays(year_msk, month_msk, day_msk, 2);

            date_pickup2_day.value = `${nextDay.year}-${nextDay.month}-${nextDay.day}`;
            date_pickup2_day.min = `${nextDay.year}-${nextDay.month}-${nextDay.day}`;
            date_pickup2_day.max = `${maxDay.year}-${maxDay.month}-${maxDay.day}`;
        } else if (!isTodayAvailable && ![0, 6].includes(dayOfWeek)) {
            date_pickup2_manag(0);
            const nextDay = getNextDays(year_msk, month_msk, day_msk, 1);
            const maxDay = getNextDays(year_msk, month_msk, day_msk, 3);

            date_pickup2_day.value = `${nextDay.year}-${nextDay.month}-${nextDay.day}`;
            date_pickup2_day.min = `${nextDay.year}-${nextDay.month}-${nextDay.day}`;
            date_pickup2_day.max = `${maxDay.year}-${maxDay.month}-${maxDay.day}`;
        } else if (dayOfWeek === 6) {
            date_pickup2_manag(0);
            const nextDay = getNextDays(year_msk, month_msk, day_msk, 2);

            date_pickup2_day.value = `${nextDay.year}-${nextDay.month}-${nextDay.day}`;
            date_pickup2_day.min = `${nextDay.year}-${nextDay.month}-${nextDay.day}`;
            date_pickup2_day.max = `${nextDay.year}-${nextDay.month}-${nextDay.day}`;
        } else if (dayOfWeek === 0) {
            date_pickup2_manag(0);
            const nextDay = getNextDays(year_msk, month_msk, day_msk, 1);
            const maxDay = getNextDays(year_msk, month_msk, day_msk, 2);

            date_pickup2_day.value = `${nextDay.year}-${nextDay.month}-${nextDay.day}`;
            date_pickup2_day.min = `${nextDay.year}-${nextDay.month}-${nextDay.day}`;
            date_pickup2_day.max = `${maxDay.year}-${maxDay.month}-${maxDay.day}`;
        }
    }

    function date_courier_hour_num_manag() {
        const lastHour = parseInt(date_courier_hour[date_courier_hour.length - 1].textContent.split(":")[0]);
        const isTodayAvailable = lastHour - hours_msk > 0;

        if (isTodayAvailable) {
            date_courier_manag(hours_msk);
            const nextDay = getNextDays(year_msk, month_msk, day_msk, 0);
            const maxDay = getNextDays(year_msk, month_msk, day_msk, 2);

            date_courier_day.value = `${nextDay.year}-${nextDay.month}-${nextDay.day}`;
            date_courier_day.min = `${nextDay.year}-${nextDay.month}-${nextDay.day}`;
            date_courier_day.max = `${maxDay.year}-${maxDay.month}-${maxDay.day}`;
        } else {
            date_courier_manag(0);
            const nextDay = getNextDays(year_msk, month_msk, day_msk, 1);
            const maxDay = getNextDays(year_msk, month_msk, day_msk, 3);

            date_courier_day.value = `${nextDay.year}-${nextDay.month}-${nextDay.day}`;
            date_courier_day.min = `${nextDay.year}-${nextDay.month}-${nextDay.day}`;
            date_courier_day.max = `${maxDay.year}-${maxDay.month}-${maxDay.day}`;
        }
    }

    date_pickup1_day.addEventListener('input', () => {
        if (date_pickup1_day.value == `${year_msk}-${month_msk}-${day_msk}`) {

            date_pickup1_manag(hours_msk);
        } else {
            date_pickup1_manag(0);
        };
    });
    date_pickup2_day.addEventListener('input', () => {
        if (date_pickup2_day.value == `${year_msk}-${month_msk}-${day_msk}`) {
            date_pickup2_manag(hours_msk);
        } else {
            date_pickup2_manag(0);
        };
    });
    date_courier_day.addEventListener('input', () => {
        if (date_courier_day.value == `${year_msk}-${month_msk}-${day_msk}`) {
            date_courier_manag(hours_msk);
        } else {
            date_courier_manag(0);
        };
    });

    // date_pickup2_day.addEventListener('change', function () {
    //     // Проверяем, является ли день субботой (6) или воскресеньем (0)
    //     if (dayOfWeek === 0) {
    //         this.value = `${year_msk}-${month_msk}-${parseInt(day_msk) + 1}`;
    //     } else if (dayOfWeek === 6) {
    //         this.value = `${year_msk}-${month_msk}-${parseInt(day_msk) + 2}`;
    //     }
    // });

    date_pickup1_day.addEventListener('change', function () {
        const selectedDate = new Date(this.value);
        const minDate = new Date(this.min);
        const maxDate = new Date(this.max);

        if (selectedDate < minDate || selectedDate > maxDate || selectedDate == `Invalid Date`) {
            this.value = `${year_msk}-${month_msk}-${day_msk}`; // Сброс значения, если дата вне диапазона
            date_pickup1_manag(hours_msk);
        };
    });
    date_pickup2_day.addEventListener('change', function () {
        const selectedDate = new Date(this.value);
        const minDate = new Date(this.min);
        const maxDate = new Date(this.max);

        if (selectedDate < minDate || selectedDate > maxDate || selectedDate == `Invalid Date`) {
            this.value = `${year_msk}-${month_msk}-${day_msk}`; // Сброс значения, если дата вне диапазона
            date_pickup2_manag(hours_msk);
        }
    });
    date_courier_day.addEventListener('change', function () {
        const selectedDate = new Date(this.value);
        const minDate = new Date(this.min);
        const maxDate = new Date(this.max);

        if (selectedDate < minDate || selectedDate > maxDate || selectedDate == `Invalid Date`) {
            this.value = `${year_msk}-${month_msk}-${day_msk}`; // Сброс значения, если дата вне диапазона
            date_courier_manag(hours_msk);
        };
    });

    method_toggle.addEventListener('click', () => {
        choice_delivery.classList.remove('hide');
    });
    choice_delivery.addEventListener('click', function (event) {
        // Проверяем, не является ли кликнутый элемент частью choice
        if (!choice.contains(event.target)) {
            // Добавляем класс hide, если клик был вне choice
            choice_delivery.classList.add('hide');
        }
    });
    choice.addEventListener('click', function (event) {
        event.stopPropagation(); // Останавливаем всплытие события
    });
    choice_pickup.addEventListener('click', () => {
        delivery = 'pickup';
        form_data.method = 'pickup'
        choice_courier.classList.remove('choiced');
        choice_pickup.classList.add('choiced');
    });
    choice_courier.addEventListener('click', () => {
        delivery = 'courier';
        form_data.method = 'courier'
        choice_pickup.classList.remove('choiced');
        choice_courier.classList.add('choiced');
    });
    choice_close.addEventListener('click', () => {
        pay_check();
        let pay_text_sum = document.getElementsByClassName('pay_text_sum')[0];
        choice_delivery.classList.add('hide');
        if (delivery == 'pickup') {
            method_pickup.classList.remove('hide');
            method_courier.classList.add('hide');
            method_pickup_info.classList.remove('hide');
            method_courier_info.classList.add('hide');
            date_courier.classList.add('hide');
            if (adress_pickup == choice_adress_pickup.getElementsByClassName('choice_point')[0].textContent) {
                date_pickup1.classList.remove('hide');
                time.classList.remove('hide');
            } else if (adress_pickup == choice_adress_pickup1.getElementsByClassName('choice_point')[0].textContent) {
                date_pickup2.classList.remove('hide');
                time.classList.remove('hide');
            };
            pay_text_sum.textContent = basket_list['sum_full'];
        } else if (delivery == 'courier') {
            method_pickup.classList.add('hide');
            method_courier.classList.remove('hide');
            method_pickup_info.classList.add('hide');
            method_courier_info.classList.remove('hide');
            date_pickup2.classList.add('hide');
            date_pickup1.classList.add('hide');
            time.classList.add('hide');
            if (adress_courier) {
                date_courier.classList.remove('hide');
                time.classList.remove('hide');
            };
            if (parseInt(basket_list['sum_full'].slice(0, -2)) < 1000) {
                pay_text_sum.textContent = parseInt(basket_list['sum_full'].slice(0, -2)) + 150 + ' ₽';
            }
        };
    });
    method_pickup_but.addEventListener('click', () => {
        choice_pickup_adress.classList.remove('hide');
    });
    choice_pickup_adress.addEventListener('click', function (event) {
        // Проверяем, не является ли кликнутый элемент частью choice
        if (!choice_adress.contains(event.target)) {
            // Добавляем класс hide, если клик был вне choice
            choice_pickup_adress.classList.add('hide');
        }
    });
    choice_adress.addEventListener('click', function (event) {
        event.stopPropagation(); // Останавливаем всплытие события
    });
    choice_adress_pickup.addEventListener('click', () => {
        adress_pickup = choice_adress_pickup.getElementsByClassName('choice_point')[0].textContent;
        form_data.adressPickup = choice_adress_pickup.getElementsByClassName('choice_point')[0].textContent;
        choice_adress_pickup1.classList.remove('choiced');
        choice_adress_pickup.classList.add('choiced');
    });
    choice_adress_pickup1.addEventListener('click', () => {
        adress_pickup = choice_adress_pickup1.getElementsByClassName('choice_point')[0].textContent;
        form_data.adressPickup = choice_adress_pickup1.getElementsByClassName('choice_point')[0].textContent;
        choice_adress_pickup1.classList.add('choiced');
        choice_adress_pickup.classList.remove('choiced');
    });
    choice_adress_close.addEventListener('click', () => {
        method_pickup_but_change.classList.add('hide');
        method_pickup_but_add.classList.remove('hide');
        choice_pickup_adress.classList.add('hide');
        pickup_address_text.classList.add('hide');
        pickup_address_text_selected.classList.remove('hide');
        pickup_address.classList.remove('hide');
        pickup_address.textContent = adress_pickup;
        if (!adress_pickup) {
            adress_pickup = choice_adress.getElementsByClassName('choiced')[0].getElementsByClassName('choice_point')[0].textContent;
            form_data.adressPickup = choice_adress.getElementsByClassName('choiced')[0].getElementsByClassName('choice_point')[0].textContent;
            pay_check();
            pickup_address.textContent = adress_pickup;
        };
        if (adress_pickup == choice_adress_pickup1.getElementsByClassName('choice_point')[0].textContent) {
            date_courier.classList.add('hide');
            date_pickup2.classList.remove('hide');
            date_pickup1.classList.add('hide');
            time.classList.remove('hide');
            date_pickup2_hour_num_manag();
        } else if (adress_pickup == choice_adress_pickup.getElementsByClassName('choice_point')[0].textContent) {
            date_courier.classList.add('hide');
            date_pickup2.classList.add('hide');
            date_pickup1.classList.remove('hide');
            time.classList.remove('hide');
            date_pickup1_hour_num_manag();
        };
        pay_check();
    });
    method_courier_info.addEventListener('click', () => {
        choice_delivery_adress.classList.remove('hide');
    });
    choice_delivery_adress.addEventListener('click', function (event) {
        // Проверяем, не является ли кликнутый элемент частью choice
        if (!choice1.contains(event.target)) {
            // Добавляем класс hide, если клик был вне choice
            choice_delivery_adress.classList.add('hide');
        }
    });
    choice1.addEventListener('click', function (event) {
        event.stopPropagation(); // Останавливаем всплытие события
    });
    delivery_adress.addEventListener('input', () => {
        delivery_adress.classList.remove('incorrect');
        if (delivery_adress.value.trim() !== '') {
            choice_delivery_close.classList.remove('disactive_but');
            delivery_adress.classList.add('active_input');
        } else {
            choice_delivery_close.classList.add('disactive_but');
            delivery_adress.classList.remove('active_input');
        };
    });
    choice_delivery_close.addEventListener('click', () => {
        if (!choice_delivery_close.classList.contains('disactive_but')) {
            method_courier_but_change.classList.add('hide');
            method_courier_but_add.classList.remove('hide');
            choice_delivery_adress.classList.add('hide');
            courier_address_text.classList.add('hide');
            courier_address_text_selected.classList.remove('hide');
            courier_address.classList.remove('hide');
            courier_address.textContent = delivery_adress.value;
            adress_courier = delivery_adress.value;
            form_data.adressCourier = delivery_adress.value;
            pay_check();
            date_courier.classList.remove('hide');
            date_pickup2.classList.add('hide');
            date_pickup1.classList.add('hide');
            time.classList.remove('hide');
            date_courier_hour_num_manag();
        } else {
            delivery_adress.classList.add('incorrect');
        };
    });


    phone.addEventListener('focus', function () {
        if (!phone.value) {
            phone.value = '+7'; // Устанавливаем начальное значение
        }
    });
    phone.addEventListener('input', function (e) {
        const value = e.target.value.replace(/\D/g, ''); // Удаляем все нецифровые символы
        let formattedValue = '+7';

        if (value.length > 1) {
            formattedValue += value.substring(1, 4);
        }
        if (value.length >= 4) {
            formattedValue += value.substring(4, 7);
        }
        if (value.length >= 7) {
            formattedValue += value.substring(7, 9);
        }
        if (value.length >= 9) {
            formattedValue += value.substring(9, 11);
        }

        e.target.value = formattedValue;
    });
    phone.addEventListener('blur', function (e) {
        const value = e.target.value;
        const phoneRegex = /^\+7\d{3}\d{3}\d{2}\d{2}$/;

        if (!phoneRegex.test(value)) {
            phone.classList.add('incorrect');
            phone.classList.remove('active_input');
            form_data.phone = null;
            pay_check();
        } else {
            phone.classList.add('active_input');
            phone.classList.remove('incorrect');
            form_data.phone = value;
            pay_check();
        }
    });
    comment.addEventListener('blur', function () {
        comment.classList.add('active_input');
    });
    comment.addEventListener('input', function () {
        form_data.comment = comment.value;
        pay_check();
    });

    transfer.addEventListener('click', () => {
        transfer.classList.add('active_input');
        cash.classList.remove('active_input');
        form_data.pay = transfer.textContent;
        pay_check();
    });
    cash.addEventListener('click', () => {
        cash.classList.add('active_input');
        transfer.classList.remove('active_input');
        form_data.pay = cash.textContent;
        pay_check();
    });
    pay_but.addEventListener('click', () => {
        if (form_data.method == "pickup") {
            if (!form_data.adressPickup) {
                document.getElementsByClassName('method_pickup_but_change')[0].classList.add('incorrect_svg');
                document.getElementsByClassName('method_pickup_but_add')[0].classList.add('incorrect_svg');
                setTimeout(function () {
                    document.getElementsByClassName('method_pickup_but_change')[0].classList.remove('incorrect_svg');
                    document.getElementsByClassName('method_pickup_but_add')[0].classList.remove('incorrect_svg');
                }, 1000);
            };
            if (form_data.adressPickup == "Г. Мурманск, ул. Достоевского 3") {
                form_data.date = date_pickup1_day.value;
                if (date_pickup1.getElementsByClassName('active_input')[0]) {
                    form_data.time = date_pickup1.getElementsByClassName('active_input')[0].textContent;
                } else {
                    form_data.time = null;
                };
                if (!form_data.time) {
                    for (let i = 0; i < date_pickup1_hour.length; i++) {
                        date_pickup1_hour[i].classList.add('incorrect');
                    };
                    setTimeout(function () {
                        for (let i = 0; i < date_pickup1_hour.length; i++) {
                            date_pickup1_hour[i].classList.remove('incorrect');
                        }
                    }, 1000);
                };
            } else {
                form_data.date = date_pickup2_day.value;
                if (date_pickup2.getElementsByClassName('active_input')[0]) {
                    form_data.time = date_pickup2.getElementsByClassName('active_input')[0].textContent;
                } else {
                    form_data.time = null;
                };
                if (!form_data.time) {
                    for (let i = 0; i < date_pickup2_hour.length; i++) {
                        date_pickup2_hour[i].classList.add('incorrect');
                    };
                    setTimeout(function () {
                        for (let i = 0; i < date_pickup2_hour.length; i++) {
                            date_pickup2_hour[i].classList.remove('incorrect');
                        }
                    }, 1000);
                };
            };
        } else {
            form_data.date = date_courier_day.value;
            if (!form_data.adressCourier) {
                document.getElementsByClassName('method_courier_but_change')[0].classList.add('incorrect_svg');
                document.getElementsByClassName('method_courier_but_add')[0].classList.add('incorrect_svg');
                setTimeout(function () {
                    document.getElementsByClassName('method_courier_but_change')[0].classList.remove('incorrect_svg');
                    document.getElementsByClassName('method_courier_but_add')[0].classList.remove('incorrect_svg');
                }, 1000);
            };
            if (date_courier.getElementsByClassName('active_input')[0]) {
                form_data.time = date_courier.getElementsByClassName('active_input')[0].textContent;
            } else {
                form_data.time = null;
            };
            if (!form_data.time) {
                for (let i = 0; i < date_courier_hour.length; i++) {
                    date_courier_hour[i].classList.add('incorrect');
                };
                setTimeout(function () {
                    for (let i = 0; i < date_courier_hour.length; i++) {
                        date_courier_hour[i].classList.remove('incorrect');
                    }
                }, 1000);
            };
        };
        if (!form_data.pay) {
            transfer.classList.add('incorrect');
            cash.classList.add('incorrect');
            setTimeout(function () {
                transfer.classList.remove('incorrect');
                cash.classList.remove('incorrect');
            }, 1000);
        }
        if (!form_data.phone) {
            phone.classList.add('incorrect');
            setTimeout(function () {
                phone.classList.remove('incorrect');
            }, 1000);
        }
        if (pay_check()) {
            create_order(form_data);
            load();
        };
    });
    function pay_check() {
        if (form_data.method == "pickup") {
            if (form_data.adressPickup == "Г. Мурманск, ул. Достоевского 3") {
                form_data.date = date_pickup1_day.value;
                if (date_pickup1.getElementsByClassName('active_input')[0]) {
                    form_data.time = date_pickup1.getElementsByClassName('active_input')[0].textContent;
                } else {
                    form_data.time = null;
                };
            } else {
                form_data.date = date_pickup2_day.value;
                if (date_pickup2.getElementsByClassName('active_input')[0]) {
                    form_data.time = date_pickup2.getElementsByClassName('active_input')[0].textContent;
                } else {
                    form_data.time = null;
                };
            };
        } else {
            form_data.date = date_courier_day.value;
            if (date_courier.getElementsByClassName('active_input')[0]) {
                form_data.time = date_courier.getElementsByClassName('active_input')[0].textContent;
            } else {
                form_data.time = null;
            };
        };
        if (((form_data.adressCourier) && (form_data.date) && (form_data.pay) && (form_data.phone) && (form_data.time)) || ((form_data.adressPickup) && (form_data.date) && (form_data.pay) && (form_data.phone) && (form_data.time))) {
            if (form_data.method == "pickup" && (form_data.adressPickup == 'Г. Мурманск, ул. Достоевского 3' || form_data.adressPickup == 'Г. Мурманск, ул. Полярной правды 8')) {
                pay_but.classList.remove('disactive_but');
                return true;
            } else if (form_data.method == "courier" && (form_data.adressCourier)) {
                pay_but.classList.remove('disactive_but');
                return true;
            } else {
                pay_but.classList.add('disactive_but');
                return false;
            };
        } else {
            pay_but.classList.add('disactive_but');
            return false;
        }
    }
};


let json_order_data;



function load() {
    let loading = document.getElementsByClassName('loading')[0];
    loading.classList.remove('hide');
};


function create_order() {
    const post_create_orderData = {
        bot_id: bot_id,
        secret_user_key: user_key,
        user_id: user_id
    };
    let my_create_orderHeaders = new Headers();
    my_create_orderHeaders.append('Content-Type', 'application/json');
    fetch('https://api.bot-t.com/v1/shopcart/order/create', {
        method: 'POST',
        headers: my_create_orderHeaders,
        body: JSON.stringify(post_create_orderData),
    }).then((order_data) => {
        return order_data.json();
    }).then((json_order_data) => {
        edit_massage(json_order_data);
    });
}


function edit_massage(json_order_data) {
    let products = '';
    let price = json_order_data['data']['price'];
    let method = 'Самовывоз';
    let adress = form_data.adressPickup;
    for (let i = 0; i < json_order_data['data']['items'].length; i++) {
        products += '<b>' + json_order_data['data']['items'][i]['product']['parent']['design']['title'] + '</b>\n    ' + json_order_data['data']['items'][i]['product']['design']['title'] + ' × ' + json_order_data['data']['items'][i]['count'];
        if (i != json_order_data['data']['items'].length - 1) {
            products += '\n'
        }
    };
    if (form_data.method == 'courier' && parseInt(json_order_data['data']['price'].split(" ").join("").slice(0, -1)) < 1000) {
        price = parseInt(json_order_data['data']['price'].split(" ").join("").slice(0, -1)) + 150 + ' ₽';
    };
    
    console.log(json_order_data['data']['price']);

    if (form_data.method == 'courier') {
        method = 'Курьер';
        adress = form_data.adressCourier;
    };
    if (form_data.comment) {
        adress += '\n💬 ' + form_data.comment;
    }
    const post_edit_massageData = {
        bot_id: bot_id,
        message_id: 4199241,
        text: `<b>🎉Ваш заказ:</b>
➖➖➖➖➖➖➖➖➖➖➖➖
${products}
➖➖➖➖➖➖➖➖➖➖➖➖
💡 <b>Заказ:</b> #<code>${json_order_data['data']['id']}</code>
🤖 <b>Тг ID покупателя:</b> <code>${json_order_data['data']['user']['telegram_id']}</code>
👤 <b>Покупатель:</b> ${json_order_data['data']['user']['link']}
🕐 <b>Время заказа:</b> ${json_order_data['data']['created_time']}
💵 <b>Итоговая сумма:</b> ${price}
💰 <b>Способ оплаты:</b> ${form_data.pay}
➖➖➖➖➖➖➖➖➖➖➖➖
🏚<b>${method}</b>

🗓 ${form_data.date}
🕐 ${form_data.time}
📲 ${form_data.phone}
🏠 ${adress}

⬇️<b>Подтвердите покупку</b>`
    };
    let my_edit_massageHeaders = new Headers();
    my_edit_massageHeaders.append('Content-Type', 'application/json');
    fetch('https://api.bot-t.com/v1/bot/messagenew/message/update-text?token=7723075467:AAEHIRezunqN-fb__mqG4akqIHGZd3r9X5g', {
        method: 'POST',
        headers: my_edit_massageHeaders,
        body: JSON.stringify(post_edit_massageData),
    }).then((edit_massage_data) => {
        return edit_massage_data.json();
    }).then((json_edit_massage_data) => {
        send_massage(json_order_data);
    });
};


function send_massage(json_order_data) {
    let id = json_order_data.data.user.id;
    const post_send_massageData = {
        bot_id: bot_id,
        limit: 50,
        message_id: 4199241,
        user_id: id
    };
    let my_send_massageHeaders = new Headers();
    my_send_massageHeaders.append('Content-Type', 'application/json');
    fetch('https://api.bot-t.com/v1/bot/messagenew/message/test?token=7723075467:AAEHIRezunqN-fb__mqG4akqIHGZd3r9X5g', {
        method: 'POST',
        headers: my_send_massageHeaders,
        body: JSON.stringify(post_send_massageData),
    }).then((send_massage_data) => {
        return send_massage_data.json();
    }).then((json_send_massage_data) => {
        send_feedback(json_order_data);
    });
};


function send_feedback(json_order_data) {
    let id = json_order_data.data.user.id;
    const post_send_feedbackData = {
        bot_id: bot_id,
        limit: 50,
        message_id: 4199030,
        user_id: id
    };
    let my_send_feedbackHeaders = new Headers();
    my_send_feedbackHeaders.append('Content-Type', 'application/json');
    fetch('https://api.bot-t.com/v1/bot/messagenew/message/test?token=7723075467:AAEHIRezunqN-fb__mqG4akqIHGZd3r9X5g', {
        method: 'POST',
        headers: my_send_feedbackHeaders,
        body: JSON.stringify(post_send_feedbackData),
    }).then((send_feedback_data) => {
        return send_feedback_data.json();
    }).then((json_send_feedback_data) => {
        edit_feedback(json_order_data);
    });
};


function edit_feedback(json_order_data) {
    const post_edit_feedbackData = {
        bot_id: bot_id,
        message_id: 4199032,
        text: `<b>Обратная связь по заказу:</b> <code>${json_order_data['data']['id']}</code>

<b>Пользователь:</b> ${json_order_data['data']['user']['link']}

{MESSAGE_ADMIN_FOR_ANSWER}`
    };
    let my_edit_feedbackHeaders = new Headers();
    my_edit_feedbackHeaders.append('Content-Type', 'application/json');
    fetch('https://api.bot-t.com/v1/bot/messagenew/message/update-text?token=7723075467:AAEHIRezunqN-fb__mqG4akqIHGZd3r9X5g', {
        method: 'POST',
        headers: my_edit_feedbackHeaders,
        body: JSON.stringify(post_edit_feedbackData),
    }).then((edit_feedback_data) => {
        return edit_feedback_data.json();
    }).then((json_edit_feedback_data) => {
        edit_massage_admin(json_order_data)
    });
};


function edit_massage_admin(json_order_data) {
    let products = '';
    let price = json_order_data['data']['price'];
    let method = 'Самовывоз';
    let adress = form_data.adressPickup;
    for (let i = 0; i < json_order_data['data']['items'].length; i++) {
        products += '<b>' + json_order_data['data']['items'][i]['product']['parent']['design']['title'] + '</b>\n    ' + json_order_data['data']['items'][i]['product']['design']['title'] + ' × ' + json_order_data['data']['items'][i]['count'];
        if (i != json_order_data['data']['items'].length - 1) {
            products += '\n'
        }
    };
    if (form_data.method == 'courier' && parseInt(json_order_data['data']['price'].split(" ").join("").slice(0, -1)) < 1000) {
        price = parseInt(json_order_data['data']['price'].split(" ").join("").slice(0, -1)) + 150 + ' ₽';
    };
    if (form_data.method == 'courier') {
        method = 'Курьер';
        adress = form_data.adressCourier;
    };
    if (form_data.comment) {
        adress += '\n💬 ' + form_data.comment;
    }
    const post_edit_massageData = {
        bot_id: bot_id,
        message_id: 4199241,
        text: `<b>🎉Новая покупка в боте:</b>
➖➖➖➖➖➖➖➖➖➖➖➖
${products}
➖➖➖➖➖➖➖➖➖➖➖➖
💡 <b>Заказ:</b> #<code>${json_order_data['data']['id']}</code>
🤖 <b>Тг ID покупателя:</b> <code>${json_order_data['data']['user']['telegram_id']}</code>
👤 <b>Покупатель:</b> ${json_order_data['data']['user']['link']}
🕐 <b>Время заказа:</b> ${json_order_data['data']['created_time']}
💵 <b>Итоговая сумма:</b> ${price}
💰 <b>Способ оплаты:</b> ${form_data.pay}
➖➖➖➖➖➖➖➖➖➖➖➖
🏚<b>${method}</b>

🗓 ${form_data.date}
🕐 ${form_data.time}
📲 ${form_data.phone}
🏠 ${adress}`
    };
    let my_edit_massageHeaders = new Headers();
    my_edit_massageHeaders.append('Content-Type', 'application/json');
    fetch('https://api.bot-t.com/v1/bot/messagenew/message/update-text?token=7723075467:AAEHIRezunqN-fb__mqG4akqIHGZd3r9X5g', {
        method: 'POST',
        headers: my_edit_massageHeaders,
        body: JSON.stringify(post_edit_massageData),
    }).then((edit_massage_data) => {
        return edit_massage_data.json();
    }).then((json_edit_massage_data) => {
        send_massage_admin1(430798);
    });
};



function send_massage_admin1(id) {
    const post_send_massageData = {
        bot_id: bot_id,
        limit: 50,
        message_id: 4199241,
        user_id: id
    };
    let my_send_massageHeaders = new Headers();
    my_send_massageHeaders.append('Content-Type', 'application/json');
    fetch('https://api.bot-t.com/v1/bot/messagenew/message/test?token=7723075467:AAEHIRezunqN-fb__mqG4akqIHGZd3r9X5g', {
        method: 'POST',
        headers: my_send_massageHeaders,
        body: JSON.stringify(post_send_massageData),
    }).then((send_massage_data) => {
        return send_massage_data.json();
    }).then((json_send_massage_data) => {
        send_massage_admin2(3278747);
    });
};


function send_massage_admin2(id) {
    const post_send_massageData = {
        bot_id: bot_id,
        limit: 50,
        message_id: 4199241,
        user_id: id
    };
    let my_send_massageHeaders = new Headers();
    my_send_massageHeaders.append('Content-Type', 'application/json');
    fetch('https://api.bot-t.com/v1/bot/messagenew/message/test?token=7723075467:AAEHIRezunqN-fb__mqG4akqIHGZd3r9X5g', {
        method: 'POST',
        headers: my_send_massageHeaders,
        body: JSON.stringify(post_send_massageData),
    }).then((send_massage_data) => {
        return send_massage_data.json();
    }).then((json_send_massage_data) => {
        window.close();
        Telegram.WebApp.close();
    });
};


function profile_manag() {
    let user_name = document.getElementsByClassName('user_name')[0];
    let user_url = document.getElementsByClassName('user_url')[0];
    let balance = document.getElementsByClassName('balance')[0];
    user_name.innerText = user_data['data']['user']['first_name'];
    user_url.innerText = user_data['data']['user']['link'];
    if (user_data['data']['money']) {
        balance.innerText = parseFloat(String(user_data['data']['money']).slice(0, -2)) + parseFloat('0.' + String(user_data['data']['money']).slice(-2)) + ' ₽';
    } else {
        balance.innerText = '0 ₽';
    };
    promocode_manag();
}


const controller = new AbortController();

async function create_orders_list() {
    for (let i = 0; i < orders_count / 3; i++) {
        try {
            const post_get_ordersData = {
                bot_id: bot_id,
                offset: i * 3,
                secret_user_key: user_key,
                user_id: user_id
            };

            const my_get_ordersHeaders = new Headers();
            my_get_ordersHeaders.append('Content-Type', 'application/json');

            // Ожидаем завершения fetch
            const response = await fetch('https://api.bot-t.com/v1/shopcart/order/index', {
                signal: controller.signal,
                method: 'POST',
                headers: my_get_ordersHeaders,
                body: JSON.stringify(post_get_ordersData),
            });

            const json_orders_data = await response.json();


            const orders_list = document.getElementsByClassName('orders_list')[0];

            for (let j = 0; j < json_orders_data['data'].length; j++) {
                const order = document.createElement('div');
                orders_list.append(order);
                order.outerHTML = `
            <div class="order">
              <div class="order_system_info">
                <p class="order_num">${json_orders_data['data'][j]['id']}</p>
                <p class="order_time">${json_orders_data['data'][j]['created_time']}</p>
              </div>
              <div class="order_products"></div>
              <p class="order_full_price">${json_orders_data['data'][j]['price']} ₽</p>
            </div>`;

                const order_products = document.querySelectorAll('.order_products')[i * 3 + j];

                for (let k = 0; k < json_orders_data['data'][j]['items'].length; k++) {
                    const order_product = document.createElement('div');
                    order_products.append(order_product);
                    order_product.outerHTML = `
              <div class="order_product">
                <div class="order_product_info">
                  <div class="order_container">
                    <img class="order_img"
                      src="${json_orders_data['data'][j]['items'][k]['product']['design']['image']}"
                      loading="lazy" fetchpriority="auto" aria-hidden="true" draggable="false">
                  </div>
                  <div class="order_product_ident">
                    <p class="order_product_category">${json_orders_data['data'][j]['items'][k]['product']['parent']['design']['title']}</p>
                    <p class="order_product_name">${json_orders_data['data'][j]['items'][k]['product']['design']['title']}</p>
                  </div>
                </div>
                <p class="order_product_price">${json_orders_data['data'][j]['items'][k]['price']} X ${json_orders_data['data'][j]['items'][k]['count']}</p>
              </div>`;
                };
            };
        } catch (error) {
            console.error('Ошибка при загрузке заказов:', error);
        };
    };
};


function promocode_manag() {
    let promocode_input = document.getElementsByClassName('promocode_input')[0];
    let check_promocode = document.getElementsByClassName('check_promocode')[0];

    promocode_input.addEventListener('input', () => {
        if (promocode_input.value) {
            check_promocode.classList.remove('disactive_but');
        } else {
            check_promocode.classList.add('disactive_but');
        }
    });

    check_promocode.addEventListener('click', async () => { // Добавляем async
        if (!check_promocode.classList.contains('disactive_but')) {
            try {
                const result = await promocode_activate('https://api.bot-t.com/v1/shoppublic/coupon/activated', promocode_input.value); // Ждём ответа
                if (result && result.result) { // Проверяем result на существование
                    promocode_input.classList.add('succes_input'); // Добавляем класс (было remove)
                    setTimeout(() => {
                        promocode_input.classList.remove('succes_input');
                    }, 1000);
                } else {
                    promocode_input.classList.add('incorrect'); // Добавляем класс (было remove)
                    setTimeout(() => {
                        promocode_input.classList.remove('incorrect');
                    }, 1000);
                }
            } catch (error) {
                console.error('Ошибка при активации промокода:', error);
                promocode_input.classList.add('incorrect');
                setTimeout(() => {
                    promocode_input.classList.remove('incorrect');
                }, 1000);
            }
        } else {
            promocode_input.classList.add('incorrect');
            setTimeout(() => {
                promocode_input.classList.remove('incorrect');
            }, 1000);
        }
    });
}

// Возвращаем Promise с результатом
function promocode_activate(url, value) {
    const post_promocodeData = {
        bot_id: bot_id,
        code: value,
        secret_user_key: user_key,
        user_id: user_id
    };
    let my_promocodeHeaders = new Headers();
    my_promocodeHeaders.append('Content-Type', 'application/json');

    // Возвращаем промис с данными
    return fetch(url, {
        method: 'POST',
        headers: my_promocodeHeaders,
        body: JSON.stringify(post_promocodeData),
    })
        .then((promocode_data) => promocode_data.json())
        .then((json_promocode_data) => {
            return json_promocode_data; // Возвращаем данные
        })
        .catch((error) => {
            console.error('Ошибка при запросе:', error);
            return { result: false }; // Возвращаем объект с result: false в случае ошибки
        });
}



function admin() {
    let admin_but = document.getElementsByClassName('admin_but')[0];
    if (admin_flag) {
        admin_but.classList.remove('hide');
        let admin = document.getElementsByClassName('admin')[0];
        let admin_body = document.createElement('section');
        admin.append(admin_body);
        admin_body.outerHTML = `<section class="admin_body">
                <p class="users">Пользователи: </p>
                <div class="user_balance">
                    <p class="balance_name">Обнулить баланс пользователю:</p>
                    <input class="balance_input" type="text" placeholder="Telegram ID" />
                    <div class="check_balance disactive_but">
                        <p class="check_balance_text">Проверить</p>
                    </div>
                </div>
                <div class="user_block">
                    <p class="block_name">Заблокировать/разблокировать пользователя:</p>
                    <input class="block_input" type="text" placeholder="Telegram ID" />
                    <div class="check_block disactive_but">
                        <p class="check_block_text">Проверить</p>
                    </div>
                </div>
                <p class="orders">Заказы: </p>
                <div class="order_delete">
                    <p class="delete_name">Удалить заказ:</p>
                    <input class="delete_input" type="text" placeholder="Order ID" />
                    <div class="check_delete disactive_but">
                        <p class="check_delete_text">Проверить</p>
                    </div>
                </div>
            </section>`;
        const post_get_usersData = {
            bot_id: bot_id,
        };
        let my_get_usersHeaders = new Headers();
        my_get_usersHeaders.append('Content-Type', 'application/json');
        fetch('https://api.bot-t.com/v1/bot/user/count?token=7723075467:AAEHIRezunqN-fb__mqG4akqIHGZd3r9X5g', {
            method: 'POST',
            headers: my_get_usersHeaders,
            body: JSON.stringify(post_get_usersData),
        }).then((get_users_data) => {
            return get_users_data.json();
        }).then((json_get_users_data) => {
            let users = document.getElementsByClassName('users')[0];
            users.innerHTML = 'Пользователи: ' + json_get_users_data['data'];
            balance_manag();
            block_manag();
        });
        const post_get_order_countData = {
            bot_id: bot_id,
        };
        let my_get_order_countHeaders = new Headers();
        my_get_order_countHeaders.append('Content-Type', 'application/json');
        fetch('https://api.bot-t.com/v1/shopcart/order/main/count?token=7723075467:AAEHIRezunqN-fb__mqG4akqIHGZd3r9X5g', {
            method: 'POST',
            headers: my_get_order_countHeaders,
            body: JSON.stringify(post_get_order_countData),
        }).then((get_order_count_data) => {
            return get_order_count_data.json();
        }).then((json_get_order_count_data) => {
            let orders = document.getElementsByClassName('orders')[0];
            orders.innerHTML = 'Заказы: ' + json_get_order_count_data['data'];
            delete_manag();
        });
    };
};



function balance_manag() {
    let balance_input = document.getElementsByClassName('balance_input')[0];
    let check_balance = document.getElementsByClassName('check_balance')[0];

    balance_input.addEventListener('input', () => {
        if (balance_input.value) {
            check_balance.classList.remove('disactive_but');
        } else {
            check_balance.classList.add('disactive_but');
        }
    });

    check_balance.addEventListener('click', async () => { // Добавляем async
        if (!check_balance.classList.contains('disactive_but')) {
            try {
                const result = await admin_activate('https://api.bot-t.com/v1/bot/user/zero-balance?token=7723075467:AAEHIRezunqN-fb__mqG4akqIHGZd3r9X5g', balance_input.value); // Ждём ответа
                if (result && result.result) { // Проверяем result на существование
                    balance_input.classList.add('succes_input'); // Добавляем класс (было remove)
                    setTimeout(() => {
                        balance_input.classList.remove('succes_input');
                    }, 1000);
                } else {
                    balance_input.classList.add('incorrect'); // Добавляем класс (было remove)
                    setTimeout(() => {
                        balance_input.classList.remove('incorrect');
                    }, 1000);
                }
            } catch (error) {
                console.error('Ошибка при активации промокода:', error);
                balance_input.classList.add('incorrect');
                setTimeout(() => {
                    balance_input.classList.remove('incorrect');
                }, 1000);
            }
        } else {
            balance_input.classList.add('incorrect');
            setTimeout(() => {
                balance_input.classList.remove('incorrect');
            }, 1000);
        };
    });
};


function block_manag() {
    let block_input = document.getElementsByClassName('block_input')[0];
    let check_block = document.getElementsByClassName('check_block')[0];

    block_input.addEventListener('input', () => {
        if (block_input.value) {
            check_block.classList.remove('disactive_but');
        } else {
            check_block.classList.add('disactive_but');
        }
    });

    check_block.addEventListener('click', async () => { // Добавляем async
        if (!check_block.classList.contains('disactive_but')) {
            try {
                const result = await admin_activate('https://api.bot-t.com/v1/bot/user/ban?token=7723075467:AAEHIRezunqN-fb__mqG4akqIHGZd3r9X5g', block_input.value); // Ждём ответа
                if (result && result.result) { // Проверяем result на существование
                    block_input.classList.add('succes_input'); // Добавляем класс (было remove)
                    setTimeout(() => {
                        block_input.classList.remove('succes_input');
                    }, 1000);
                } else {
                    block_input.classList.add('incorrect'); // Добавляем класс (было remove)
                    setTimeout(() => {
                        block_input.classList.remove('incorrect');
                    }, 1000);
                }
            } catch (error) {
                console.error('Ошибка при активации промокода:', error);
                block_input.classList.add('incorrect');
                setTimeout(() => {
                    block_input.classList.remove('incorrect');
                }, 1000);
            }
        } else {
            block_input.classList.add('incorrect');
            setTimeout(() => {
                block_input.classList.remove('incorrect');
            }, 1000);
        }
    });
};


function delete_manag() {
    let delete_input = document.getElementsByClassName('delete_input')[0];
    let check_delete = document.getElementsByClassName('check_delete')[0];

    delete_input.addEventListener('input', () => {
        if (delete_input.value) {
            check_delete.classList.remove('disactive_but');
        } else {
            check_delete.classList.add('disactive_but');
        }
    });

    check_delete.addEventListener('click', async () => { // Добавляем async
        if (!check_delete.classList.contains('disactive_but')) {
            try {
                const result = await admin_activate('https://api.bot-t.com/v1/shopcart/order/main/delete?token=7723075467:AAEHIRezunqN-fb__mqG4akqIHGZd3r9X5g', delete_input.value); // Ждём ответа
                if (result && result.result) { // Проверяем result на существование
                    delete_input.classList.add('succes_input'); // Добавляем класс (было remove)
                    setTimeout(() => {
                        delete_input.classList.remove('succes_input');
                    }, 1000);
                } else {
                    delete_input.classList.add('incorrect'); // Добавляем класс (было remove)
                    setTimeout(() => {
                        delete_input.classList.remove('incorrect');
                    }, 1000);
                }
            } catch (error) {
                console.error('Ошибка при активации промокода:', error);
                delete_input.classList.add('incorrect');
                setTimeout(() => {
                    delete_input.classList.remove('incorrect');
                }, 1000);
            }
        } else {
            delete_input.classList.add('incorrect');
            setTimeout(() => {
                delete_input.classList.remove('incorrect');
            }, 1000);
        }
    });
};


function admin_activate(url, value) {
    const post_promocodeData = {
        bot_id: bot_id,
        id: value,
        user_id: value,
        is_back_cart: true
    };
    let my_promocodeHeaders = new Headers();
    my_promocodeHeaders.append('Content-Type', 'application/json');

    // Возвращаем промис с данными
    return fetch(url, {
        method: 'POST',
        headers: my_promocodeHeaders,
        body: JSON.stringify(post_promocodeData),
    })
        .then((promocode_data) => promocode_data.json())
        .then((json_promocode_data) => {
            return json_promocode_data; // Возвращаем данные
        })
        .catch((error) => {
            console.error('Ошибка при запросе:', error);
            return { result: false }; // Возвращаем объект с result: false в случае ошибки
        });
};


function adm_add_category() {
    let catalog = document.getElementsByClassName('catalog')[0];
    let add_category_plus = document.getElementsByClassName('add_category_plus')[0];
    let cart = document.getElementsByClassName('cart ')[0];
    let add_cart = document.getElementsByClassName('add_cart')[0];
    let cart_path = document.getElementsByClassName('cart_adm_path')[0];
    let cart_adm_img = document.getElementsByClassName('cart_adm_img')[0];
    let cart_img_none = document.getElementsByClassName('cart_img_none')[0];
    const fileInput = document.getElementById('fileInput');
    let type_category = document.getElementsByClassName('type_category')[0];
    let type_product = document.getElementsByClassName('type_product')[0];
    let cart_name_input = document.getElementsByClassName('cart_name_input')[0];
    let cart_discript_input = document.getElementsByClassName('cart_discript_input')[0];
    let cart_count_input = document.getElementsByClassName('cart_count_input')[0];
    let cart_price_input = document.getElementsByClassName('cart_price_input')[0];
    let save_category = document.getElementsByClassName('save_category')[0];
    let category_list = document.getElementsByClassName('category_list')[0];


    function add_cart_cheker() {
        if (type_category.classList.contains('choiced')) {
            if (cart_name_input.value != 0) {
                save_category.classList.remove('disactive_but');
                return true;
            } else {
                save_category.classList.add('disactive_but');
                return false;
            };
        } else if (type_product.classList.contains('choiced')) {
            if (cart_name_input.value != 0 && cart_count_input.value != 0 && cart_price_input.value != 0) {
                save_category.classList.remove('disactive_but');
                return true;
            } else {
                save_category.classList.add('disactive_but');
                return false;
            };
        };
    };
    add_category_plus.addEventListener('click', () => {
        catalog.classList.add('hide')
        cart.classList.remove('hide')
        add_cart.classList.remove('hide')
        add_cart_cheker();
        if (category_list.id == 0) {
            type_product.classList.add('hide');
        };
    });
    cart_path.addEventListener('click', () => {
        catalog.classList.remove('hide')
        cart.classList.add('hide')
        add_cart.classList.add('hide')
    });
    fileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (event) {
                cart_adm_img.src = event.target.result;
            };
            cart_adm_img.classList.remove('hide');
            cart_img_none.classList.add('hide');
            reader.readAsDataURL(file);
        };
    });
    type_category.addEventListener('click', () => {
        type_category.classList.add('choiced');
        type_product.classList.remove('choiced');
        cart_count_input.classList.add('hide');
        cart_price_input.classList.add('hide');
        add_cart_cheker();
    });
    type_product.addEventListener('click', () => {
        type_product.classList.add('choiced');
        type_category.classList.remove('choiced');
        cart_count_input.classList.remove('hide');
        cart_price_input.classList.remove('hide');
        add_cart_cheker();
    });
    cart_name_input.addEventListener('input', () => {
        add_cart_cheker();
    });
    cart_count_input.addEventListener('input', () => {
        add_cart_cheker();
    });
    cart_price_input.addEventListener('input', () => {
        add_cart_cheker();
    });
    save_category.addEventListener('click', () => {
        if (add_cart_cheker()) {
            if (type_category.classList.contains('choiced')) {
                create_category(0, cart_name_input.value, category_list.id, cart_discript_input.value);
            } else if (type_product.classList.contains('choiced')) {
                create_category(7, cart_name_input.value, category_list.id, cart_discript_input.value, cart_count_input.value, cart_price_input.value);
            };
        };
    });
};

function create_category(type, title, category_id, description) {
    const postData = {
        bot_id: 251807,
        type: type,
        title: title,
        category_id: parseInt(category_id),
        description: description,
        count: 1000
    };
    let myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    fetch('https://api.bot-t.com/v1/shop/category/create?token=7723075467:AAEHIRezunqN-fb__mqG4akqIHGZd3r9X5g', {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(postData),
    }).then((data) => {
        return data.json();
    }).then((json_create_category_data) => {
        bott_auth();
    });
};


function bott_auth() {
    fetch(`https://bot-t.com/auth/telegram/success?token=1000597955mUCnK-DpnAe-oX2ntt-A5jnvTQVpsh2Y`, {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Upgrade-Insecure-Requests': '1',
            'User-Agent': 'Mozilla\/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit\/537.36 (KHTML, like Gecko) Chrome\/132.0.0.0 Safari\/537.36',
            'sec-ch-ua': '\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '\"Windows\"'
        },
    }).then((data) => {
        return data.json();
    });
};


function edit_img_category(category_id) {
    fetch(`https://bot-t.com/lk/common/shop/category/image-add?category_id=${category_id}&bot_id=251807`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'referer': 'https://bot-t.com/lk/common/shop/category/index?bot_id=251807'
        },
    }).then((data) => {
        return data.json();
    });
};

document.addEventListener('DOMContentLoaded', function () {
    Telegram.WebApp.expand();
    const postData = {
        bot_id: 251807,
    };
    let myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    fetch('https://api.bot-t.com/v1/shoppublic/category/alls', {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(postData),
    }).then((data) => {
        let user = Telegram.WebApp.initDataUnsafe.user;
        if (user) {
            userId = user['id'];
        } else {
            const urlParams = new URLSearchParams(window.location.search);
            userId = urlParams.get('id'); // Получить значение параметра "param1"
        }
        if (userId == '1000597955' || userId == '1035087579') {
            admin_flag = true;
        };
        return data.json();
    }).then((json_data) => {
        json_data = json_data['data'];
        if (admin_flag) {
            console.log(json_data);
            let product_list = '';
            let product_list_price = 0;
            for (let i = 0; i < json_data.length; i++) {
                if (json_data[i]['is_hide'] == false && json_data[i]['is_view'] == true) {
                    product_list = product_list + '➖' + json_data[i]['design']['title'] + '➖' + '\n';
                    for (let j = 0; j < json_data[i]['children'].length; j++) {
                        if (json_data[i]['children'][j]['is_hide'] == false && json_data[i]['children'][j]['is_view'] == true) {
                            product_list = product_list + '  ➖' + json_data[i]['children'][j]['design']['title'] + '➖' + '\n';
                            for (let k = 0; k < json_data[i]['children'][j]['children'].length; k++) {
                                if (json_data[i]['children'][j]['children'][k]['is_hide'] == false && json_data[i]['children'][j]['children'][k]['is_view'] == true) {
                                    product_list_price += (json_data[i]['children'][j]['children'][k]['price']['full']).slice(0, -2);
                                    product_list = product_list + '    ' + json_data[i]['children'][j]['children'][k]['design']['title'] + '\n';
                                };
                            };
                        };
                    };
                };
            };
            console.log(product_list);
        };
        common_json_data = json_data;
        create_categories(json_data, 0);
        get_user_key();
    });
});
