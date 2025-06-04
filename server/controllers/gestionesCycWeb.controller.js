const { QueryTypes } = require("sequelize");
const { catchAsync } = require("../utils/catchAsync.util");
const { dbWeb } = require("../utils/database.util");

const getAllCycGestions = async (req, res, next) => {
  const filterDate1 = req.query.filterDate1;
  const filterDate2 = req.query.filterDate2;
  const cliente = req.query.cliente;
  const cartera = req.query.cartera;

  // const cycGestions = await dbWeb.query(
  //     `
  //     SELECT a.id ID, fecha_tmk FECHA,x.nombre as CLIENTE,d.cartera AS CARTERA,a.IDENTIFICADOR,j.ACCION ACCION,
  //     e.EFECTO as EFECTO,f.MOTIVO as MOTIVO,a.OBSERVACION as OBSERVACION,i.NUMERO as TELEFONO,
  //     concat(b.APELLIDOS,', ',b.NOMBRES) as GESTOR, b.IDPERSONAL, a.ESTADO_REVISION as ESTADO
  //             FROM gestion_tmk a
  //                 LEFT JOIN personal b on a.IDPERSONAL=b.IDPERSONAL
  //                 left join tabla_log c on c.id=a.id_table
  //                 left join cartera d on d.id=c.id_cartera
  //                 left join cliente x on x.id=d.idcliente
  //                 left join efecto e on e.IDEFECTO=a.IDEFECTO
  //                 left join motivo f on f.IDMOTIVO=a.IDMOTIVO
  //                 left join telefonos i on i.IDTELEFONO=a.IDTELEFONO
  //                 left join accion j on j.IDACCION=e.IDACCION
  //     where (a.ESTADO_REVISION IS NULL OR a.ESTADO_REVISION = 0)
  //         AND date(fecha_tmk)  between :filterDate1 and :filterDate2
  //         AND x.nombre = :cliente AND d.cartera = :cartera
  //         AND OBSERVACION NOT Like '%Corta%'
  //         AND OBSERVACION NOT Like '%Corto%'
  //         AND OBSERVACION NOT Like '%Cuelga'
  //         AND OBSERVACION NOT Like '%Colgo%'
  //         AND OBSERVACION NOT Like '%CRT%'
  //         AND OBSERVACION NOT Like '%CTR%'
  //     ;
  //     `,
  //     {
  //         replacements: { filterDate1, filterDate2, cliente, cartera },
  //         type: QueryTypes.SELECT
  //     }
  // );

  const cycGestions = await dbWeb.query(
    `
        SELECT a.id ID, fecha_tmk FECHA,x.nombre as CLIENTE,d.cartera AS CARTERA,a.IDENTIFICADOR,j.ACCION ACCION,
        e.EFECTO as EFECTO,f.MOTIVO as MOTIVO,a.OBSERVACION as OBSERVACION,i.NUMERO as TELEFONO,
        concat(b.APELLIDOS,', ',b.NOMBRES) as GESTOR, b.DOC as GESTOR_DNI, b.IDPERSONAL, a.ESTADO_REVISION as ESTADO
                FROM gestion_tmk a 
                    LEFT JOIN personal b on a.IDPERSONAL=b.IDPERSONAL 
--                    left join tabla_log c on c.id=a.id_table
                    left join cartera d on d.id=c.id_cartera
                    left join cliente x on x.id=d.idcliente
                    left join efecto e on e.IDEFECTO=a.IDEFECTO 
                    left join motivo f on f.IDMOTIVO=a.IDMOTIVO 
--                    left join telefonos i on i.IDTELEFONO=a.IDTELEFONO
                    left join telefonos_actual i on i.IDTELEFONO=a.IDTELEFONO
                    left join accion j on j.IDACCION=e.IDACCION
                
                where x.nombre = :cliente
                     AND d.cartera = :cartera
                    AND b.TIPO_PERSONAL = 'HUMANO'
                    --    AND j.idcartera = :idCarteraSelected
                    --    AND j.TIPO <> 3
                        AND j.idestado= 1
                        and fecha_tmk  BETWEEN :filterDate1 and :filterDate2
                    AND (OBSERVACION IS NULL OR OBSERVACION NOT IN ('%Corta%', '%Corto%', '%Cuelga%', '%Colgo%', '%CRT%', '%CTR%'))
                    AND (a.ESTADO_REVISION IS NULL OR a.ESTADO_REVISION = 0)
        ;
        `,
    {
      // replacements: { filterDate1, filterDate2, cliente, cartera },
      replacements: {
        filterDate1: `${filterDate1} 00:00:00`,
        filterDate2: `${filterDate2} 23:59:59`,
        cliente,
        cartera,
      },
      type: QueryTypes.SELECT,
    }
  );

  res.status(200).json({
    status: "success",
    cycGestions,
  });
};

