#!/usr/bin/env python3
"""
Generate a sample CSV with 500 members for AssociationHub
Shows various combinations of roles and groups including many-to-many examples
"""

import csv
import random

# French first names
first_names = [
    "Jean", "Marie", "Pierre", "Sophie", "Luc", "Anne", "Thomas", "Claire",
    "Michel", "Julie", "François", "Isabelle", "Nicolas", "Céline", "Olivier",
    "Nathalie", "Patrick", "Valérie", "Christophe", "Sandrine", "Alain", "Catherine",
    "Stéphane", "Martine", "Daniel", "Brigitte", "Thierry", "Monique", "Gérard",
    "Sylvie", "Bernard", "Jacqueline", "Philippe", "Françoise", "André", "Dominique",
    "Christine", "Marc", "Véronique", "Pascal", "Laurence", "Bruno", "Corinne",
    "Didier", "Agnès", "Serge", "Chantal", "Yves", "Nicole", "Christian", "Michèle",
    "Jacques", "Danielle", "René", "Josiane", "Gilbert", "Denise", "Roger", "Yvette",
    "Raymond", "Colette", "Henri", "Paulette", "Maurice", "Suzanne", "Robert",
    "Jeannine", "Georges", "Andrée", "Louis", "Simone", "Marcel", "Lucienne",
    "Albert", "Germaine", "Paul", "Henriette", "Fernand", "Madeleine", "Lucien",
    "Hélène", "Antoine", "Odette", "Gaston", "Marguerite", "Émile", "Jeanne",
    "Léon", "Marcelle", "Armand", "Renée", "Eugène", "Yvonne", "Alphonse", "Thérèse",
    "Berthe", "Jules", "Léonie", "Édouard", "Marthe", "Victor", "Blanche", "Ernest",
    "Lucie", "Arthur", "Cécile", "Raoul", "Juliette", "Léopold", "Augustine"
]

# French last names
last_names = [
    "Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand",
    "Leroy", "Moreau", "Simon", "Laurent", "Lefebvre", "Michel", "Garcia", "David",
    "Bertrand", "Roux", "Vincent", "Fournier", "Morel", "Girard", "André", "Lefevre",
    "Mercier", "Dupont", "Lambert", "Bonnet", "François", "Martinez", "Legrand",
    "Garnier", "Faure", "Rousseau", "Blanc", "Guerin", "Muller", "Henry", "Roussel",
    "Nicolas", "Perrin", "Morin", "Mathieu", "Clement", "Gauthier", "Dumont", "Lopez",
    "Fontaine", "Chevalier", "Robin", "Masson", "Sanchez", "Gerard", "Nguyen", "Boyer",
    "Denis", "Lemaire", "Duval", "Joly", "Gautier", "Roger", "Roche", "Roy", "Noel",
    "Meyer", "Lucas", "Meunier", "Jean", "Perez", "Marchand", "Dufour", "Blanchard",
    "Marie", "Barbier", "Brun", "Dumas", "Brunet", "Schmitt", "Leroux", "Colin",
    "Fernandez", "Pierre", "Renard", "Arnaud", "Rolland", "Caron", "Giraud", "Leclerc",
    "Vidal", "Bourgeois", "Renaud", "Lemoine", "Picard", "Gaillard", "Philippe",
    "Leclercq", "Lacroix", "Fabre", "Dupuis", "Olivier", "Rodriguez", "Da Silva"
]

# Roles
roles = ["delegue_titulaire", "delegue_suppleant", "membre"]

# Groups (hierarchical: 4 levels × 4 classes each)
groups = []
for level in ["6ème", "5ème", "4ème", "3ème"]:
    for class_num in range(1, 5):
        groups.append(f"{level} {class_num}")

def generate_members(count=500):
    """Generate sample members with various role/group combinations"""
    members = []
    used_emails = set()
    
    for i in range(count):
        # Generate unique name and email
        first = random.choice(first_names)
        last = random.choice(last_names)
        
        # Create unique email
        email_base = f"{first.lower().replace('é', 'e').replace('è', 'e').replace('ê', 'e')}.{last.lower()}@example.com"
        email = email_base
        counter = 2
        while email in used_emails:
            email = f"{first.lower().replace('é', 'e').replace('è', 'e').replace('ê', 'e')}.{last.lower()}{counter}@example.com"
            counter += 1
        used_emails.add(email)
        
        # Assign roles (90% single role, 10% multiple roles)
        if random.random() < 0.9:
            # Single role
            member_roles = [random.choice(roles)]
        else:
            # Multiple roles (2 roles)
            member_roles = random.sample(roles, 2)
        
        # Assign groups (85% single group, 15% multiple groups)
        if random.random() < 0.85:
            # Single group
            member_groups = [random.choice(groups)]
        else:
            # Multiple groups (2-3 groups)
            num_groups = random.randint(2, 3)
            member_groups = random.sample(groups, num_groups)
        
        # Ensure we have at least one delegue_titulaire per class
        if i < 16:  # First 16 members are delegates for each class
            member_roles = ["delegue_titulaire"]
            member_groups = [groups[i]]
        elif i < 32:  # Next 16 are delegue_suppleant
            member_roles = ["delegue_suppleant"]
            member_groups = [groups[i - 16]]
        
        members.append({
            'nom': f"{first} {last}",
            'email': email,
            'role': ';'.join(member_roles),
            'groupe': ';'.join(member_groups)
        })
    
    return members

def write_csv(filename, members):
    """Write members to CSV file"""
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['nom', 'email', 'role', 'groupe'])
        writer.writeheader()
        writer.writerows(members)

if __name__ == '__main__':
    print("Generating 500 sample members...")
    members = generate_members(500)
    
    output_file = 'sample-members-500.csv'
    write_csv(output_file, members)
    
    print(f"✅ Generated {len(members)} members in {output_file}")
    print(f"   - {sum(1 for m in members if ';' in m['role'])} members with multiple roles")
    print(f"   - {sum(1 for m in members if ';' in m['groupe'])} members with multiple groups")
