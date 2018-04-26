/**
 * @author Yoannes
 * @version 1.0.0
 * @licence MIT
 */

require('./css.css');

/**
 * @function YoSelect
 * @param {string} el                    - Element to create search box
 * @param {Array} data                   - Array with data to populate select
 * @param {Object} [params]              - Object with some customizations
 * @param {function} [params.locale]     - Language. Default en_us.
 * @param {function} [params.onOpen]     - Callback after opening the select
 * @param {function} [params.onSelected] - Callback after selecting one option
 */
window.YoSelect = function (el, data, params) {
  if (!el) return;

  let that = this;
  let id,
    boxOpened = false,
    selectItemOnCreate = false,
    invalid = false,
    dt = {};
  let settings = {
    locale: {
      lang: params && params.locale ? params.locale : 'en_us',
      list: {
        not_results: {en_us: "No results"}
      }
    },
    borderRadius: 4,
    borderColor: '#cfcfcf',
    minSearchResults: 5
  };

  if (el[0] === '#' || el[0] === '.')
    id = `yoSelect-${el.substr(1, el.length)}`;

  function createDataObj(data) {
    dt = {};
    for (let i=0; i < data.length; i++) {
      let v = data[i];
      dt[v.id] = v;
    }
  }

  function open() {
    if (!boxOpened) {

      console.log(`yoSelect-glow${that.invalid ? '-invalid' : ''}`);
      $(`#${id}Container`)
        .addClass(`yoSelect-glow${that.invalid ? '-invalid' : ''}`)
        .css({"border-bottom-left-radius": 0, "border-bottom-right-radius": 0});

      $(`#${id}Chev`).css('transform', 'rotate(180deg)');

      $(`#${id}Items`)
        .width($(el).width()-2)
        .show();

      $(`#${id}Search`).focus();

      boxOpened = true;

      if (params && params.onOpen)
        params.onOpen();
    }
  }

  function close() {
    if (boxOpened) {
      setTimeout(function () { boxOpened = false; }, 50);

      $(`#${id}Items`).hide();

      $(`#${id}Container`)
        .removeClass(`yoSelect-glow${that.invalid ? '-invalid' : ''}`)
        .css({
          "border-bottom-left-radius": settings.borderRadius,
          "border-bottom-right-radius": settings.borderRadius
        });

      $(`#${id}Chev`).css('transform', 'rotate(0deg)');
    }
  }

  function createItems() {
    let ans = '';
    selectItemOnCreate = false;

    if (Object.keys(dt).length > settings.minSearchResults)
      ans += `<div class="yoSelect-searchBox"><input type="text" id="${id}Search" class="yoSelect-searchInput" /></div>`;

    ans += `<div id="${id}NoResults" class="yoSelect-item" style="display: none">${settings.locale.list.not_results[settings.locale.lang]}</div>`;

    for (let k in dt) {
      if (!dt.hasOwnProperty(k)) continue;
      let v = dt[k];
      console.log(v);

      if (!v.id) v.id = v.value;
      if (v.html) v.value = v.html;
      if (v.selected) {
        selectItemOnCreate = true;
        that.selectedValue = v.id;
      }

      ans += `<div id="${id + v.id}" class="yoSelect-item ${id}Item" data-yo-select-id="${v.id}">${v.value}</div>`;
    }

    return ans;
  }

  function createElements() {
    $(el)
      .html(
        `<div id="${id}Container" class="yoSelect-container">`+
          `<table class="yoSelect-container-table"><tr><td id="${id}ChosenItem"></td></tr></table>` +
          `<span id="${id}Chev" class="chev "></span>` +
        `</div>` +
        `<div id="${id}Items" class="yoSelect-items">${createItems()}</div>`
      )
      .off('click')
      .on('click', function () {
        open();
        setTimeout(function () {
          $(document).one('mouseup', function (evt) {
            let $items = $(`#${id}Items`);
            if (!$items.is(evt.target) && $items.has(evt.target).length === 0)
              close();
          });
        }, 50);
      });

    itemListener();

    if (selectItemOnCreate)
      selectItem();
  }

  function selectItem() {
    let x = dt[that.selectedValue];
    console.log(x, that.selectedValue, dt);

    $(`#${id}ChosenItem`).text(x.value);

    $(`.${id}Item`).removeClass('yoSelect-selected-item');
    $(`#${id + x.id}`).addClass('yoSelect-selected-item');
  }

  function itemListener() {
    $(`.${id}Item`).off('click').on('click', function () {
      that.selectedValue = $(this).data('yoSelectId');

      console.log(' aaaaaaaaaa', that.selectedValue);

      selectItem();
      close();

      if (params && params.onSelected)
        params.onSelected();
    });

    $(`#${id}Search`).off('keyup').on('keyup', function () {
      let val = this.value;

      delay(function () {
        let found = false;

        for (let k in dt) {
          if (!dt.hasOwnProperty(k)) continue;
          let v = dt[k];
          if (v.value.search(val) > -1) {
            $(`#${id + v.id}`).show();
            found = true;
          }
          else {
            $(`#${id + v.id}`).hide();
          }
        }

        if (found)
          $(`#${id}NoResults`).hide();
        else
          $(`#${id}NoResults`).show();

      }, 50);
    });
  }

  createDataObj(data);
  createElements();

  this.selectedValue = null;

  this.isInvalid = function () {
    that.invalid = true;
    $(`#${id}Container`).css('border', ' 1px solid red');
  };

  this.isValid = function () {
    that.invalid = false;
    $(`#${id}Container`).css('border', `1px solid ${settings.borderColor}`);
  };

  this.setBgColor = function (color) {
    $(`#${id}Container`).css('background-color', color);

    let font = contrast();
    $(`#${id}ChosenItem`).css('color', font);
    $(`#${id}Chev`).css('border-bottom', `6px solid ${font}`)
  };

  this.setRadius = function (px) {
    if (isNaN(px)) return;

    $(`#${id}Container`).css('border-radius', `${px}px`);

    $(`#${id}Items`).css({
      'border-bottom-left-radius': `${px}px`,
      'border-bottom-right-radius': `${px}px`
    });

    settings.borderRadius = px;
  };

  this.setBorderColor = function (color) {
    $(`#${id}Container`).css('border', `1px solid ${color}`);
    $(`#${id}Items`).css('border', `1px solid ${color}`);
    settings.borderColor = color;
  };

  this.updateData = function (newData) {
    createDataObj(newData);

    $(`#${id}Items`).html(createItems(newData));
    itemListener();

    if (selectItemOnCreate)
      selectItem();
  };

  this.select = function (x) {
    for (let k in dt) {
      if (!dt.hasOwnProperty(k)) continue;
      let v = dt[k];
      if (v.id.toString() === x.toString() || v.value === x) {
        that.selectedValue = v.id;
        selectItem();
      }
    }
  };

  let delay = (function(){
    let timer = 0;
    return function(callback, ms){
      clearTimeout (timer);
      timer = setTimeout(callback, ms);
    };
    // delay(function(){ // SOMETHING }, milliseconds );
  })();

  function contrast() {
    let R, G, B, C, L;
    let b = $(`#${id}Container`).css("background-color");

    b = b.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d?))\))?/);
    R = parseInt(b[1]);
    G = parseInt(b[2]);
    B = parseInt(b[3]);


    C = [ R/255, G/255, B/255 ];
    for ( let i = 0; i < C.length; ++i ) {
      if ( C[i] <= 0.03928 ) {
        C[i] = C[i] / 12.92
      } else {
        C[i] = Math.pow( ( C[i] + 0.055 ) / 1.055, 2.4);
      }
    }

    L = 0.2126 * C[0] + 0.7152 * C[1] + 0.0722 * C[2];

    if ( L > 0.179 ) {
      return 'black';
    } else {
      return 'white';
    }

  }
};