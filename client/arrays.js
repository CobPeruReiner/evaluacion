const apertura = [
	{
		"nombre": "apertura1",
		"items": ["item1", "item2", "item3"]
	},
	{
		"nombre": "apertura2",
		"items": ["item2", "item2", "item3"]
	},
	{
		"nombre": "apertura3",
		"items": ["item3", "item4", "item5"]
	},
]

const updateApertura = (objeto, newItem) => {
    const { nombre, items } = objeto;
    const encontrado = apertura.find( aperturaItem => aperturaItem.nombre === nombre );
    setApertura(prevApertura => {
        if (prevApertura.nombre === encontrado.nombre) {
            const newItems = prevApertura.push(newItem);
            return {...prevApertura, items: newItems}
        } else return prevApertura
    })

}

const indagacion = [
	{
		"nombre": "indagacion1",
		"items": ["item1", "item2", "item3"]
	},
	{
		"nombre": "indagacion2",
		"items": ["item2", "item2", "item3"]
	},
	{
		"nombre": "indagacion3",
		"items": ["item3", "item4", "item5"]
	},
]

const manejo = [
	{
		"nombre": "manejo",
		"items": ["item1", "item2", "item3"]
	},
	{
		"nombre": "manejo",
		"items": ["item2", "item2", "item3"]
	},
	{
		"nombre": "manejo",
		"items": ["item3", "item4", "item5"]
	},
]