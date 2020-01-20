/*Created by: Vitalii Falkevych
* Date:       24. 03.2019
* E-mail:     vitaliifalkevich@gmail.com*/

'use strict';

var content = document.getElementById('chart');
var data;
var chartObjectControl;
/*Получаем файл с данными*/
function getFile(fileName, fn) {
    var request = new XMLHttpRequest();
    request.open('GET', fileName, true);
    request.send();
    request.onreadystatechange = function () {
        if (request.readyState != 4) return;
        if (request.status != 200) {
            alert(request.status + ': ' + request.statusText);
        } else {
            data = JSON.parse(request.responseText);
            /*Как только данные получены, выполняем построение графиков*/
            chartObjectControl = {
                chartHeight: 450,
                chartWidth: 450,
                hidesLines: [],
                countChartsInFile: data.length,
                activeChart: 0,
                countLinesInChart: function () {
                    var counter = 0;
                    for (var key in data[this.activeChart].names) {
                        counter++;
                    }
                    return counter;
                },
                getName: function (idx, isObj = false) {
                    var counter = 0;
                    for (var key in data[this.activeChart].names) {
                        if (isObj == "obj") {
                            return data[this.activeChart].names[idx];

                        } else {
                            if (counter == idx) {
                                return data[this.activeChart].names[key];
                            }
                        }

                        counter++;
                    }
                },
                period: 60,
                dataToOut: {},
                cacheDataToOut: {},
                typeX: function () {
                    var typeX;
                    /*Определим, какие ключи не относяться к типу X. В нашем случае они относятся к типу Line*/
                    for (var key in  data[this.activeChart].types) {
                        if (data[this.activeChart].types[key] == "x") {
                            /*Запишем в массив ключ, которые являет собой тип X и не относится к оси Y*/
                            typeX = data[this.activeChart].types[key];
                        }
                    }
                    return typeX;
                },
                getValuesForPeriod: function (period = false, typeDraw = false, arrToUpdateChart = false) {
                    var countArr = (data[this.activeChart].columns[0]).length;

                    for (var i in data[this.activeChart].columns) {

                        this.dataToOut[(data[this.activeChart].columns[i][0])] = [];
                        /*Запишем значения для оси Y в массив*/
                        for (var n = 1; n < countArr; n++) {
                            this.dataToOut[(data[this.activeChart].columns[i][0])].push(data[this.activeChart].columns[i][n]);
                        }

                        var helpReverseData = this.dataToOut[(data[this.activeChart].columns[i][0])].reverse();


                        if (period != false) {
                            if (arrToUpdateChart.length != 0) {
                                if (typeDraw == 'update' || typeDraw == 'hideLine') {


                                    helpReverseData = helpReverseData.slice((countArr - arrToUpdateChart[1] - 1), (countArr - arrToUpdateChart[0]));

                                } else {
                                    helpReverseData.splice(period, countArr);
                                }
                            } else {
                                helpReverseData.splice(period, countArr);
                            }


                        }
                        this.dataToOut[(data[this.activeChart].columns[i][0])] = helpReverseData
                    }
                    /*Ниже проверяем необходимость удалить линии, которые не будут отображаться на графике*/
                    if (this.hidesLines.length != 0) {
                        for (var c = 0; c < this.hidesLines.length; c++) {
                            delete this.dataToOut["y" + this.hidesLines[c]];
                        }
                    }

                    return this.dataToOut;
                },
                maxValueForPeriod: function (dataToOut) {
                    if (isNotEmpty(dataToOut)) {
                        var dataPeriod = [];
                        for (var key in  dataToOut) {
                            if (key != this.typeX()) {
                                dataPeriod = dataPeriod.concat(dataToOut[key]);
                            }
                        }
                        return Math.max.apply(null, dataPeriod);

                    } else {
                        console.log("Нельзя определить максимальное значение Y, поскольку метод getValuesForPeriod не был вызван и не собрал значения за необходимый период");
                    }
                },
                arrToUpdateChart: [],
                getActiveChartColor: function (activeColorForChart, isObj) {
                    var color;
                    var count = 0;
                    for (var key in data[this.activeChart].colors) {
                        if (isObj == "obj") {
                            return data[this.activeChart].colors[activeColorForChart];

                        } else {
                            if (count == activeColorForChart) {
                                return data[this.activeChart].colors[key];
                            }
                        }

                        count++;
                    }
                }

            };
            build_chart(content, data, chartObjectControl);
            return chartObjectControl;
        }
    };
}

//путь к файлу
getFile('./chart_data.json');

