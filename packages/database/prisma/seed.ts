import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Seed data for AssociationHub MVP
 * Creates 3 predefined templates: Parents, Sports, Cultural
 */

// Template 1: Parents d'élèves
const parentsTemplate = {
  roles: [
    {
      name: "delegue_titulaire",
      displayName: "Délégué titulaire",
      sortOrder: 1,
    },
    {
      name: "delegue_suppleant",
      displayName: "Délégué suppléant",
      sortOrder: 2,
    },
    { name: "membre", displayName: "Membre", sortOrder: 3 },
  ],
  groups: [
    { name: "6e1", category: "classe" },
    { name: "5e2", category: "classe" },
    { name: "CM2", category: "classe" },
    { name: "CE1", category: "classe" },
  ],
};

// Template 2: Sports Club
const sportsTemplate = {
  roles: [
    { name: "entraineur", displayName: "Entraîneur", sortOrder: 1 },
    { name: "joueur", displayName: "Joueur", sortOrder: 2 },
    { name: "parent", displayName: "Parent", sortOrder: 3 },
  ],
  groups: [
    { name: "poussins", category: "equipe" },
    { name: "cadets", category: "equipe" },
    { name: "u12", category: "equipe" },
    { name: "lundi_18h", category: "equipe" },
  ],
};

// Template 3: Cultural Association
const culturalTemplate = {
  roles: [
    { name: "president", displayName: "Président", sortOrder: 1 },
    { name: "membre_actif", displayName: "Membre actif", sortOrder: 2 },
    { name: "membre", displayName: "Membre", sortOrder: 3 },
  ],
  groups: [
    { name: "debutant", category: "section" },
    { name: "intermediaire", category: "section" },
    { name: "expert", category: "section" },
  ],
};

async function main() {
  console.log("🌱 Starting seed...");

  // Clean existing data
  await prisma.emailCampaign.deleteMany();
  await prisma.member.deleteMany();
  await prisma.groupType.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();

  // Create default admin user
  const hashedPassword = await bcrypt.hash("password123", 10);
  const user = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: hashedPassword,
      name: "Admin User",
    },
  });
  console.log("✅ Created admin user:", user.email);

  // Determine which template to seed (default: parents)
  const template = process.env.SEED_TEMPLATE || "parents";

  let selectedTemplate;
  switch (template) {
    case "sports":
      selectedTemplate = sportsTemplate;
      console.log("🏃 Seeding Sports Club template");
      break;
    case "cultural":
      selectedTemplate = culturalTemplate;
      console.log("🎭 Seeding Cultural Association template");
      break;
    case "parents":
    default:
      selectedTemplate = parentsTemplate;
      console.log("👨‍👩‍👧‍👦 Seeding Parents d'élèves template");
      break;
  }

  // Seed roles
  for (const role of selectedTemplate.roles) {
    await prisma.role.create({ data: role });
  }
  console.log(`✅ Created ${selectedTemplate.roles.length} roles`);

  // Seed groups
  for (const group of selectedTemplate.groups) {
    await prisma.groupType.create({ data: group });
  }
  console.log(`✅ Created ${selectedTemplate.groups.length} groups`);

  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
