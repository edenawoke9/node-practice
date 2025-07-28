const {Client}= require("pg")

// I've separated the CREATE and INSERT statements.
const createTableQuery = `
CREATE TABLE IF NOT EXISTS "Users" (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    firstname VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    status BOOLEAN DEFAULT true
);`;

// Use single quotes for string values.
// ON CONFLICT prevents errors if you run the script multiple times.
const insertQuery = `
INSERT INTO "Users" (firstname, email, password, status)
VALUES ('eden awoke', 'ed@gmail.com', '1234', true)
ON CONFLICT (email) DO NOTHING;
`;

async function main(){
    const client = new Client({
        connectionString:"postgres://eden:@localhost:5432/member"
    });
    
    try {
        await client.connect();
        await client.query(createTableQuery);
        const res = await client.query(insertQuery);
        if (res.rowCount > 0) {
            console.log("User inserted");
        } else {
            console.log("User already exists");
        }
        console.log("done");
    } catch (e) {
        console.error(e);
    } finally {
        // .end() is a function, so it needs parentheses to be called.
        await client.end();
    }
}
main()