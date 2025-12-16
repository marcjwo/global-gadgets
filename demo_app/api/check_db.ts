import { Database } from './database';

async function check() {
    const db = new Database();
    try {
        console.log("Checking extensions...");
        const extensions = await db.query("SELECT * FROM pg_extension");
        console.log("Extensions:", extensions.map(e => e.extname));

        console.log("Checking indexes on d_products...");
        const indexes = await db.query("SELECT * FROM pg_indexes WHERE tablename = 'd_products'");
        console.log("Indexes:", indexes.map(i => i.indexdef));
        
        console.log("Checking table count...");
        const count = await db.query("SELECT count(*) FROM d_products");
        console.log("Count:", count[0]);

    } catch (e) {
        console.error(e);
    } finally {
        await db.end();
    }
}

check();
