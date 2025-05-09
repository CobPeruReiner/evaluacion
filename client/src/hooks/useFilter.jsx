import { useEffect, useState } from 'react';

export const useFilter = (data) => {

    const [inputText, setInputText] = useState('')
    const [suggestions, setSuggestions] = useState()

    const dateFilter = (firstDate, secondDate) => {
        const fecha1 = new Date(firstDate.replace(/-/g, '\/').replace(/T.+/, ''));
        const fecha2 = new Date(secondDate.replace(/-/g, '\/').replace(/T.+/, ''));

        const filtrados = data.filter(element => {
            let fecha = (element.fecha_monitoreo)?.slice(0,10);
            const indiceDia = fecha?.indexOf('/');
            const dia = fecha?.slice(0,indiceDia)
            const indiceMes = fecha?.lastIndexOf('/');
            const mes = fecha?.slice(indiceDia+1,indiceMes)
            const año = fecha?.slice(indiceMes+1);
            fecha = `${año}/${mes?.length === 1 ? `0${mes}` : mes}/${dia?.length === 1 ? `0${dia}` : dia}`;
            const fechaActual = new Date(fecha);
            return fechaActual>=fecha1 && fechaActual<=fecha2;
        })
        setSuggestions(filtrados)
};
    
    const handleFilter = (value) => {
        console.log(value)
        let matches = [];
        if (value.length > 0) {
            matches = data.filter(item => {
                const regex = new RegExp(`${value}`, 'gi');
                const values = Object.values(item);
                for (let i = 0; i < values.length; i++) {
                    console.log(values[i])
                    if (values[i]?.toString().match(regex)) {
                        return values[i].toString().match(regex);
                    }
                }
            });
            setSuggestions(matches);
        } else setSuggestions(data);
        setInputText(value);
    }

    const showAll = () => {
        setSuggestions(data);
    }

    return {
        inputText, suggestions, setSuggestions, showAll, handleFilter, dateFilter
    }

}