function drawChart(chartObjectControl, typeDraw = false, arrToUpdateChart = false) {
    if (!typeDraw) {
        buildSliderChart(chartObjectControl);
    } else if (typeDraw == 'hideLine') {
        buildSliderChart(chartObjectControl, typeDraw);
    }
    if (typeDraw == 'update') {
        chartObjectControl.period = ((arrToUpdateChart[1] + 1) - arrToUpdateChart[0]);

    }
    var dataToOut = chartObjectControl.getValuesForPeriod(chartObjectControl.period, typeDraw, arrToUpdateChart);


    chartObjectControl.cacheDataToOut = dataToOut;

    /*Построение графика*/
    var axisX = chartObjectControl.dataToOut[chartObjectControl.typeX()];
    var getChartYPeriod = chartObjectControl.chartHeight / chartObjectControl.maxValueForPeriod(dataToOut);
    var DataIdChart = document.getElementById('chartData');
    var dataCollect = [];


    generateDataForChart(dataToOut, chartObjectControl, getChartYPeriod, dataCollect, chartObjectControl.chartHeight, 'mainChart', typeDraw);


    var inputCheckboxes = document.getElementById('inputCheckboxes');
    if (typeDraw == 'update') {
        DataIdChart.innerHTML = '';
    } else if (typeDraw == 'hideLine') {
        DataIdChart.innerHTML = '';
    }

    if (!typeDraw) {
        for (var i = 0; i < chartObjectControl.countLinesInChart(); i++) {
            var color = chartObjectControl.getActiveChartColor(i);
            var chartName = chartObjectControl.getName(i);

            inputCheckboxes.insertAdjacentHTML('beforeend',
                '<input type="checkbox" class="checkbox" id="check' + i + '" data-target="' + i + '" checked="checked">\n' +
                '<label class="checkbox" for="check' + i + '"><span class="checkboxIcon" id="label' + i + '" style="background-color: ' + color + '; border: 2px solid ' + color + '"></span><span class="checkboxName">' + chartName + '</span></label>');


            DataIdChart.insertAdjacentHTML('beforeend', '<polyline fill="none" ' +
                'stroke="' + color + '" stroke-width="3" points=" ' + dataCollect[i] + ' " />');
        }
    } else if (typeDraw == 'hideLine' || typeDraw == 'update') {
        var counterHelp = -1;
        for (var key in dataToOut) {

            if (parseInt(key.substring(1)) != 'undefined') {
                var indexColor = parseInt(key.substring(1));
            }
            /*if(parseInt(chartObjectControl.dataToOut[i].substring(1))) {
                var indexColor = parseInt(chartObjectControl.dataToOut[i].substring(1));
            }*/
            var color = chartObjectControl.getActiveChartColor(indexColor);

            DataIdChart.insertAdjacentHTML('beforeend', '<polyline fill="none" ' +
                'stroke="' + color + '" stroke-width="3" points=" ' + dataCollect[counterHelp] + ' " />');


            counterHelp++;
        }
    }
    /*Inputs выведены, начинаем их слушать*/
    if (!typeDraw) {
        goListenToCheckboxes();
    }


    /*!!!! Построение графика*/


    /*Построение оси X*/
    /*Определяем labelX, в который будут заноситься данные для построения*/
    var AxisX = document.getElementById("x-labels");
    AxisX.innerHTML = '';
    /*Определяем количество Labels для отображения*/
    var countOfLabelsX = 5;

    if (chartObjectControl.period % 4 == 0) {
        countOfLabelsX = 4;
    }
    /*Считаем расстояние между Labels путем деления ширины графика на количество Labels*/
    /*Узнаем, какой период времени должен быть между Labels*/
    var periodForLabelX = 1;
    if (chartObjectControl.period > 5) {
        periodForLabelX = Math.ceil(chartObjectControl.period / countOfLabelsX);
    }
    if (chartObjectControl.period == 0) {
        return;
    }
    /*Создаем вспомогательную переменную для корректного задания x позиции Label оси X*/
    /*Выполняем построение оси X согласно условиям и данным*/
    var getXPosition = chartObjectControl.chartWidth - 22;


    var checkCounts = 0;
    for (var i = 0; i < axisX.length; i++) {
        if (i % periodForLabelX == 0) {
            checkCounts++;
        }
    }
    var getXPeriod;
    if (checkCounts == 5) {
        getXPeriod = (chartObjectControl.chartWidth + 30) / checkCounts;
    } else {
        getXPeriod = (chartObjectControl.chartWidth) / checkCounts;
    }

    for (var n = 0; n < axisX.length; n++) {
        if (n % periodForLabelX == 0) {
            AxisX.insertAdjacentHTML(
                'beforeend',
                '<text class="axisText" x=' + getXPosition + ' y="488">' + timeConverter(axisX[n]) + '</text>');
            getXPosition = getXPosition - (getXPeriod);
        }
    }
    /*!!!!Построение оси X*/


    /*Построение оси Y*/
    /*Определяем labelX, в который будут заноситься данные для построения*/
    var AxisY = document.getElementById("y-labels");
    AxisY.innerHTML = '<text class="axisText" x="0" y="460">0</text>';
    /*Определяем количество Labels для отображения*/
    var countOfLabelsY = 5; /*Не считая нуля. Всего 6*/
    /*Считаем расстояние между Labels путем деления ширины графика на количество Labels*/
    var diffYPosition = (chartObjectControl.chartHeight) / countOfLabelsY;  /*Тут ширина окна делиться на количество элементов в окне*/
    /*Делим максимальное значение за период на количество Label, не считая нуля*/
    var diffNewItem = Math.round(chartObjectControl.maxValueForPeriod(dataToOut) / countOfLabelsY);
    var getYPosition = chartObjectControl.chartHeight + 10;
    var k = 0; /*Задаем вспомогательную переменную для вывода значения каждого элемента*/
    var xGridDynamic = document.getElementById('xGridDynamic');
    for (var i = 0; i < countOfLabelsY; i++) {
        k = k + diffNewItem;
        getYPosition = Math.round(getYPosition - diffYPosition);
        if (i == (countOfLabelsY - 1)) {
            k = chartObjectControl.maxValueForPeriod(dataToOut);

        }

        AxisY.insertAdjacentHTML('afterBegin', '<text class="axisText" x="0" y=' + getYPosition + '>' + k + '</text>');
        xGridDynamic.insertAdjacentHTML('afterBegin', '<line x1="0" x2=' + chartObjectControl.chartWidth + ' y1=' + (getYPosition + 10) + ' y2=' + (getYPosition + 8) + '></line>')
    }
    /*!!!!Построение оси Y*/
}

