let windValues = null;
let hourlyData = [];
let history = [];
setChart([
    ['Year', 'Sales'],
    ['1',  Math.random() * 1000],
    ['2',  Math.random() * 1000],
    ['3',  Math.random() * 1000],
    ['4',  Math.random() * 1000],
    ['5',  Math.random() * 1000],
    ['6',  Math.random() * 1000],
    ['1',  Math.random() * 1000],
    ['2',  Math.random() * 1000],
    ['3',  Math.random() * 1000],
    ['4',  Math.random() * 1000],
    ['5',  Math.random() * 1000],
    ['6',  Math.random() * 1000],
    ['1',  Math.random() * 1000],
    ['2',  Math.random() * 1000],
    ['3',  Math.random() * 1000],
    ['4',  Math.random() * 1000],
    ['5',  Math.random() * 1000],
    ['6',  Math.random() * 1000],
    ['7',  Math.random() * 1000]
]);

$(window).on('resize', function() {
setChart(windValues);
});

$('.sun, .moon').each(function() {
    let rValue = parseInt($(this).css('--width'), 10);
    $(this).css('transform-origin', `${rValue / 2 + 150 - 1.5}px`);
});

let isSunSelected = true;
let sunRiseTime = 'N/A';
let sunSetTime = 'N/A';
let moonRiseTime = 'N/A';
let moonSetTime = 'N/A';
$('.sun-moon-btn').on('click', ()=> {
    if(isSunSelected){ //moon mode
        isSunSelected = false;
        showMoonMode();
    }else{ //sun mode
        isSunSelected = true;
        showSunMode();
    }
});

function showMoonMode(){
    $('.sunrise h1').text('Moonrise & Moonset');
    $('.btn-circle').css('background', '#038eff');
    $('.btn-circle').css('left', '40px');
    $('.moon').css('display', 'inline');
    $('.sun').css('display', 'none');
    $('.path div').eq(1).css('display', 'block');
    $('.path div').eq(0).css('display', 'none');
    $('.path').css('borderColor', '#038eff');
    $('.sun-details div p:first-child').css('color', '#038eff');
    $('.sun-details p').eq(0).text('Moonrise');
    $('.sun-details p').eq(2).text('Moonset');
    $('.sun-icons img').eq(0).attr('src', 'assests/imgs/moonrise.png');
    $('.sun-icons img').eq(1).attr('src', 'assests/imgs/moonset.png');
    $('#riseTime').text(moonRiseTime);
    $('#setTime').text(moonSetTime);
}
function showSunMode(){
    $('.sunrise h1').text('Sunrise & Sunset');
    $('.btn-circle').css('background', '#ffb443');
    $('.btn-circle').css('left', '0px');
    $('.sun').css('display', 'inline');
    $('.moon').css('display', 'none');
    $('.path div').eq(0).css('display', 'block');
    $('.path div').eq(1).css('display', 'none');
    $('.path').css('borderColor', '#ffb443');
    $('.sun-details div p:first-child').css('color', '#ff9a03');
    $('.sun-details p').eq(0).text('Sunrise');
    $('.sun-details p').eq(2).text('Sunset');
    $('.sun-icons img').eq(0).attr('src', 'assests/imgs/sunrise.png');
    $('.sun-icons img').eq(1).attr('src', 'assests/imgs/sunset.png');
    $('#riseTime').text(sunRiseTime);
    $('#setTime').text(sunSetTime);
}

function setChart(array) { 
    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {
    var data = google.visualization.arrayToDataTable(array);

    var options = {
        curveType: 'function',
        legend: { position: 'none' }, // Set legend to 'none' to hide it
        title: null, // Set title to null to remove it
        backgroundColor: '#ededed',
        hAxis: {
            gridlines: {color: 'transparent'} // Set the color to transparent to hide horizontal gridlines
        },
        vAxis: {
            gridlines: {color: 'transparent'} // Set the color to transparent to hide vertical gridlines
        }
    };

    var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

    chart.draw(data, options);
    }
}

function getWeather(location) {
    const url = `https://weatherapi-com.p.rapidapi.com/forecast.json?q=${location}&days=3`;

    return $.ajax({
        url: url,
        method: "GET",
        headers: {
            "X-RapidAPI-Key": "e9855d1debmsh6124199b63684fcp1dd828jsnaf517d11e031",
            "X-RapidAPI-Host": "weatherapi-com.p.rapidapi.com",
        },
    });
}

