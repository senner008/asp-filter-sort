; (function ($) {

    if ($("main .table").length == 0) return;

    const tableColumns = document.querySelectorAll("main table th");
    const collectionProps = Array.from(tableColumns).filter(m => m.innerText.length > 0).map((prop, index) => {
        return `<option data-select-type="${prop.innerText}" value="${index + 1}">${prop.innerText}</option>`
    });

    const filterElem = `
    <div class="input-group mb-3">
        <div class="input-group-prepend">
            <span class="input-group-text" id="inputGroup-sizing-sm">Sort</span>
        </div>
        <div class="input-group-prepend">
            <select class="custom-select" id="search-sort-select">
                ${collectionProps.join("")}
            </select>
        </div>
        <div class="input-group-prepend">
            <span class="input-group-text" id="inputGroup-sizing-sm">Filter</span>
        </div>
        <div class="input-group-prepend">
            <select class="custom-select" id="search-filter-select">
                <option data-select-type="All" value="0">All</option>
                ${collectionProps.join("")}
            </select>
        </div>
    
        <input type="text" id="search-filter" class="form-control" aria-label="Small" aria-describedby="inputGroup-sizing-sm">
    </div>`


    $("main table").before(filterElem);

    $('main #search-filter-select').on('change', function (e) {
        State.setState("filterIndex", this.selectedIndex);
    });

    $('main #search-sort-select').on('change', function (e) {
        State.setState("sortIndex", this.selectedIndex);
    });

    $("main #search-filter").on("input", function (e) {
        State.setState("filterQuery", e.target.value)
    });


    function predicate(prop, target) {
        return prop.innerText.toUpperCase().includes(target.toUpperCase())
    }

    function filter (elems, query, filterIndex) {
        return elems.filter(tr => {
            if (filterIndex !== 0) {
                const prop = tr.children[filterIndex - 1];
                return predicate(prop, query)
            }
            else {
                const tds = Array.from(tr.children);
                tds.length = collectionProps.length;
                return tds.some(prop => predicate(prop, query));
            }
        });
    }

     var sorter = (sortIndex, elems) => {
        if(!elems.length) return [];
        const getVal = (elem) => {
            var val = elem.children[sortIndex].innerText.toUpperCase().trim();
            return !isNaN(Number(val)) ? Number(val) : val;
        }
        var tohyphen = (s) => typeof s === "string" ? s.replace(/\//g, '-') : s;
        var date = new Date(tohyphen(getVal(elems[0])));
        var isDate = date instanceof Date && !isNaN(date.valueOf());

        if (isDate) return elems.sort((a,b) => new Date(tohyphen(getVal(a))) - new Date(tohyphen(getVal(b))));
        else return elems.sort((a,b) => getVal(a) < getVal(b) ? -1 : 1);

    } 

    function renderState(result) {
        $("main tbody").html(result.length ? result : "");
    }
   
    const collection = Array.from(document.querySelectorAll("main tbody tr")).slice(0);

    var State = (function(collection) {
        const _state = {
            filterIndex: 0,
            sortIndex : 0,
            filterQuery: "",
            collection: collection
        }

        function _getResult() {
            const filterResult = filter(_state.collection, _state.filterQuery, _state.filterIndex);
            const result = sorter(_state.sortIndex, filterResult);
            return result;
        }
        renderState(_getResult());

        return {
            setState(prop, val) {
                if (prop === "filterIndex") {
                    _state.filterIndex = val;
                }
                else if (prop === "sortIndex") {
                    _state.sortIndex = val;
                }
                else if (prop === "filterQuery") {
                    _state.filterQuery = val;
                }
                else {
                    throw "invalid argument!"
                }
                renderState(_getResult());
            }
        }
    })(collection);

})(jQuery);