# Lista definitiva de carteras tipo castigo
CARTERAS_CASTIGO = [29, 34, 40, 45, 46, 51, 53, 61, 65, 76, 80, 85]

def es_cartera_castigo(id_cartera):
    return int(id_cartera) in CARTERAS_CASTIGO