$('#search').keypress(function(event) {
    if (event.which === 13) {
        let location = $(this).val();

        getWeather(location)
            .done(data => {
                console.log(data);

                setData(data);
            })
            .fail((xhr, textStatus, errorThrown) => {
                console.error("AJAX error:", textStatus, errorThrown);
            });

    }
});

function setData(data){
    // set current weather details
    $('#currentWeatherText').text(data.current.condition.text);
    $('#currentWeatherTemp').text(data.current.temp_c + '°C');
    $('#location').text(data.location.name + ', ' + data.location.country);
    $('#currentDateTime').text(convertDateTime(data.location.localtime));

    // set forecast weather details
        // 1st day
        let day = data.forecast.forecastday[1];
        $('.forecast-day').eq(0).html(`
            <b>${getWeekdayFromDate(day.date)}</b> <span>${convertDateTime(day.date).split(',')[0]}</span>
        `);
        $('.forecast-temp').eq(0).text(`${day.day.mintemp_c} - ${day.day.maxtemp_c}°C`);
        $('.forecast-weather').eq(0).text(day.day.condition.text);
        $('.forecast-wind').eq(0).text(`Wind ${day.day.maxwind_kph}km/h`);

        // 2nd day
        day = data.forecast.forecastday[2];
        $('.forecast-day').eq(1).html(`
            <b>${getWeekdayFromDate(day.date)}</b> <span>${convertDateTime(day.date).split(',')[0]}</span>
        `);
        $('.forecast-temp').eq(1).text(`${day.day.mintemp_c} - ${day.day.maxtemp_c}°C`);
        $('.forecast-weather').eq(1).text(day.day.condition.text);
        $('.forecast-wind').eq(1).text(`Wind ${day.day.maxwind_kph}km/h`);

    // set highlights
        // wind status
        let hours = data.forecast.forecastday[0].hour;
        windValues = [['hour', 'speed']];
        for(let i = 0; i < 24; i++){
            windValues.push([i, hours[i].wind_kph]);
        }
        setChart(windValues);
        let hour = getHourFromDate(data.location.localtime);
        $('.v-line').css('left', `${hour * (100.0/24)}%`);
        $('#wind-details p').eq(0).text(hours[hour].wind_kph);
        $('#wind-details p').eq(1).text(convertDateTime(data.location.localtime).split('at ')[1]);

        // humidity
        $('.humidity p').text(data.current.humidity);

        // uv index
        $('.uv-index p').text(data.current.uv);

        // sunrise & sunset | moonrise & moonset
        let astro = data.forecast.forecastday[0].astro;
        let currentTimeFromMinutes = getTimeInMinutes(convertDateTime(data.location.localtime).split('at ')[1]);

            //sunrise & sunset
            sunRiseTime = astro.sunrise;
            sunSetTime = astro.sunset;

            let gapOfMinutes = calculateTimeGap(sunRiseTime, sunSetTime);
            let sunRiseTimeFromMinutes = getTimeInMinutes(sunRiseTime);
            console.log(gapOfMinutes);
            $('.sun, .path div:first-child').css('transform', `rotate(${180.0 / gapOfMinutes * (currentTimeFromMinutes - sunRiseTimeFromMinutes)}deg)`);

            //moonrise & moonset
            moonRiseTime = astro.moonrise;
            moonSetTime = astro.moonset;

            gapOfMinutes = calculateTimeGap(moonRiseTime, moonSetTime);
            let moonRiseTimeFromMinutes = getTimeInMinutes(moonRiseTime);
            console.log(gapOfMinutes);
            $('.moon, .path div:nth-child(2)').css('transform', `rotate(${180.0 / gapOfMinutes * (currentTimeFromMinutes - moonRiseTimeFromMinutes)}deg)`);

            if(isSunSelected){
                $('#riseTime').text(sunRiseTime);
                $('#setTime').text(sunSetTime);
            }else{
                $('#riseTime').text(moonRiseTime);
                $('#setTime').text(moonSetTime);
            }

    // set weather list
    hourlyData = getHourlyData(data);
    $('#btn_1h').click();
    history = getHistory(data.location.name);
}

$('#btn_1h').on('click', ()=>{
    $('.weathers').html("");
    for(let i = 0; i < hourlyData.length; i++){
        let hourData = hourlyData[i]
        $('.weathers').append(`
            <div class="weather-card">
                <img src="assests/imgs/test2.png" alt="">
                <h3>${hourData[1]}</h3>
                <h3><b>${hourData[2]}</b></h3>
                <h3>${hourData[3]}</h3>
            </div>
        `);
    }
});

