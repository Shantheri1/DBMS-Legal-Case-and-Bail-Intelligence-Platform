import os
import sys
import tempfile
import shutil

os.environ['MPLCONFIGDIR'] = tempfile.gettempdir()
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import Polygon

def draw_chen_er_diagram():
    # Setup large canvas for Chen ER Diagram
    fig, ax = plt.subplots(figsize=(32, 24), dpi=200)
    ax.set_xlim(0, 320)
    ax.set_ylim(0, 240)
    ax.axis('off')

    # Title Banner (matching academic Chen presentation)
    ax.text(15, 232, "PES University  •  Dept of CSE  •  DBMS Level 3 Experiential Learning", fontsize=15, weight='bold', color='#1e293b')
    ax.text(160, 232, "JurisPredict: Entity-Relationship (ER) Diagram (Chen's Notation)", fontsize=18, weight='black', ha='center', color='#0f172a')
    ax.text(305, 232, "Shantheni Shenoy & Shriranjini", fontsize=14, weight='bold', ha='right', color='#1e293b')
    ax.text(160, 227, "Landmark Criminal Bail & Case Intelligence Platform  •  Instructor: Dr. Nagasundari S", fontsize=12, ha='center', color='#475569')

    # Legend
    # Entity Box
    ent_sample = patches.Rectangle((15, 219), 14, 5, linewidth=1.5, edgecolor='#166534', facecolor='#86efac', zorder=2)
    ax.add_patch(ent_sample)
    ax.text(22, 221.5, "Entity", fontsize=9, weight='bold', ha='center', va='center')
    ax.text(32, 221.5, "Entity Set (Strong)", fontsize=9, color='#1e293b', va='center')

    # Relationship Diamond
    poly_pts = [(75, 224), (80, 221.5), (75, 219), (70, 221.5)]
    rel_sample = Polygon(poly_pts, closed=True, linewidth=1.5, edgecolor='#1e40af', facecolor='#bfdbfe', zorder=2)
    ax.add_patch(rel_sample)
    ax.text(75, 221.5, "Rel", fontsize=8.5, weight='bold', ha='center', va='center')
    ax.text(83, 221.5, "Relationship Set", fontsize=9, color='#1e293b', va='center')

    # Attribute Oval
    attr_sample = patches.Ellipse((130, 221.5), 14, 4.5, linewidth=1.3, edgecolor='#991b1b', facecolor='#fce7f3', zorder=2)
    ax.add_patch(attr_sample)
    ax.text(130, 221.5, "Attribute", fontsize=8.5, ha='center', va='center')
    ax.text(140, 221.5, "Simple Attribute", fontsize=9, color='#1e293b', va='center')

    # PK Oval
    pk_sample = patches.Ellipse((185, 221.5), 14, 4.5, linewidth=1.5, edgecolor='#991b1b', facecolor='#fce7f3', zorder=2)
    ax.add_patch(pk_sample)
    ax.text(185, 221.5, "PK_Attr", fontsize=8.5, weight='bold', ha='center', va='center')
    ax.plot([180, 190], [220, 220], color='#991b1b', linewidth=1.4)
    ax.text(195, 221.5, "Primary Key (Underlined)", fontsize=9, color='#1e293b', va='center')

    # Cardinality notation
    ax.text(260, 221.5, "1 : 1, 1 : N, M : N = Structural Cardinality Constraints", fontsize=9.5, weight='bold', color='#1d4ed8', va='center')

    # Global style helpers
    def draw_entity(x, y, w, h, name):
        rect = patches.Rectangle((x - w/2, y - h/2), w, h, linewidth=1.8, edgecolor='#14532d', facecolor='#86efac', zorder=3)
        ax.add_patch(rect)
        ax.text(x, y, name, fontsize=10.5, weight='black', ha='center', va='center', zorder=4, color='#052e16')
        return (x, y, w, h)

    def draw_relationship(x, y, w, h, name):
        pts = [(x, y + h/2), (x + w/2, y), (x, y - h/2), (x - w/2, y)]
        diamond = Polygon(pts, closed=True, linewidth=1.5, edgecolor='#1e40af', facecolor='#bfdbfe', zorder=3)
        ax.add_patch(diamond)
        ax.text(x, y, name, fontsize=8.5, weight='bold', ha='center', va='center', zorder=4, color='#1e3a8a')
        return (x, y, w, h)

    def draw_attribute(x, y, w, h, name, is_pk=False, is_derived=False):
        ls = '--' if is_derived else '-'
        ec = '#991b1b'
        fc = '#fce7f3'
        oval = patches.Ellipse((x, y), w, h, linewidth=1.3, linestyle=ls, edgecolor=ec, facecolor=fc, zorder=3)
        ax.add_patch(oval)
        weight = 'bold' if is_pk else 'normal'
        ax.text(x, y, name, fontsize=7.8, weight=weight, ha='center', va='center', zorder=4, color='#831843')
        if is_pk:
            # Underline PK inside oval
            tw = len(name) * 0.45
            ax.plot([x - tw, x + tw], [y - 1.0, y - 1.0], color='#831843', linewidth=1.2, zorder=5)

    def connect(pt1, pt2, label=None, label_pos=0.5, color='#334155'):
        ax.plot([pt1[0], pt2[0]], [pt1[1], pt2[1]], color=color, linewidth=1.3, zorder=1)
        if label:
            lx = pt1[0] + (pt2[0] - pt1[0]) * label_pos
            ly = pt1[1] + (pt2[1] - pt1[1]) * label_pos
            ax.text(lx, ly, label, fontsize=9.5, weight='black', color='#1d4ed8',
                    bbox=dict(boxstyle='circle,pad=0.15', facecolor='#ffffff', edgecolor='none', alpha=0.85),
                    ha='center', va='center', zorder=6)

    # -------------------------------------------------------------
    # 1. ENTITY DEFINITIONS & POSITIONS (Centroids)
    # -------------------------------------------------------------
    # Top Row: ROLE, USER, COURT, JUDGE
    ent_role = draw_entity(35, 195, 20, 8, "ROLE")
    ent_user = draw_entity(105, 195, 22, 8, "USER")
    ent_court = draw_entity(215, 195, 22, 8, "COURT")
    ent_judge = draw_entity(285, 195, 22, 8, "JUDGE")

    # Second Row: CASE in the center, PERSON to left, HEARING to right
    ent_person = draw_entity(35, 140, 24, 8, "PERSON")
    ent_case = draw_entity(160, 140, 24, 9, "CASE")
    ent_hearing = draw_entity(285, 140, 24, 8, "HEARING")

    # Third Row: CHARGE, BAIL_APPLICATION, BAIL_DECISION
    ent_charge = draw_entity(85, 85, 24, 8, "CHARGE")
    ent_bail_app = draw_entity(190, 85, 28, 8, "BAIL_APPLICATION")
    ent_bail_dec = draw_entity(285, 85, 26, 8, "BAIL_DECISION")

    # Bottom Row: OFFENCE, LAW_SECTION, DOCUMENT, JUDICIAL_PRECEDENTS
    ent_offence = draw_entity(35, 30, 24, 8, "OFFENCE")
    ent_law_sec = draw_entity(105, 30, 26, 8, "LAW_SECTION")
    ent_doc = draw_entity(185, 30, 24, 8, "DOCUMENT")
    ent_precedent = draw_entity(275, 30, 32, 8, "JUDICIAL_PRECEDENTS")

    # -------------------------------------------------------------
    # 2. RELATIONSHIPS (Diamonds) & CONNECTIONS
    # -------------------------------------------------------------
    # ROLE --<Has_Role>-- USER (1:N)
    rel_has_role = draw_relationship(70, 195, 14, 7, "Has_Role")
    connect((ent_role[0], ent_role[1]), (rel_has_role[0], rel_has_role[1]), "1", 0.4)
    connect((rel_has_role[0], rel_has_role[1]), (ent_user[0], ent_user[1]), "N", 0.6)

    # COURT --<Employs>-- JUDGE (1:N)
    rel_employs = draw_relationship(250, 195, 14, 7, "Employs")
    connect((ent_court[0], ent_court[1]), (rel_employs[0], rel_employs[1]), "1", 0.4)
    connect((rel_employs[0], rel_employs[1]), (ent_judge[0], ent_judge[1]), "N", 0.6)

    # COURT --<Jurisdiction>-- CASE (1:N)
    rel_court_case = draw_relationship(185, 170, 16, 7, "Jurisdiction")
    connect((ent_court[0], ent_court[1]), (rel_court_case[0], rel_court_case[1]), "1", 0.4)
    connect((rel_court_case[0], rel_court_case[1]), (ent_case[0], ent_case[1]), "N", 0.6)

    # USER --<Files>-- CASE (1:N)
    rel_files = draw_relationship(132, 170, 14, 7, "Files")
    connect((ent_user[0], ent_user[1]), (rel_files[0], rel_files[1]), "1", 0.4)
    connect((rel_files[0], rel_files[1]), (ent_case[0], ent_case[1]), "N", 0.6)

    # CASE --<Involves>-- PERSON (M:N via Case_Party)
    rel_involves = draw_relationship(95, 140, 16, 7, "Involves")
    connect((ent_case[0], ent_case[1]), (rel_involves[0], rel_involves[1]), "M", 0.4)
    connect((rel_involves[0], rel_involves[1]), (ent_person[0], ent_person[1]), "N", 0.6)
    # Attribute of Involves relationship: party_role
    draw_attribute(95, 153, 13, 4, "party_role")
    connect((95, 143.5), (95, 151))

    # CASE --<Lists>-- HEARING (1:N)
    rel_lists = draw_relationship(225, 140, 14, 7, "Lists")
    connect((ent_case[0], ent_case[1]), (rel_lists[0], rel_lists[1]), "1", 0.4)
    connect((rel_lists[0], rel_lists[1]), (ent_hearing[0], ent_hearing[1]), "N", 0.6)

    # JUDGE --<Presides>-- HEARING (1:N)
    rel_presides = draw_relationship(285, 168, 14, 7, "Presides")
    connect((ent_judge[0], ent_judge[1]), (rel_presides[0], rel_presides[1]), "1", 0.4)
    connect((rel_presides[0], rel_presides[1]), (ent_hearing[0], ent_hearing[1]), "N", 0.6)

    # CASE --<Frames>-- CHARGE (1:N)
    rel_frames = draw_relationship(120, 112, 14, 7, "Frames")
    connect((ent_case[0], ent_case[1]), (rel_frames[0], rel_frames[1]), "1", 0.4)
    connect((rel_frames[0], rel_frames[1]), (ent_charge[0], ent_charge[1]), "N", 0.6)

    # CHARGE --<Classified_As>-- OFFENCE (N:1)
    rel_off_charge = draw_relationship(55, 58, 16, 7, "Classified_As")
    connect((ent_charge[0], ent_charge[1]), (rel_off_charge[0], rel_off_charge[1]), "N", 0.4)
    connect((rel_off_charge[0], rel_off_charge[1]), (ent_offence[0], ent_offence[1]), "1", 0.6)

    # CHARGE --<Invokes>-- LAW_SECTION (M:N)
    rel_charge_law = draw_relationship(95, 58, 14, 7, "Invokes")
    connect((ent_charge[0], ent_charge[1]), (rel_charge_law[0], rel_charge_law[1]), "M", 0.4)
    connect((rel_charge_law[0], rel_charge_law[1]), (ent_law_sec[0], ent_law_sec[1]), "N", 0.6)

    # CASE --<Petitions>-- BAIL_APPLICATION (1:N)
    rel_petitions = draw_relationship(175, 112, 14, 7, "Petitions")
    connect((ent_case[0], ent_case[1]), (rel_petitions[0], rel_petitions[1]), "1", 0.4)
    connect((rel_petitions[0], rel_petitions[1]), (ent_bail_app[0], ent_bail_app[1]), "N", 0.6)

    # USER --<Applies>-- BAIL_APPLICATION (1:N)
    connect((ent_user[0] + 5, ent_user[1] - 4), (ent_bail_app[0] - 5, ent_bail_app[1] + 4), "1:N", 0.45)

    # BAIL_APPLICATION --<Results_In>-- BAIL_DECISION (1:1)
    rel_results = draw_relationship(240, 85, 16, 7, "Results_In")
    connect((ent_bail_app[0], ent_bail_app[1]), (rel_results[0], rel_results[1]), "1", 0.4)
    connect((rel_results[0], rel_results[1]), (ent_bail_dec[0], ent_bail_dec[1]), "1", 0.6)

    # JUDGE --<Pronounces>-- BAIL_DECISION (1:N)
    connect((ent_judge[0] + 8, ent_judge[1] - 4), (ent_bail_dec[0] + 8, ent_bail_dec[1] + 4), "1:N", 0.5)

    # HEARING --<Adjudicated_At>-- BAIL_DECISION (1:1)
    rel_adj_hear = draw_relationship(285, 112, 16, 7, "Adjudicated_At")
    connect((ent_hearing[0], ent_hearing[1]), (rel_adj_hear[0], rel_adj_hear[1]), "1", 0.4)
    connect((rel_adj_hear[0], rel_adj_hear[1]), (ent_bail_dec[0], ent_bail_dec[1]), "1", 0.6)

    # CASE --<Contains>-- DOCUMENT (1:N)
    rel_case_doc = draw_relationship(175, 58, 14, 7, "Contains")
    connect((ent_case[0], ent_case[1] - 4.5), (rel_case_doc[0], rel_case_doc[1] + 3.5), "1", 0.4)
    connect((rel_case_doc[0], rel_case_doc[1] - 3.5), (ent_doc[0], ent_doc[1] + 4), "N", 0.6)

    # BAIL_APPLICATION --<Matched_Against>-- JUDICIAL_PRECEDENTS (Vector Cosine Distance)
    rel_vec_match = draw_relationship(235, 58, 20, 7, "pgvector_Match")
    connect((ent_bail_app[0] + 10, ent_bail_app[1] - 4), (rel_vec_match[0] - 8, rel_vec_match[1] + 3.5), "N", 0.4)
    connect((rel_vec_match[0] + 8, rel_vec_match[1] - 3.5), (ent_precedent[0], ent_precedent[1] + 4), "M", 0.6)

    # -------------------------------------------------------------
    # 3. ATTRIBUTE OVALS (Pink Ellipses with Underlined Keys)
    # -------------------------------------------------------------
    # ROLE attributes
    draw_attribute(15, 207, 12, 4.5, "role_id", is_pk=True)
    connect((15, 205), (28, 199))
    draw_attribute(15, 195, 13, 4.5, "role_name")
    connect((21.5, 195), (25, 195))
    draw_attribute(15, 183, 14, 4.5, "description")
    connect((22, 183), (28, 191))

    # USER attributes
    draw_attribute(85, 215, 12, 4.5, "user_id", is_pk=True)
    connect((88, 213), (98, 199))
    draw_attribute(105, 215, 12, 4.5, "name")
    connect((105, 213), (105, 199))
    draw_attribute(125, 215, 12, 4.5, "email")
    connect((122, 213), (112, 199))
    draw_attribute(140, 207, 13, 4.5, "password")
    connect((134, 205), (116, 199))

    # COURT attributes
    draw_attribute(195, 215, 12, 4.5, "court_id", is_pk=True)
    connect((198, 213), (208, 199))
    draw_attribute(215, 215, 14, 4.5, "court_name")
    connect((215, 213), (215, 199))
    draw_attribute(235, 215, 13, 4.5, "location")
    connect((232, 213), (222, 199))

    # JUDGE attributes
    draw_attribute(265, 215, 12, 4.5, "judge_id", is_pk=True)
    connect((268, 213), (278, 199))
    draw_attribute(285, 215, 12, 4.5, "name")
    connect((285, 213), (285, 199))
    draw_attribute(305, 215, 14, 4.5, "designation")
    connect((302, 213), (292, 199))

    # PERSON attributes
    draw_attribute(15, 152, 13, 4.5, "person_id", is_pk=True)
    connect((20, 150), (28, 144))
    draw_attribute(15, 140, 12, 4.5, "name")
    connect((21, 140), (23, 140))
    draw_attribute(15, 128, 14, 4.5, "date_of_birth")
    connect((20, 130), (28, 136))

    # CASE attributes
    draw_attribute(142, 158, 12, 4.5, "case_id", is_pk=True)
    connect((145, 156), (152, 144.5))
    draw_attribute(160, 158, 15, 4.5, "case_number")
    connect((160, 156), (160, 144.5))
    draw_attribute(178, 158, 12, 4.5, "title")
    connect((175, 156), (168, 144.5))
    draw_attribute(192, 150, 12, 4.5, "status")
    connect((186, 148), (172, 143))

    # HEARING attributes
    draw_attribute(270, 154, 13, 4.5, "hearing_id", is_pk=True)
    connect((273, 152), (280, 144))
    draw_attribute(302, 154, 15, 4.5, "hearing_date")
    connect((298, 152), (290, 144))
    draw_attribute(305, 140, 12, 4.5, "stage")
    connect((299, 140), (297, 140))
    draw_attribute(305, 128, 13, 4.5, "outcome")
    connect((299, 130), (292, 136))

    # CHARGE attributes
    draw_attribute(58, 97, 13, 4.5, "charge_id", is_pk=True)
    connect((64, 95), (76, 89))
    draw_attribute(58, 85, 14, 4.5, "description")
    connect((65, 85), (73, 85))

    # OFFENCE attributes
    draw_attribute(15, 42, 13, 4.5, "offence_id", is_pk=True)
    connect((20, 40), (28, 34))
    draw_attribute(15, 30, 15, 4.5, "offence_name")
    connect((22.5, 30), (23, 30))
    draw_attribute(15, 18, 12, 4.5, "bailable")
    connect((20, 20), (28, 26))

    # LAW_SECTION attributes
    draw_attribute(85, 18, 13, 4.5, "section_id", is_pk=True)
    connect((88, 20), (98, 26))
    draw_attribute(105, 18, 14, 4.5, "section_num")
    connect((105, 20), (105, 26))
    draw_attribute(125, 18, 13, 4.5, "act_name")
    connect((122, 20), (112, 26))

    # BAIL_APPLICATION attributes
    draw_attribute(155, 97, 12, 4.5, "bail_id", is_pk=True)
    connect((160, 95), (178, 89))
    draw_attribute(175, 97, 13, 4.5, "bail_type")
    connect((178, 95), (185, 89))
    draw_attribute(195, 97, 12, 4.5, "grounds")
    connect((194, 95), (191, 89))
    draw_attribute(215, 97, 15, 4.5, "risk_score", is_derived=True)
    connect((210, 95), (198, 89))

    # BAIL_DECISION attributes
    draw_attribute(270, 73, 14, 4.5, "decision_id", is_pk=True)
    connect((273, 75), (280, 81))
    draw_attribute(285, 73, 12, 4.5, "decision")
    connect((285, 75), (285, 81))
    draw_attribute(302, 73, 15, 4.5, "surety_amount")
    connect((298, 75), (290, 81))

    # DOCUMENT attributes
    draw_attribute(170, 18, 14, 4.5, "document_id", is_pk=True)
    connect((173, 20), (180, 26))
    draw_attribute(190, 18, 14, 4.5, "doc_type")
    connect((188, 20), (186, 26))

    # JUDICIAL_PRECEDENTS attributes
    draw_attribute(245, 18, 14, 4.5, "precedent_id", is_pk=True)
    connect((250, 20), (265, 26))
    draw_attribute(265, 18, 12, 4.5, "citation")
    connect((267, 20), (272, 26))
    draw_attribute(285, 18, 14, 4.5, "court_level")
    connect((283, 20), (278, 26))
    draw_attribute(305, 18, 16, 4.5, "vector_384d", is_derived=True)
    connect((300, 20), (285, 26))

    plt.tight_layout()
    out_dir = r"docs/diagrams"
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "er_diagram_chen_style.png")
    plt.savefig(out_file, bbox_inches='tight', dpi=200)
    plt.close()
    print(f"Generated Chen ER Diagram: {out_file}")

    # Copy to artifacts directory
    artifact_dir = r"C:\Users\sheno\.gemini\antigravity\brain\a5782285-3f89-45dd-b1ab-8a23c91fce50\diagrams"
    os.makedirs(artifact_dir, exist_ok=True)
    shutil.copy(out_file, os.path.join(artifact_dir, "er_diagram_chen_style.png"))
    print(f"Copied to artifact dir: {artifact_dir}")

if __name__ == '__main__':
    draw_chen_er_diagram()
