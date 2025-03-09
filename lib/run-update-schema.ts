import updateSchema from "./update-schema";

// Execute the schema update
updateSchema()
  .then(() => {
    console.log("Schema update process completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Schema update process failed:", error);
    process.exit(1);
  });
