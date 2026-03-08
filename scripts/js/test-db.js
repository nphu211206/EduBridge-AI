const sequelize = require('./services/user-service/config/database');

async function test() {
    try {
        await sequelize.authenticate();
        const queryInterface = sequelize.getQueryInterface();
        const tableDetails = await queryInterface.describeTable('Users');
        console.log(JSON.stringify(tableDetails, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
test();
