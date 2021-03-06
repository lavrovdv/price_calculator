// remove all
// localStorage.setItem('page_calc_storage', null)

moment.updateLocale('ru', {
    relativeTime : {
        future : '%s',
        past : '%s',
        s : 'сейчас',
        m : '1 мин',
        mm : '%d мин',
        h : '1 ч',
        hh : '%d ч',
        d : '1 д',
        dd : '%d д',
        M : '1 мес',
        MM : '%d мес',
        y : '1 г',
        yy : '%d г'
    }
});

var new_list = {
    name: 'List',
    elements: []
};

var new_element = {
    product_name: '',
    complete: false,
    count: '',
    unit_base: 1,
    history: []
};

var new_history = {
    price: 0,
    count: 0,
    type: '',
    comment: '',
    created_at: ''
};

var default_data = {
    current_list_index: 0,
    lists: [
        {
            name: 'List',
            elements: []
        }
    ]
};

function init_data(){
    var loaded;
    if(location.search == '?i=remove_all'){
        loaded =  _.cloneDeep(default_data)
    }else{
        loaded = JSON.parse(localStorage.getItem('page_calc_storage')) || _.cloneDeep(default_data);
    }

    migrate_unit_base(loaded);
    return loaded;
}

function migrate_unit_base(data){
    _.forEach(data.lists, function(list) {
        _.forEach(list.elements, function(element) {
            if (_.isUndefined(element.unit_base)) {
                element.unit_base = 1
            }
        })
    })
}

var app = new Vue({
    el: '#app',
    data: init_data(),
    methods:{
        addNewList: function(event){
            this.lists.push(_.cloneDeep(new_list))
        },
        selectList: function(index){
            this.current_list_index = index;
        },
        removeList: function(index){
            this.lists.splice(index, 1);
            var current_list_index = (index == 0) ? 0 : index - 1;
            this.current_list_index = current_list_index;
        },
        removeElement: function(element_index){
            this.lists[this.current_list_index].elements.splice(element_index, 1)
        },
        addElement: function(event){
            var input = $(event.currentTarget);
            var modal = input.closest('#modal1');
            var element = _.cloneDeep(new_element);
            element.product_name = input.val();
            input.val('');
            modal.modal('close');

            this.lists[this.current_list_index].elements.push(element)
        },
        changeElementState: function(index){
            var element = this.lists[this.current_list_index].elements[index];
            element.complete = !element.complete;
        },
        addHistory: function(index, event){
            var history = _.cloneDeep(new_history);
            var now = new Date();
            var form = $(event.currentTarget).closest(".collapsible-body");

            history.price = parseFloat(form.find('input.price').val());
            history.count = parseFloat(form.find('input.count').val());
            history.comment = form.find('input.comment').val();
            history.created_at = now;
            form.find('input').val('');

            this.lists[this.current_list_index].elements[index].history.unshift(history)
        },
        recalcHistoryPrice: function(index, event) {
            var form = $(event.currentTarget).closest(".collapsible-body");
            var unit = history.count = parseFloat(form.find('input.count').val());
            if (_.isNaN(unit)) {
                unit = 1
            }
            this.lists[this.current_list_index].elements[index].unit_base = unit
        },
        dateFormatDecorator: function (date){
            var moment_obj = (date.length == 10 || date.length == 9) ? moment(date, 'DD.MM.YYYY') : moment(date);
            return moment_obj.fromNow();
        },
        removeAll: function(){
            this.current_list_index = 0;
            this.lists.splice(0, Number.MAX_VALUE);
        }
    },

    computed: {
        currentElements: function () {
            var current_list = this.lists[this.current_list_index];
            return current_list ? current_list.elements : [];
        }
    }
});

app.$watch(
    '$data',
    function (newVal, oldVal) {
        localStorage.setItem('page_calc_storage', JSON.stringify(newVal))
    },
    {
        deep: true
    }
);
