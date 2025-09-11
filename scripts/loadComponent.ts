import fs from "fs";
import { initNeo4j } from "../lib/neo4j";

interface Component {
  component_type: string;
  text_summary: string;
  code: string;
}

async function insertComponents() {
  const driver = initNeo4j();
  const session = driver.session();

  const data: Component[] = JSON.parse(
    fs.readFileSync("knowledge_base_full_expanded.json", "utf-8")
  );

  for (const comp of data) {
    await session.run(
      `
      MERGE (c:Component {name: $name})
      SET c.type = $type,
          c.description = $description,
          c.code = $code
      MERGE (cat:Category {name: $type})
      MERGE (c)-[:BELONGS_TO]->(cat)
      `,
      {
        name: comp.component_type,
        type: comp.component_type.split(" ")[0], // Navbar, Hero, etc.
        description: comp.text_summary,
        code: comp.code,
      }
    );
  }

  await session.close();
  await driver.close();
  console.log("✅ Components inserted into Neo4j");
}

insertComponents();