function build_chart(content, data, chartObjectControl) {
    /*Определяем активный чарт по умолчанию 0, то есть первый в списке*/
    /*Узнаем для активного чарта количество линий графика, которые необходимо вывести в зависимости от выбраного чарта*/

    drawChart(chartObjectControl);

}

function isNotEmpty(obj) {
    for (var key in obj) {
        return true;
    }
    return false;
}

/*Функция конвертирования даты в читаемый формат День Месяц*/
function timeConverter(UNIX_timestamp, isInfo = false) {
    var a = new Date(UNIX_timestamp);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var day = days[a.getDay()];
    var month = months[a.getMonth()];
    var date = a.getDate();
    var time = month + ' ' + date;
    if (isInfo) {
        time = day + ', ' + month + ' ' + date;
    }
    return time;
}

function buildSliderChart(obj, typeDraw = false) {
    var dataSlider = document.getElementById('sliderChartData');
    dataSlider.innerHTML = '';
    var dataToOut = obj.getValuesForPeriod();
    var dataCollect = [];
    var slideChartHeight = 40;
    var getChartYPeriod = slideChartHeight / obj.maxValueForPeriod(dataToOut);
    generateDataForChart(dataToOut, obj, getChartYPeriod, dataCollect, slideChartHeight, 'slide', typeDraw);

    /*Строим панель для масштабирования*/
    if (typeDraw != 'hideLine') {
        rangeSlider();
    }
    if (typeDraw == 'hideLine') {
        var counterHelp = -1;
        for (var key in dataToOut) {
            if (parseInt(key.substring(1)) != 'undefined') {
                var indexColor = parseInt(key.substring(1));
            }
            var color = chartObjectControl.getActiveChartColor(indexColor);
            dataSlider.insertAdjacentHTML('beforeend', '<polyline fill="none" ' +
                'stroke="' + color + '" stroke-width="1" points=" ' + dataCollect[counterHelp] + ' " />');

            counterHelp++;
        }
    } else {
        for (var i = 0; i < obj.countLinesInChart(); i++) {
            var color = obj.getActiveChartColor(i);
            dataSlider.insertAdjacentHTML('beforeend', '<polyline fill="none" ' +
                'stroke="' + color + '" stroke-width="1" points=" ' + dataCollect[i] + ' " />');

        }
    }

}