const getFilteredCycGestions = async (req, res, next) => {
  const filterDate1 = req.query.filterDate1;
  const filterDate2 = req.query.filterDate2;
  const cliente = req.query.cliente;
  const cartera = req.query.cartera;
  const efectosArray = req.query.efectosArray;
  const idCarteraSelected = req.query.idCarteraSelected;

  console.log(" ======== FUNCTION FILTERED CYC GESTIONS ================");
  console.log("Filtrando por: ", req.query);

  // const replacements = { filterDate1, filterDate2, cliente, cartera, idCarteraSelected };
  // const replacements = { filterDate1: `${filterDate1} 00:00:00`, filterDate2: `${filterDate2} 23:59:59`, cliente, cartera, idCarteraSelected };
  const replacements = {
    filterDate1: `${filterDate1} 00:00:00`,
    filterDate2: `${filterDate2} 23:59:59`,
    cliente,
    cartera,
  };

  const efectosArrayKeys = efectosArray.map(
    (_, index) => `efectoValue${index + 1}`
  );
  efectosArray.forEach((value, index) => {
    replacements[efectosArrayKeys[index]] = value;
  });

  const placeholders = efectosArrayKeys.map((key) => `:${key}`).join(",");

  // const cycGestions = await dbWeb.query(
  //     `
  //         SELECT a.id ID, fecha_tmk FECHA,x.nombre as CLIENTE,d.cartera AS CARTERA,a.IDENTIFICADOR,j.ACCION ACCION,
  //         e.EFECTO as EFECTO,f.MOTIVO as MOTIVO,a.OBSERVACION as OBSERVACION,i.NUMERO as TELEFONO,
  //         concat(b.APELLIDOS,', ',b.NOMBRES) as GESTOR, b.IDPERSONAL, a.ESTADO_REVISION as ESTADO
  //                 FROM gestion_tmk a
  //                     LEFT JOIN personal b on a.IDPERSONAL=b.IDPERSONAL
  //                     left join tabla_log c on c.id=a.id_table
  //                     left join cartera d on d.id=c.id_cartera
  //                     left join cliente x on x.id=d.idcliente
  //                     left join efecto e on e.IDEFECTO=a.IDEFECTO
  //                     left join motivo f on f.IDMOTIVO=a.IDMOTIVO
  //                     left join telefonos i on i.IDTELEFONO=a.IDTELEFONO
  //                     left join accion j on j.IDACCION=e.IDACCION
  //         where (a.ESTADO_REVISION IS NULL OR a.ESTADO_REVISION = 0)
  //             AND date(fecha_tmk)  between :filterDate1 and :filterDate2
  //             AND x.nombre = :cliente AND d.cartera = :cartera
  //             AND j.ACCION != 'ENVIAR CHAT' AND j.ACCION != 'RECIBIR CHAT'
  //             AND EFECTO IN (${placeholders})
  //             AND (OBSERVACION IS NULL OR OBSERVACION NOT IN ('%Corta%', '%Corto%', '%Cuelga%', '%Colgo%', '%CRT%', '%CTR%'))
  //         ;
  //     `,
  //     {
  //         replacements,
  //         type: QueryTypes.SELECT
  //     }
  // );

  const cycGestions = await dbWeb.query(
    `
        SELECT a.id ID, fecha_tmk FECHA,x.nombre as CLIENTE,d.cartera AS CARTERA,a.IDENTIFICADOR,j.ACCION ACCION,
        e.EFECTO as EFECTO,f.MOTIVO as MOTIVO,a.OBSERVACION as OBSERVACION,i.NUMERO as TELEFONO,
        concat(b.APELLIDOS,', ',b.NOMBRES) as GESTOR, b.DOC as GESTOR_DNI, b.IDPERSONAL, a.ESTADO_REVISION as ESTADO
                FROM gestion_tmk a 
                    LEFT JOIN personal b on a.IDPERSONAL=b.IDPERSONAL 
--                    left join tabla_log c on c.id=a.id_table
                    left join cartera d on d.id=a.id_cartera
                    left join cliente x on x.id=d.idcliente
                    left join efecto e on e.IDEFECTO=a.IDEFECTO 
                    left join motivo f on f.IDMOTIVO=a.IDMOTIVO 
--                    left join telefonos i on i.IDTELEFONO=a.IDTELEFONO
                    left join telefonos_actual i on i.IDTELEFONO=a.IDTELEFONO
                    left join accion j on j.IDACCION=e.IDACCION
        where 
            
            x.nombre = :cliente
             AND d.cartera = :cartera
            --    AND j.idcartera = :idCarteraSelected
            AND b.TIPO_PERSONAL = 'HUMANO'
            --    AND j.TIPO <> 3
                AND j.idestado= 1
                and fecha_tmk  BETWEEN :filterDate1 and :filterDate2
                AND EFECTO IN (${placeholders})
            AND (OBSERVACION IS NULL OR OBSERVACION NOT IN ('%Corta%', '%Corto%', '%Cuelga%', '%Colgo%', '%CRT%', '%CTR%'))
            AND (a.ESTADO_REVISION IS NULL OR a.ESTADO_REVISION = 0)
        ;
        `,
    {
      replacements,
      type: QueryTypes.SELECT,
    }
  );

  res.status(200).json({
    status: "success",
    cycGestions,
  });
};

