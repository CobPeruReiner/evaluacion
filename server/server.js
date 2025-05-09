const { app } = require('./app');
const { db, dbWeb } = require('./utils/database.util');

db.authenticate()
    .then(() => console.log('Local DB authenticated'))
    .catch(err => console.log(err));

db.sync()
    .then(() => console.log('Local DB synced'))
    .catch(err => console.log(err));

dbWeb.authenticate()
    .then(() => console.log('SISTEMAGEST authenticated'))
    .catch(err => console.log(err));

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`);
});