import os
import sys
import tempfile
import shutil

os.environ['MPLCONFIGDIR'] = tempfile.gettempdir()
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import Polygon

def generate_academic_chen_er():
    # Setup ultra high-res canvas (36 x 28 inches at 300 DPI = 10,800 x 8,400 pixels)
    fig, ax = plt.subplots(figsize=(36, 28), dpi=300)
    ax.set_xlim(0, 360)
    ax.set_ylim(0, 280)
    ax.axis('off')

    # Background
    fig.patch.set_facecolor('#ffffff')
    ax.set_facecolor('#ffffff')

    # Academic Title Header
    ax.text(12, 272, "PES UNIVERSITY  •  DEPARTMENT OF CSE", fontsize=15, weight='black', color='#1e293b')
    ax.text(180, 272, "JurisPredict: Entity-Relationship (ER) Diagram (Chen's Notation)", fontsize=19, weight='black', ha='center', color='#0f172a')
    ax.text(348, 272, "Shantheni Shenoy & Shriranjini", fontsize=14, weight='bold', ha='right', color='#1e293b')
    ax.text(180, 266, "Level 3 DBMS Experiential Learning Project  •  Instructor: Dr. Nagasundari S", fontsize=12.5, ha='center', color='#475569')

    # Legend Bar (Matching Chen standard)
    # Entity Box
    ax.add_patch(patches.Rectangle((12, 256), 18, 5.5, linewidth=1.6, edgecolor='#166534', facecolor='#86efac'))
    ax.text(21, 258.7, "Entity Set", fontsize=9.5, weight='black', ha='center', va='center', color='#052e16')

    # Relationship Diamond
    ax.add_patch(Polygon([(80, 261.5), (86, 258.7), (80, 256), (74, 258.7)], closed=True, linewidth=1.5, edgecolor='#1e40af', facecolor='#bfdbfe'))
    ax.text(80, 258.7, "Rel Set", fontsize=9, weight='bold', ha='center', va='center', color='#1e3a8a')

    # Simple Attribute Oval
    ax.add_patch(patches.Ellipse((140, 258.7), 16, 5.2, linewidth=1.4, edgecolor='#991b1b', facecolor='#fce7f3'))
    ax.text(140, 258.7, "Attribute", fontsize=9, ha='center', va='center', color='#831843')

    # Key Attribute Oval (Underlined)
    ax.add_patch(patches.Ellipse((200, 258.7), 16, 5.2, linewidth=1.6, edgecolor='#991b1b', facecolor='#fce7f3'))
    ax.text(200, 258.7, "Key_Attr", fontsize=9, weight='bold', ha='center', va='center', color='#831843')
    ax.plot([194, 206], [257.0, 257.0], color='#831843', linewidth=1.6)

    # Derived Attribute (Dashed)
    ax.add_patch(patches.Ellipse((260, 258.7), 18, 5.2, linewidth=1.4, linestyle='--', edgecolor='#991b1b', facecolor='#fce7f3'))
    ax.text(260, 258.7, "Derived_Attr", fontsize=9, style='italic', ha='center', va='center', color='#831843')

    ax.text(348, 258.7, "1, N, M = Structural Cardinality", fontsize=10, weight='bold', ha='right', va='center', color='#1d4ed8')

    # Drawing Primitive Helpers
    def draw_entity(cx, cy, w, h, name):
        rect = patches.Rectangle((cx - w/2, cy - h/2), w, h, linewidth=2.0, edgecolor='#14532d', facecolor='#86efac', zorder=4)
        ax.add_patch(rect)
        ax.text(cx, cy, name, fontsize=11, weight='black', ha='center', va='center', zorder=5, color='#052e16')
        return (cx, cy, w, h)

    def draw_diamond(cx, cy, w, h, name):
        pts = [(cx, cy + h/2), (cx + w/2, cy), (cx, cy - h/2), (cx - w/2, cy)]
        diamond = Polygon(pts, closed=True, linewidth=1.8, edgecolor='#1e40af', facecolor='#bfdbfe', zorder=4)
        ax.add_patch(diamond)
        ax.text(cx, cy, name, fontsize=9.2, weight='bold', ha='center', va='center', zorder=5, color='#1e3a8a')
        return (cx, cy, w, h)

    def draw_oval_attr(cx, cy, name, is_pk=False, is_derived=False, w=17.0, h=5.4):
        ls = '--' if is_derived else '-'
        lw = 1.6 if is_pk else 1.3
        oval = patches.Ellipse((cx, cy), w, h, linewidth=lw, linestyle=ls, edgecolor='#991b1b', facecolor='#fce7f3', zorder=4)
        ax.add_patch(oval)
        weight = 'black' if is_pk else 'normal'
        ax.text(cx, cy, name, fontsize=8.6, weight=weight, ha='center', va='center', zorder=5, color='#831843')
        if is_pk:
            tw = min(w * 0.42, len(name) * 0.52)
            ax.plot([cx - tw, cx + tw], [cy - 1.2, cy - 1.2], color='#831843', linewidth=1.6, zorder=6)

    # Clean spine branch helper (matching Reference Image 2 style)
    # Stacks a list of attributes in a neat vertical column with horizontal spine branches
    def attach_spine_attributes(entity_point, spine_x, attr_list, direction='left', y_spacing=6.8):
        # Line from entity to vertical spine
        ex, ey = entity_point
        ax.plot([ex, spine_x], [ey, ey], color='#64748b', linewidth=1.4, zorder=2)

        # Calculate Y range of attributes centered or aligned with entity
        n = len(attr_list)
        total_span = (n - 1) * y_spacing
        start_y = ey + total_span / 2.0

        # Draw vertical spine
        ax.plot([spine_x, spine_x], [start_y, start_y - total_span], color='#64748b', linewidth=1.4, zorder=2)

        # Branch out to each oval
        for i, item in enumerate(attr_list):
            if isinstance(item, tuple):
                aname = item[0]
                is_pk = item[1] if len(item) > 1 else False
                is_derived = item[2] if len(item) > 2 else False
            else:
                aname = item
                is_pk = False
                is_derived = False

            ay = start_y - i * y_spacing
            if direction == 'left':
                oval_cx = spine_x - 10.5
                ax.plot([spine_x, oval_cx + 8.5], [ay, ay], color='#64748b', linewidth=1.3, zorder=2)
            else: # right
                oval_cx = spine_x + 10.5
                ax.plot([spine_x, oval_cx - 8.5], [ay, ay], color='#64748b', linewidth=1.3, zorder=2)

            draw_oval_attr(oval_cx, ay, aname, is_pk=is_pk, is_derived=is_derived)

    # Connect with straight orthogonal segments and cardinality label
    def connect_er(pt1, pt2, card1=None, card2=None, color='#334155'):
        ax.plot([pt1[0], pt2[0]], [pt1[1], pt2[1]], color=color, linewidth=1.5, zorder=2)
        if card1:
            ax.text(pt1[0] + (pt2[0] - pt1[0]) * 0.22, pt1[1] + (pt2[1] - pt1[1]) * 0.22, card1,
                    fontsize=10.5, weight='black', color='#1d4ed8',
                    bbox=dict(boxstyle='square,pad=0.15', facecolor='#ffffff', edgecolor='none', alpha=0.9),
                    ha='center', va='center', zorder=6)
        if card2:
            ax.text(pt1[0] + (pt2[0] - pt1[0]) * 0.78, pt1[1] + (pt2[1] - pt1[1]) * 0.78, card2,
                    fontsize=10.5, weight='black', color='#1d4ed8',
                    bbox=dict(boxstyle='square,pad=0.15', facecolor='#ffffff', edgecolor='none', alpha=0.9),
                    ha='center', va='center', zorder=6)

    # -------------------------------------------------------------
    # 1. ENTITY COORDINATES (Orthogonal Grid Layout)
    # -------------------------------------------------------------
    # Row 1 (y = 215): ROLE, USER, COURT, JUDGE
    ent_role = draw_entity(45, 215, 22, 9, "ROLE")
    ent_user = draw_entity(125, 215, 24, 9, "USER")
    ent_court = draw_entity(235, 215, 24, 9, "COURT")
    ent_judge = draw_entity(315, 215, 24, 9, "JUDGE")

    # Row 2 (y = 150): PERSON, CASE, HEARING
    ent_person = draw_entity(45, 150, 26, 9, "PERSON")
    ent_case = draw_entity(180, 150, 28, 10, "CASE")
    ent_hearing = draw_entity(315, 150, 26, 9, "HEARING")

    # Row 3 (y = 85): CHARGE, BAIL_APPLICATION, BAIL_DECISION
    ent_charge = draw_entity(90, 85, 26, 9, "CHARGE")
    ent_bail_app = draw_entity(205, 85, 30, 9, "BAIL_APPLICATION")
    ent_bail_dec = draw_entity(315, 85, 28, 9, "BAIL_DECISION")

    # Row 4 (y = 22): OFFENCE, LAW_SECTION, DOCUMENT, JUDICIAL_PRECEDENTS
    ent_offence = draw_entity(45, 22, 26, 9, "OFFENCE")
    ent_law_sec = draw_entity(125, 22, 28, 9, "LAW_SECTION")
    ent_doc = draw_entity(215, 22, 26, 9, "DOCUMENT")
    ent_precedent = draw_entity(305, 22, 34, 9, "JUDICIAL_PRECEDENTS")

    # -------------------------------------------------------------
    # 2. RELATIONSHIPS & CARDINALITIES (Clean Straight Connectors)
    # -------------------------------------------------------------
    # 1. ROLE <---Has_Role---> USER (1 : N)
    rel_has_role = draw_diamond(85, 215, 16, 8, "Has_Role")
    connect_er((ent_role[0], ent_role[1]), (rel_has_role[0], rel_has_role[1]), card1="1")
    connect_er((rel_has_role[0], rel_has_role[1]), (ent_user[0], ent_user[1]), card2="N")

    # 2. COURT <---Employs---> JUDGE (1 : N)
    rel_employs = draw_diamond(275, 215, 16, 8, "Employs")
    connect_er((ent_court[0], ent_court[1]), (rel_employs[0], rel_employs[1]), card1="1")
    connect_er((rel_employs[0], rel_employs[1]), (ent_judge[0], ent_judge[1]), card2="N")

    # 3. USER <---Files---> CASE (1 : N)
    rel_files = draw_diamond(150, 182, 16, 8, "Files")
    connect_er((ent_user[0] + 5, ent_user[1] - 4.5), (rel_files[0], rel_files[1]), card1="1")
    connect_er((rel_files[0], rel_files[1]), (ent_case[0] - 8, ent_case[1] + 5), card2="N")

    # 4. COURT <---Jurisdiction---> CASE (1 : N)
    rel_juris = draw_diamond(210, 182, 18, 8, "Jurisdiction")
    connect_er((ent_court[0] - 5, ent_court[1] - 4.5), (rel_juris[0], rel_juris[1]), card1="1")
    connect_er((rel_juris[0], rel_juris[1]), (ent_case[0] + 8, ent_case[1] + 5), card2="N")

    # 5. CASE <---Involves---> PERSON (M : N)
    rel_involves = draw_diamond(110, 150, 16, 8, "Involves")
    connect_er((ent_person[0], ent_person[1]), (rel_involves[0], rel_involves[1]), card1="N")
    connect_er((rel_involves[0], rel_involves[1]), (ent_case[0], ent_case[1]), card2="M")
    # Attribute on Involves relationship (party_role)
    draw_oval_attr(110, 163, "party_role")
    ax.plot([110, 110], [154, 160.3], color='#64748b', linewidth=1.3)

    # 6. CASE <---Lists---> HEARING (1 : N)
    rel_lists = draw_diamond(250, 150, 16, 8, "Lists")
    connect_er((ent_case[0], ent_case[1]), (rel_lists[0], rel_lists[1]), card1="1")
    connect_er((rel_lists[0], rel_lists[1]), (ent_hearing[0], ent_hearing[1]), card2="N")

    # 7. JUDGE <---Presides---> HEARING (1 : N)
    rel_presides = draw_diamond(315, 182, 16, 8, "Presides")
    connect_er((ent_judge[0], ent_judge[1] - 4.5), (rel_presides[0], rel_presides[1]), card1="1")
    connect_er((rel_presides[0], rel_presides[1]), (ent_hearing[0], ent_hearing[1] + 4.5), card2="N")

    # 8. CASE <---Frames---> CHARGE (1 : N)
    rel_frames = draw_diamond(135, 117, 16, 8, "Frames")
    connect_er((ent_case[0] - 10, ent_case[1] - 5), (rel_frames[0], rel_frames[1]), card1="1")
    connect_er((rel_frames[0], rel_frames[1]), (ent_charge[0] + 10, ent_charge[1] + 4.5), card2="N")

    # 9. CHARGE <---Classified_As---> OFFENCE (N : 1)
    rel_class = draw_diamond(68, 53, 18, 8, "Classified_As")
    connect_er((ent_charge[0] - 8, ent_charge[1] - 4.5), (rel_class[0], rel_class[1]), card1="N")
    connect_er((rel_class[0], rel_class[1]), (ent_offence[0] + 8, ent_offence[1] + 4.5), card2="1")

    # 10. CHARGE <---Invokes---> LAW_SECTION (M : N)
    rel_invokes = draw_diamond(110, 53, 16, 8, "Invokes")
    connect_er((ent_charge[0] + 5, ent_charge[1] - 4.5), (rel_invokes[0], rel_invokes[1]), card1="M")
    connect_er((rel_invokes[0], rel_invokes[1]), (ent_law_sec[0] - 5, ent_law_sec[1] + 4.5), card2="N")

    # 11. CASE <---Petitions---> BAIL_APPLICATION (1 : N)
    rel_pet = draw_diamond(195, 117, 16, 8, "Petitions")
    connect_er((ent_case[0], ent_case[1] - 5), (rel_pet[0], rel_pet[1]), card1="1")
    connect_er((rel_pet[0], rel_pet[1]), (ent_bail_app[0], ent_bail_app[1] + 4.5), card2="N")

    # 12. BAIL_APPLICATION <---Results_In---> BAIL_DECISION (1 : 1 Mandatory)
    rel_results = draw_diamond(260, 85, 18, 8, "Results_In")
    connect_er((ent_bail_app[0] + 15, ent_bail_app[1]), (rel_results[0] - 9, rel_results[1]), card1="1")
    connect_er((rel_results[0] + 9, rel_results[1]), (ent_bail_dec[0] - 14, ent_bail_dec[1]), card2="1")

    # 13. HEARING <---Adjudicated_At---> BAIL_DECISION (1 : 1)
    rel_adj = draw_diamond(315, 117, 20, 8, "Adjudicated_At")
    connect_er((ent_hearing[0], ent_hearing[1] - 4.5), (rel_adj[0], rel_adj[1]), card1="1")
    connect_er((rel_adj[0], rel_adj[1]), (ent_bail_dec[0], ent_bail_dec[1] + 4.5), card2="1")

    # 14. CASE <---Contains---> DOCUMENT (1 : N)
    rel_doc = draw_diamond(198, 53, 16, 8, "Contains")
    connect_er((ent_case[0] + 8, ent_case[1] - 5), (rel_doc[0], rel_doc[1]), card1="1")
    connect_er((rel_doc[0], rel_doc[1]), (ent_doc[0], ent_doc[1] + 4.5), card2="N")

    # 15. BAIL_APPLICATION <---pgvector_Match---> JUDICIAL_PRECEDENTS (M : N)
    rel_vec = draw_diamond(255, 53, 22, 8, "pgvector_Match")
    connect_er((ent_bail_app[0] + 10, ent_bail_app[1] - 4.5), (rel_vec[0], rel_vec[1]), card1="M")
    connect_er((rel_vec[0], rel_vec[1]), (ent_precedent[0] - 10, ent_precedent[1] + 4.5), card2="N")

    # -------------------------------------------------------------
    # 3. ATTRIBUTE SPINES & OVALS (Reference Image 2 Spine Layout)
    # -------------------------------------------------------------
    # ROLE Attributes (Spine on left)
    attach_spine_attributes((ent_role[0] - 11, ent_role[1]), 25, [
        ('role_id', True),
        ('role_name', False),
        ('description', False)
    ], direction='left')

    # PERSON Attributes (Spine on left)
    attach_spine_attributes((ent_person[0] - 13, ent_person[1]), 25, [
        ('person_id', True),
        ('name', False),
        ('gender', False),
        ('date_of_birth', False),
        ('phone', False)
    ], direction='left')

    # OFFENCE Attributes (Spine on left)
    attach_spine_attributes((ent_offence[0] - 13, ent_offence[1]), 25, [
        ('offence_id', True),
        ('offence_name', False),
        ('bailable', False),
        ('severity_level', False)
    ], direction='left')

    # JUDGE Attributes (Spine on right)
    attach_spine_attributes((ent_judge[0] + 12, ent_judge[1]), 335, [
        ('judge_id', True),
        ('name', False),
        ('designation', False),
        ('email', False)
    ], direction='right')

    # HEARING Attributes (Spine on right)
    attach_spine_attributes((ent_hearing[0] + 13, ent_hearing[1]), 335, [
        ('hearing_id', True),
        ('hearing_date', False),
        ('stage', False),
        ('outcome', False),
        ('next_hearing', False)
    ], direction='right')

    # BAIL_DECISION Attributes (Spine on right)
    attach_spine_attributes((ent_bail_dec[0] + 14, ent_bail_dec[1]), 335, [
        ('decision_id', True),
        ('decision', False),
        ('decision_date', False),
        ('surety_amount', False)
    ], direction='right')

    # USER Attributes (Centered above USER)
    draw_oval_attr(115, 235, "user_id", is_pk=True)
    ax.plot([115, 120], [232.3, 219.5], color='#64748b', linewidth=1.3)
    draw_oval_attr(135, 235, "name")
    ax.plot([135, 130], [232.3, 219.5], color='#64748b', linewidth=1.3)

    # COURT Attributes (Centered above COURT)
    draw_oval_attr(225, 235, "court_id", is_pk=True)
    ax.plot([225, 230], [232.3, 219.5], color='#64748b', linewidth=1.3)
    draw_oval_attr(245, 235, "court_name")
    ax.plot([245, 240], [232.3, 219.5], color='#64748b', linewidth=1.3)

    # CASE Attributes (Spine cluster above CASE)
    draw_oval_attr(165, 172, "case_id", is_pk=True)
    ax.plot([165, 172], [169.3, 155.0], color='#64748b', linewidth=1.3)
    draw_oval_attr(185, 172, "case_number")
    ax.plot([185, 180], [169.3, 155.0], color='#64748b', linewidth=1.3)

    # CHARGE Attributes (Spine to the left of CHARGE)
    draw_oval_attr(60, 95, "charge_id", is_pk=True)
    ax.plot([68.5, 77], [95, 87], color='#64748b', linewidth=1.3)
    draw_oval_attr(60, 83, "description")
    ax.plot([68.5, 77], [83, 85], color='#64748b', linewidth=1.3)

    # LAW_SECTION Attributes (Below LAW_SECTION)
    draw_oval_attr(115, 8, "section_id", is_pk=True)
    ax.plot([115, 120], [10.7, 17.5], color='#64748b', linewidth=1.3)
    draw_oval_attr(135, 8, "section_no")
    ax.plot([135, 130], [10.7, 17.5], color='#64748b', linewidth=1.3)

    # BAIL_APPLICATION Attributes (Cluster below BAIL_APPLICATION)
    draw_oval_attr(185, 68, "bail_id", is_pk=True)
    ax.plot([185, 195], [70.7, 80.5], color='#64748b', linewidth=1.3)
    draw_oval_attr(210, 68, "risk_score", is_derived=True)
    ax.plot([210, 205], [70.7, 80.5], color='#64748b', linewidth=1.3)

    # DOCUMENT Attributes (Below DOCUMENT)
    draw_oval_attr(205, 8, "document_id", is_pk=True)
    ax.plot([205, 210], [10.7, 17.5], color='#64748b', linewidth=1.3)
    draw_oval_attr(225, 8, "doc_type")
    ax.plot([225, 220], [10.7, 17.5], color='#64748b', linewidth=1.3)

    # JUDICIAL_PRECEDENTS Attributes (Below PRECEDENTS)
    draw_oval_attr(290, 8, "precedent_id", is_pk=True)
    ax.plot([290, 298], [10.7, 17.5], color='#64748b', linewidth=1.3)
    draw_oval_attr(312, 8, "citation")
    ax.plot([312, 308], [10.7, 17.5], color='#64748b', linewidth=1.3)

    # Save to docs/diagrams
    out_dir = r"docs/diagrams"
    os.makedirs(out_dir, exist_ok=True)
    out_png = os.path.join(out_dir, "er_diagram_chen_style.png")
    out_svg = os.path.join(out_dir, "er_diagram_chen_style.svg")

    # Ultra high resolution 300 DPI PNG + Scalable Vector Graphics
    plt.savefig(out_png, bbox_inches='tight', dpi=300)
    plt.savefig(out_svg, bbox_inches='tight')
    plt.close()
    print(f"Generated: {out_png} and {out_svg}")

    # Copy to artifacts directory
    artifact_dir = r"C:\Users\sheno\.gemini\antigravity\brain\a5782285-3f89-45dd-b1ab-8a23c91fce50\diagrams"
    os.makedirs(artifact_dir, exist_ok=True)
    shutil.copy(out_png, os.path.join(artifact_dir, "er_diagram_chen_style.png"))
    shutil.copy(out_svg, os.path.join(artifact_dir, "er_diagram_chen_style.svg"))
    print(f"Copied to artifact dir: {artifact_dir}")

if __name__ == '__main__':
    generate_academic_chen_er()