function generateDataForChart(dataToOut, obj, getChartYPeriod, dataCollect, chartHeight, typeChart, typeDraw = false) {
    var countAllPoints;
    if (typeChart == 'slide') {
        countAllPoints = (data[obj.activeChart].columns[0].length) - 1;

        /*Здесь установим минимальное и максимальное значение по умолчанию*/

        if (typeDraw != 'hideLine') {
            dataInitialSlideChart(countAllPoints, obj.period);
        }


    } else {
        countAllPoints = obj.period;
    }

    if (typeChart == 'slide') {
        var periodOfPoints = obj.chartWidth / countAllPoints;
    } else {
        /*var periodOfPoints = Math.round(obj.chartWidth / countAllPoints);*/
        var periodOfPoints = obj.chartWidth / countAllPoints;
    }
    var startPoint;
    if (typeChart != 'slide') {
        startPoint = obj.chartWidth - 5;
    } else {
        startPoint = obj.chartWidth;
    }
    var arrJoined = [];
    var count = 0;

    for (var key in dataToOut) {
        if ((obj.typeX()) != key) {
            arrJoined[count] = [];
            for (var n = 0; n < dataToOut[key].length; n++) {
                arrJoined[count].push([startPoint, ((chartHeight - (dataToOut[key][n] * getChartYPeriod)) + 2)]);
                startPoint = startPoint - periodOfPoints;

            }
            if (typeChart != 'slide') {
                startPoint = obj.chartWidth - 5;
            } else {
                startPoint = obj.chartWidth;
            }
            dataCollect[count] = arrJoined[count].join(' ');

            count++;
        }
    }

    return dataCollect;
}

function dataInitialSlideChart(countAllPoints, period) {
    document.getElementById('bar').setAttribute('data-end', countAllPoints);
    var lp = document.getElementById('lp');
    var minValue = countAllPoints - period;
    var translateToDataPosition = minValue / countAllPoints;

    lp.setAttribute('data-pos', translateToDataPosition);

    document.getElementById('rp').setAttribute('data-pos', 1);

}

/*Прослушка изменения состояний Checkboxes
* Измениния нажатий клавиш записываются в массив hidesLines объекта chartObjectControl*/

function goListenToCheckboxes() {
    var checkboxes = document.getElementsByClassName('checkbox');
    for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].addEventListener('change', function (e) {

            var lineToHide = this.getAttribute('data-target');
            var getCheckbox = document.getElementById('label' + lineToHide);
            var getCheckboxAttribute = getCheckbox.getAttribute('style');

            if (this.checked) {
                if (chartObjectControl.hidesLines.length != 0) {
                    removeValueFromArr(chartObjectControl.hidesLines, lineToHide);
                }
                getCheckbox.setAttribute('style', (getCheckboxAttribute.replace(/background:transparent$/, "")));

            } else {
                chartObjectControl.hidesLines.push(lineToHide);
                getCheckbox.setAttribute('style', getCheckboxAttribute + ';background:transparent');

            }

            drawChart(chartObjectControl, 'hideLine', chartObjectControl.arrToUpdateChart);


        });
    }
}

function removeValueFromArr(arr, value) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === value) {
            arr.splice(i, 1);
            break;
        }
    }
    return arr;
}

