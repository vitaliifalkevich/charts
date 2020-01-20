/*Created by: Vitalii Falkevych
* Date:       24. 03.2019
* E-mail:     vitaliifalkevich@gmail.com*/

var rangeSlider = function (arrToUpdateChart) {
    var drag = false;
    var values = [];
    var elements = document.getElementById('slider');     // Get all the elements into a node list
    var mainContainer = document.getElementById('mainContainer');
    updateView(elements);

    var leftPeriod = document.getElementById('lp');
    var rightPeriod = document.getElementById('rp');
    var periodLine = document.getElementById('periodLine');
    var bar = document.getElementById('bar');
    var nowX;
    /*For styling*/
    var firstMask = document.getElementById('firstMask');
    firstMask.setAttribute('style', 'width:' + bar.offsetLeft + 'px');
    var secondMask = document.getElementById('secondMask');
    secondMask.setAttribute('style', 'left:' + (bar.offsetLeft + bar.offsetWidth) + 'px; width:' + (elements.offsetWidth - (bar.offsetLeft + bar.offsetWidth)) + 'px');

    [lp, rp].forEach(function (item, i) {
        item.addEventListener("mousedown", function () {
            drag = this;
        });
    });
    periodLine.addEventListener("mousedown", function (event) {
        drag = this;
        /*Ниже определяем переменную, которая будет сожержать исходное значение координаты x курсора мыши на нажатии*/
        nowX = event.pageX;
    });
    document.addEventListener("mousemove", function (e) {
        if (!drag)
            return;
        /*Идентифицируем PeriodLine*/
        if(drag.getAttribute('class') == 'periodLine') {
            var x1;
            var x2;
            /*Задаем координату x1 следующим образом:
            * 1. Находим положение слева левого бегунка
            * 2. прибавляем ему значение (текущая позиция курсора минус заранее сохраненное значение курсора)
            * 3. Переопределяем зарезервированное значение курсора на новое, чтобы оно всегда было больше нового и
            *    для сохранения разницы корректной*/
            x1 = (bar.offsetLeft + (e.pageX - nowX))   / drag.parentNode.parentNode.offsetWidth;
            console.log("х1: " + x1);
            x2 = ((bar.offsetLeft + bar.offsetWidth) + (e.pageX - nowX))   / drag.parentNode.parentNode.offsetWidth;
            nowX = e.pageX;
            if (x1 < 0) x1 = 0;
            if (x2 < 0) x2 = 0;
            if (x1 > 1) x1 = 1;
            if (x2 > 1) x2 = 1;
            leftPeriod.setAttribute("data-pos",  x1);
            rightPeriod.setAttribute("data-pos", x2);
        }
        else {
            /*var x = (e.pageX - drag.offsetWidth / 2 - drag.parentNode.parentNode.offsetLeft) / drag.parentNode.parentNode.offsetWidth;*/
            var x = ((e.pageX - mainContainer.offsetLeft) - drag.offsetWidth / 2 - drag.parentNode.parentNode.offsetLeft) / drag.parentNode.parentNode.offsetWidth;

            if (x < 0) x = 0;
            if (x > 1) x = 1;
            var rp = drag.parentNode.querySelector('#rp');
            var lp = drag.parentNode.querySelector('#lp');
            if (drag.classList.contains("lp") && x > rp.getAttribute("data-pos")) {
                rp.setAttribute("data-pos", x);
            }
            if (drag.classList.contains("rp") && x < lp.getAttribute("data-pos")) {
                lp.setAttribute("data-pos", x);
            }
            drag.setAttribute("data-pos", x);
        }
        /*Set style*/
        firstMask.setAttribute('style', 'width:' + bar.offsetLeft + 'px');
        secondMask.setAttribute('style', 'left:' + (bar.offsetLeft + bar.offsetWidth) + 'px; width:' + (elements.offsetWidth - (bar.offsetLeft + bar.offsetWidth)) + 'px');
        updateView(drag.parentNode.parentNode);
        chartObjectControl.arrToUpdateChart = arrToUpdateChart;

        /*При движении ползунка вызываем метод отрисовки графика*/
        drawChart(chartObjectControl,'update', arrToUpdateChart);
    });
    document.addEventListener("mouseup", function () {
        drag = false;
    });

    function updateView(slider) {
        /*console.log(slider);*/
        var startVal = parseInt(slider.querySelector(".bar").getAttribute("data-start"));
        var endVal = parseInt(slider.querySelector(".bar").getAttribute("data-end"));
        if (startVal > endVal)
            endVal = startVal;
        startVal = startVal || 0;
        endVal = endVal || 100;
        console.log(endVal);
        var values = [];
        for (var i = startVal; i <= endVal; i++)
            values.push(i);
        var l = slider.querySelector('#lp').getAttribute("data-pos");
        var r = slider.querySelector('#rp').getAttribute("data-pos");
        var x = slider.offsetWidth * l;
        var w = (r - l) * slider.offsetWidth;
        slider.querySelector('.bar').setAttribute('style', 'left:' + x + 'px;width:' + w + 'px');
        var index = Math.round(values.length * l);
        if (index >= values.length)
            index = values.length - 1;
        var minValue = index;
        /*slider.querySelector('#lp').innerHTML = ("<span>" + values[index] + "</span>");*/
        index = Math.round(values.length * r);
        if (index >= values.length)
            index = values.length - 1;
        var maxValue = index;
        /*slider.querySelector('#rp').innerHTML = ("<span>" + values[index] + "</span>");*/
        arrToUpdateChart = [minValue, maxValue];
        return arrToUpdateChart ;
    }
}