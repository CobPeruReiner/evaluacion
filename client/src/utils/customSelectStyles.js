// customSelectStyles.js
const customSelectStyles = (focusedBorderColor = '#b5651d', hoverBackgroundColor = '#e6e6e6') => ({
    container: (provided) => ({
        ...provided,
        width: '100%', // Ocupa todo el ancho del contenedor
    }),
    control: (provided, state) => ({
        ...provided,
        backgroundColor: '#f0f0f0', // Fondo del control
        borderColor: state.isFocused ? focusedBorderColor : '#ced4da', // Color del borde personalizado
        boxShadow: state.isFocused ? `0 0 0 1px ${focusedBorderColor}` : 'none', // Sombra al estar enfocado
        '&:hover': {
            borderColor: focusedBorderColor, // Color del borde al pasar el cursor
        },
        height: '40px', // Altura del selector
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#6c757d', // Color del texto del placeholder
    }),
    input: (provided) => ({
        ...provided,
        color: '#495057', // Color del texto del input
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#495057', // Color del valor seleccionado
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: '#f0f0f0', // Fondo del menú desplegable
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isFocused ? hoverBackgroundColor : 'transparent', // Fondo personalizado al enfocar
        color: state.isFocused ? '#ffffff' : '#495057', // Color de la opción
        '&:hover': {
            backgroundColor: hoverBackgroundColor, // Fondo al pasar el cursor sobre la opción
            color: '#ffffff', // Color del texto al pasar el cursor
        },
    }),
    dropdownIndicator: (provided, state) => ({
        ...provided,
        color: state.isFocused ? focusedBorderColor : '#495057', // Color del indicador desplegable
        '&:hover': {
            color: focusedBorderColor, // Cambia el color al pasar el cursor
        },
    }),
    clearIndicator: (provided) => ({
        ...provided,
        color: '#6c757d', // Color del ícono de limpiar
        '&:hover': {
            color: focusedBorderColor, // Color al pasar el cursor sobre el ícono de limpiar
        },
    }),
});

export default customSelectStyles;