/* const getFilteredCycGestions = async (req, res, next) => {


    AND OBSERVACION NOT Like '%Corta%' 
                AND OBSERVACION NOT Like '%Corto%' 
                AND OBSERVACION NOT Like '%Cuelga'
                AND OBSERVACION NOT Like '%Colgo%'
                AND OBSERVACION NOT Like '%CRT%'
                AND OBSERVACION NOT Like '%CTR%'
                
    const filterDate = req.query.filterDate;
    const cliente = req.query.cliente;
    const cartera = req.query.cartera;
    const efecto = req.query.efecto;

    const cycGestions = await dbWeb.query(
        `
            SELECT a.id ID, fecha_tmk FECHA,x.nombre as CLIENTE,d.cartera AS CARTERA,a.IDENTIFICADOR,j.ACCION ACCION,
            e.EFECTO as EFECTO,f.MOTIVO as MOTIVO,a.OBSERVACION as OBSERVACION,i.NUMERO as TELEFONO,
            concat(b.APELLIDOS,', ',b.NOMBRES) as GESTOR, b.IDPERSONAL
                    FROM gestion_tmk a 
                        LEFT JOIN personal b on a.IDPERSONAL=b.IDPERSONAL 
                        left join tabla_log c on c.id=a.id_table
                        left join cartera d on d.id=c.id_cartera
                        left join cliente x on x.id=d.idcliente
                        left join efecto e on e.IDEFECTO=a.IDEFECTO 
                        left join motivo f on f.IDMOTIVO=a.IDMOTIVO 
                        left join telefonos i on i.IDTELEFONO=a.IDTELEFONO
                        left join accion j on j.IDACCION=e.IDACCION
            where date(fecha_tmk)  = :filterDate
            AND x.nombre = :cliente AND d.cartera = :cartera
                AND OBSERVACION NOT Like '%Corta%' 
                AND OBSERVACION NOT Like '%Corto%' 
                AND OBSERVACION NOT Like '%Cuelga'
                AND OBSERVACION NOT Like '%Colgo%'
                AND OBSERVACION NOT Like '%CRT%'
                AND OBSERVACION NOT Like '%CTR%'
                AND EFECTO = :efecto
            ;
        `,
        {
            replacements: { filterDate, cliente, cartera, efecto },
            type: QueryTypes.SELECT
        }
    );

    res.status(200).json({
        status: 'success',
        cycGestions,
    });

}; */

