import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Seed data for AssociationHub MVP
 * Creates 3 predefined templates: Parents, Sports, Cultural
 */

// Template 1: Parents d'élèves (with hierarchical groups)
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
  // Hierarchical groups: Parent levels (6ème, 5ème, 4ème, 3ème) with 4 classes each
  groupHierarchy: [
    {
      name: "6ème",
      category: "niveau",
      children: [
        { name: "6ème 1", category: "classe" },
        { name: "6ème 2", category: "classe" },
        { name: "6ème 3", category: "classe" },
        { name: "6ème 4", category: "classe" },
      ],
    },
    {
      name: "5ème",
      category: "niveau",
      children: [
        { name: "5ème 1", category: "classe" },
        { name: "5ème 2", category: "classe" },
        { name: "5ème 3", category: "classe" },
        { name: "5ème 4", category: "classe" },
      ],
    },
    {
      name: "4ème",
      category: "niveau",
      children: [
        { name: "4ème 1", category: "classe" },
        { name: "4ème 2", category: "classe" },
        { name: "4ème 3", category: "classe" },
        { name: "4ème 4", category: "classe" },
      ],
    },
    {
      name: "3ème",
      category: "niveau",
      children: [
        { name: "3ème 1", category: "classe" },
        { name: "3ème 2", category: "classe" },
        { name: "3ème 3", category: "classe" },
        { name: "3ème 4", category: "classe" },
      ],
    },
  ],
};

// Template 2: Sports Club (with hierarchical groups)
const sportsTemplate = {
  roles: [
    { name: "entraineur", displayName: "Entraîneur", sortOrder: 1 },
    { name: "joueur", displayName: "Joueur", sortOrder: 2 },
    { name: "parent", displayName: "Parent", sortOrder: 3 },
  ],
  groupHierarchy: [
    {
      name: "Football",
      category: "sport",
      children: [
        { name: "U12", category: "equipe" },
        { name: "U15", category: "equipe" },
        { name: "U18", category: "equipe" },
        { name: "Seniors", category: "equipe" },
      ],
    },
    {
      name: "Basketball",
      category: "sport",
      children: [
        { name: "Poussins", category: "equipe" },
        { name: "Cadets", category: "equipe" },
        { name: "Juniors", category: "equipe" },
        { name: "Seniors", category: "equipe" },
      ],
    },
  ],
};

// Template 3: Cultural Association (with hierarchical groups)
const culturalTemplate = {
  roles: [
    { name: "president", displayName: "Président", sortOrder: 1 },
    { name: "membre_actif", displayName: "Membre actif", sortOrder: 2 },
    { name: "membre", displayName: "Membre", sortOrder: 3 },
  ],
  groupHierarchy: [
    {
      name: "Musique",
      category: "discipline",
      children: [
        { name: "Piano", category: "section" },
        { name: "Guitare", category: "section" },
        { name: "Chant", category: "section" },
        { name: "Violon", category: "section" },
      ],
    },
    {
      name: "Théâtre",
      category: "discipline",
      children: [
        { name: "Débutant", category: "section" },
        { name: "Intermédiaire", category: "section" },
        { name: "Avancé", category: "section" },
        { name: "Expert", category: "section" },
      ],
    },
  ],
};

async function main() {
  console.log("🌱 Starting seed...");

  // Clean existing data (cascade will handle junction tables)
  await prisma.emailCampaign.deleteMany();
  await prisma.memberRole.deleteMany();
  await prisma.memberGroup.deleteMany();
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

  // Seed hierarchical groups
  let totalGroups = 0;
  for (const parentGroup of selectedTemplate.groupHierarchy) {
    // Create parent group
    const parent = await prisma.groupType.create({
      data: {
        name: parentGroup.name,
        category: parentGroup.category,
      },
    });
    totalGroups++;

    // Create child groups
    for (const childGroup of parentGroup.children) {
      await prisma.groupType.create({
        data: {
          name: childGroup.name,
          category: childGroup.category,
          parentId: parent.id, // Link to parent
        },
      });
      totalGroups++;
    }
    console.log(`✅ Created parent group "${parent.name}" with ${parentGroup.children.length} children`);
  }
  console.log(`✅ Created ${totalGroups} total groups (hierarchical)`);

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
