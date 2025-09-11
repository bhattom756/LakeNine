import neo4j, { Driver } from "neo4j-driver";

let driver: Driver;

export function initNeo4j() {
  if (!driver) {
    driver = neo4j.driver(
      process.env.NEO4J_URI as string, // neo4j+s://your-db.databases.neo4j.io
      neo4j.auth.basic(
        process.env.NEO4J_USER as string, // usually "neo4j"
        process.env.NEO4J_PASSWORD as string
      )
    );
  }
  return driver;
}

export async function testNeo4jConnection() {
  const driver = initNeo4j();
  const session = driver.session();
  try {
    const res = await session.run(`RETURN 'Connected to Neo4j!' as msg`);
    console.log(res.records[0].get("msg"));
  } finally {
    await session.close();
  }
}