const getClientesAndCarteras = async (req, res, next) => {
  const clientesYcarteras = await dbWeb.query(
    `
            SELECT ca.id AS 'id_cartera', ca.cartera, cli.id AS 'id_cliente', cli.nombre AS 'cliente' FROM cartera ca
            INNER JOIN cliente cli
            ON ca.idcliente = cli.id
            AND cli.estado = 1 AND ca.estado = 1;
        `,
    {
      type: QueryTypes.SELECT,
    }
  );

  res.status(200).json({
    status: "success",
    clientesYcarteras,
  });
};

const getPersonal = async (req, res, next) => {
  const personal = await dbWeb.query(
    `
            SELECT IDPERSONAL, DOC as DNI, concat(APELLIDOS, ", ", NOMBRES) AS 'ASESOR' FROM personal WHERE cargo IN (11,12) AND TIPO_PERSONAL = 'HUMANO' AND IDESTADO = 1 ORDER BY APELLIDOS;
        `,
    {
      type: QueryTypes.SELECT,
    }
  );

  res.status(200).json({
    status: "success",
    personal,
  });
};

/* NOT USED */
const getAllEfectos = async (req, res, next) => {
  const efectos = await dbWeb.query(
    `
            SELECT DISTINCT EFECTO FROM efecto WHERE HOMOLO = 'CONTACTO DIRECTO';
        `,
    {
      type: QueryTypes.SELECT,
    }
  );

  res.status(200).json({
    status: "success",
    efectos,
  });
};

const getEfectosByCartera = async (req, res, next) => {
  const cartera = req.query.cartera;

  const efectos = await dbWeb.query(
    // `
    //     SELECT
    //     DISTINCT
    //     e.efecto AS 'EFECTO'
    //     FROM efecto e
    //     INNER JOIN accion a
    //     ON e.IDACCION = a.IDACCION
    //     INNER JOIN cartera c
    //     ON a.idcartera = c.id
    //     WHERE c.cartera = :cartera;
    // `,

    // `
    //     SELECT * FROM efecto WHERE IDACCION =
    //     (SELECT IDACCION FROM accion WHERE TIPO = 1
    //         AND idcartera = :cartera AND IDESTADO = 1)
    //         AND IDESTADO = 1 ORDER BY ORDEN ASC, EFECTO ASC;
    // `,

    `
            SELECT DISTINCT EFECTO FROM efecto WHERE IDACCION IN (SELECT IDACCION FROM accion WHERE TIPO = 1 AND idcartera = :cartera AND IDESTADO = 1) AND IDCATEGORIA IN (5, 11) AND IDESTADO = 1 ORDER BY ORDEN ASC, EFECTO ASC;
        `,
    {
      replacements: { cartera },
      type: QueryTypes.SELECT,
    }
  );

  res.status(200).json({
    status: "success",
    efectos,
  });
};

module.exports = {
  getAllCycGestions,
  getClientesAndCarteras,
  getAllEfectos,
  getEfectosByCartera,
  getFilteredCycGestions,
  getPersonal,
};
