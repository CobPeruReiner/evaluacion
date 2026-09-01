// customSelectStyles.js
const customSelectStyles = (focusedBorderColor = '#ed1c24', hoverBackgroundColor = '#fff1f2') => ({
    container: (provided) => ({
        ...provided,
        width: '100%', // Ocupa todo el ancho del contenedor
    }),
    control: (provided, state) => ({
        ...provided,
        backgroundColor: '#ffffff',
        borderColor: state.isFocused ? focusedBorderColor : '#d6d3d1',
        boxShadow: state.isFocused ? `0 0 0 2px #fee2e2` : 'none',
        '&:hover': {
            borderColor: focusedBorderColor, // Color del borde al pasar el cursor
        },
        minHeight: '46px',
        borderRadius: '8px',
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
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 12px 28px rgba(37,37,37,.12)',
        overflow: 'hidden',
        zIndex: 30,
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isFocused ? hoverBackgroundColor : '#ffffff',
        color: '#44403c',
        '&:hover': {
            backgroundColor: hoverBackgroundColor, // Fondo al pasar el cursor sobre la opción
            color: '#991b1b',
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
