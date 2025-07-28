const { Pool } = require('pg');

const pool = new Pool({
    connectionString: "postgres://eden:@localhost:5432/member"
});

module.exports = {
    pool
};