/*Вывод подробной информации при наведении*/
content.addEventListener('mousemove', function (e) {
    var blockInfo = document.getElementById('info');
    blockInfo.innerHTML = '';

    var getInfoBlock = translateInfoBlock(e.offsetX, e.offsetY);


    if (getInfoBlock[3] <= -1 || (getInfoBlock[3] >= chartObjectControl.period)) {
        return;
    }

    /*Определим количество символов в значении для дальнейших манипуляций*/
    var dataForValuesPeriod = [];
    var dataForNamePeriod = {
        keyName: 0
    };

    var lengthOfName;
    for (var key in  getInfoBlock[1]) {
        dataForValuesPeriod = dataForValuesPeriod.concat(getInfoBlock[1][key][0]);

        lengthOfName = getInfoBlock[1][key][1].toString().length;
        if (lengthOfName > dataForNamePeriod.keyName) {
            dataForNamePeriod.keyName = lengthOfName;
        }
    }
    var countsOfTextValue = (Math.max.apply(null, dataForValuesPeriod)).toString().length;
    var countsOfNameValue = dataForNamePeriod.keyName;
    var xPosition = (chartObjectControl.chartWidth - (chartObjectControl.chartWidth / chartObjectControl.period) * getInfoBlock[3]) - 5;
    var widthOfRect = (20 + countsOfTextValue * 10 + 30 + countsOfNameValue * 10 + 20);
    var conditionsOfXPosition;

    if ((chartObjectControl.chartWidth - e.offsetX) < (widthOfRect - 40 /*40 здесь - это отступ */)) {
        conditionsOfXPosition = chartObjectControl.chartWidth - widthOfRect - 1;
    } else if ((chartObjectControl.chartWidth - e.offsetX) > (chartObjectControl.chartWidth - widthOfRect + (widthOfRect - 40) /*160 здесь - это отступ */)) {
        conditionsOfXPosition = 1;
    } else {
        conditionsOfXPosition = xPosition - 40;
    }

    /*ниже выводим информацию по каждому графику*/
    var helpToPositionY = 48;

    var periofForY = chartObjectControl.chartHeight / getInfoBlock[2];

    function sortArray(arr) {
        // manually sort array from smallest to largest:
        // loop through array backwards:
        for (var i = arr.length - 1; i >= 0; i--) {
            // loop again through the array, moving backwards:
            for (var j = i; j >= 0; j--) {

                if (parseInt(arr[i][1].substr(1)) < parseInt(arr[j][1].substr(1))) {
                    var temp = arr[i];
                    arr[i] = arr[j];
                    arr[j] = temp;
                }
            }
        }
        return arr;
    }

    sortArray(getInfoBlock[1]);


    for (var n = 0; n < getInfoBlock[1].length; n++) {
        var rect = '';
        if (n == 0) {
            var rect = '<rect filter="url(#filter1)" x="' + conditionsOfXPosition + '" y="0" rx="10" ry="10" width="' + widthOfRect + '" height="' + (35 + getInfoBlock[1].length * 25) + '" stroke="#e6e3e3" fill="#ffffff"></rect>' +
                '<text id="textOutDate"  x="' + (conditionsOfXPosition + (widthOfRect / 2 - getInfoBlock[0].length * 4)) + '" y="23">' + getInfoBlock[0] + '</text>';
        }
        blockInfo.insertAdjacentHTML('beforeend', '' +
            '<circle r="4" stroke="' + getInfoBlock[1][n][2] + '" cx="' + xPosition + '" cy="' + (chartObjectControl.chartHeight - getInfoBlock[1][n][0] * periofForY) + '" class="pie"/>' +
            rect +
            '<text class="textOutValue" fill="' + getInfoBlock[1][n][2] + '" x="' + (conditionsOfXPosition + 15) + '" y="' + helpToPositionY + '">' + getInfoBlock[1][n][0] + '</text>' +
            '<text class="textOutName" fill="' + getInfoBlock[1][n][2] + '" x="' + (conditionsOfXPosition + (widthOfRect - 15 - countsOfNameValue * 9.5)) + '" y="' + helpToPositionY + '">' + getInfoBlock[1][n][1] + '</text>'
        );
        helpToPositionY += 25;

    }

    document.getElementById('hoverLine').innerHTML = '<line x1="' + xPosition + '" x2="' + xPosition + '" y1="10" y2="468"></line>';

});

content.addEventListener('mouseout', function (e) {
    document.getElementById('hoverLine').innerHTML = '';
    document.getElementById('info').innerHTML = '';

});

function translateInfoBlock(x, y) {

    var arrData = chartObjectControl.cacheDataToOut;
    var maxWidth = chartObjectControl.chartWidth;
    var countEl = chartObjectControl.period;
    var periodBeforePointsX = maxWidth / countEl;
    var WhereIsHoverMouse = (x + 5) / periodBeforePointsX;
    var findhoverElement = countEl - Math.round(WhereIsHoverMouse);
    var hoverTime = arrData[chartObjectControl.typeX()][findhoverElement];
    var getDataOfCharts = [];
    var maxValueInfoBlock = chartObjectControl.maxValueForPeriod(arrData);

    calculateValuesOfCharts();

    function calculateValuesOfCharts() {

        var count = 0;
        for (var key in arrData) {
            if (chartObjectControl.typeX() != key) {
                getDataOfCharts[count] = [];
                getDataOfCharts[count].push(arrData[key][findhoverElement]);
                getDataOfCharts[count].push(chartObjectControl.getName(key, 'obj'));
                getDataOfCharts[count].push(chartObjectControl.getActiveChartColor(key, 'obj'));
                count++;
            }

        }
        return getDataOfCharts;

    }

    hoverTime = timeConverter(hoverTime, true);
    return [hoverTime, getDataOfCharts, maxValueInfoBlock, findhoverElement];

}