$('#btn_6h').on('click', ()=>{
    $('.weathers').html("");
    for(let i = 0; i < hourlyData.length; i+=6){
        let hourData = hourlyData[i]
        $('.weathers').append(`
            <div class="weather-card">
                <img src="assests/imgs/test2.png" alt="">
                <h3>${hourData[1]}</h3>
                <h3><b>${hourData[2]}</b></h3>
                <h3>${hourData[3]}</h3>
            </div>
        `);
    }
});

$('#btn_12h').on('click', ()=>{
    $('.weathers').html("");
    for(let i = 0; i < hourlyData.length; i+=12){
        let hourData = hourlyData[i]
        $('.weathers').append(`
            <div class="weather-card">
                <img src="assests/imgs/test2.png" alt="">
                <h3>${hourData[1]}</h3>
                <h3><b>${hourData[2]}</b></h3>
                <h3>${hourData[3]}</h3>
            </div>
        `);
    }
});

$('#btn_history').on('click', ()=>{
    $('.weathers').html("");
    for(let i = 0; i < history.length; i++){
        let day = history[i];
        $('.weathers').append(`
            <div class="weather-card">
                <img src="assests/imgs/test2.png" alt="">
                <h3>${day[1]}</h3>
                <h3><b>${day[2]}</b></h3>
                <h3>${day[3]}</h3>
            </div>
        `);
    }
});

function getHistory(location){
    let pastDays = getPast7Days();
    let weatherHistory = new Array(7);

    for(let i = 0; i < pastDays.length; i++){
        getPastDayWeather(location, pastDays[i])
        .done(function (response) {
            let day = response.forecast.forecastday[0];
            let time = convertDateTime(day.date + ' 10:00');
            weatherHistory[i] = ([
                day.day.condition.text,
                day.day.avgtemp_c,
                time.split(',')[0],
                '--:--'
            ])
        })
        .fail((xhr, textStatus, errorThrown) => {
            console.error("AJAX error:", textStatus, errorThrown);
        });
    }
    
    return weatherHistory;
}

function getPastDayWeather(location, date){
    let settings = {
        async: true,
        crossDomain: true,
        url: `https://weatherapi-com.p.rapidapi.com/history.json?q=${location}&dt=${date}&lang=en`,
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': 'e9855d1debmsh6124199b63684fcp1dd828jsnaf517d11e031',
            'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
        }
    };
    
    return $.ajax(settings);
}

function getPast7Days() {
    let pastDays = [];
    const today = new Date();

    for (let i = 1; i <= 7; i++) {
        const pastDate = new Date(today);
        pastDate.setDate(today.getDate() - i);
        pastDays.push(pastDate.toISOString().split('T')[0]);
    }

    return pastDays;
}

function getHourlyData(data){
    let days = data.forecast.forecastday;
    let hourlyData = [];
    for(let i = 0; i < 3; i++){     // get day
        let hours = days[i].hour;
        for(let j = 0; j < 24; j++){    //get hour
            let time = convertDateTime(hours[j].time);

            hourlyData.push([
                hours[j].condition.text,
                '+' + hours[j].temp_c + '°C',
                time.split(',')[0],
                time.split('at ')[1]
            ]);

        }
    }

    return hourlyData;
}

function convertDateTime(inputDate) {
    const options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    };

    const date = new Date(inputDate);
    const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);

    return formattedDate;
}

function getWeekdayFromDate(inputDate) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const date = new Date(inputDate);
    const weekday = daysOfWeek[date.getDay()];

    return weekday;
}

function getHourFromDate(inputDate) {
    const date = new Date(inputDate);
    const hour = date.getHours();

    return hour;
}

function getTimeInMinutes(timeString) {
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);

    let totalMinutes = hours * 60 + minutes;

    // Adjust for PM if needed
    if (period.toLowerCase() === 'pm' && hours !== 12) {
        totalMinutes += 12 * 60;
    }

    return totalMinutes;
}

function calculateTimeGap(time1, time2) {
    const minutes1 = getTimeInMinutes(time1);
    let minutes2 = getTimeInMinutes(time2);

    // If the second time is earlier, add 24 hours (1440 minutes)
    if (minutes2 < minutes1) {
        minutes2 += 24 * 60;
    }

    return Math.abs(minutes2 - minutes1);
}