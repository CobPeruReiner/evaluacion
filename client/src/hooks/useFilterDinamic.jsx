import { useState } from 'react';
import { format } from 'date-fns';

export const useFilterDinamic = (data, dateColumn, firstDate, secondDate, setFirstDate, setSecondDate, inputText, setInputText) => {

    // const [inputText, setInputText] = useState([])
    const [suggestions, setSuggestions] = useState()

    function isValidFormat(dateString)
{
    // First check for the pattern
    if(!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString))
        return false;

    // Parse the date parts to integers
    var parts = dateString.split("/");
    var day = parseInt(parts[1], 10);
    var month = parseInt(parts[0], 10);
    var year = parseInt(parts[2], 10);

    // Check the ranges of month and year
    if(year < 1000 || year > 3000 || month == 0 || month > 12)
        return false;

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))
        monthLength[1] = 29;

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
};

    const calcularFecha = (fecha) => {
		const indiceDia = fecha?.indexOf('/');
        const dia = fecha?.slice(0,indiceDia)
        const indiceMes = fecha?.lastIndexOf('/');
        const mes = fecha?.slice(indiceDia+1,indiceMes)
        const año = fecha?.slice(indiceMes+1);
        return `${año}/${mes?.length === 1 ? `0${mes}` : mes}/${dia?.length === 1 ? `0${dia}` : dia}`;
	}

    const dateFilter = (date, date2) => {

        if (!date && !date2) {
            return data
        } else if (date && !date2) {
            alert('Elija segunda fecha')
            return
        } else if (!date && date2) {
            alert('Elija primera fecha')
            return
        } else {
            const fecha1 = new Date(date.replace(/-/g, '\/').replace(/T.+/, ''));
            const fecha2 = new Date(date2.replace(/-/g, '\/').replace(/T.+/, ''));
    
            const filtrados = data.filter(element => {
                    let fecha = element[dateColumn];
                    const indiceDia = fecha?.indexOf(',');
                    if (indiceDia > 0) {
                        fecha = fecha?.slice(0,indiceDia)
                    }
                    fecha = calcularFecha(fecha)
    
                    const fechaActual = new Date(fecha);
                    return fechaActual.getTime() >=fecha1.getTime() && fechaActual.getTime()<=fecha2.getTime();
            })
            return filtrados
        }
    };

    const handleFilter = (value) => {

        console.log(firstDate)
        console.log(secondDate)

        let currentData = dateFilter(firstDate, secondDate);

        let matches = [];
        if (value.length > 0) {
            matches = currentData.filter(item => {
                const regex = new RegExp(`${value}`, 'gi');
                const values = Object.values(item);
                for (let i = 0; i < values.length; i++) {
                    if (values[i]?.toString().match(regex)) {
                        return values[i].toString().match(regex);
                    }
                }
            });
            setSuggestions(matches);
        } else setSuggestions(currentData);
        // } else setSuggestions(dateFilter(firstDate, secondDate));
        setInputText(value);
    }

    const clearFilters = () => {
        setFirstDate('')
        setSecondDate('')
        handleFilter('')
        setSuggestions(data)
    }

    return { suggestions, setSuggestions, clearFilters, handleFilter }

}