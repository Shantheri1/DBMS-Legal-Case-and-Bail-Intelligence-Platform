import os
import sys
import tempfile
import shutil

os.environ['MPLCONFIGDIR'] = tempfile.gettempdir()
import matplotlib.pyplot as plt
import matplotlib.patches as patches

def generate_academic_relational_schema():
    # Large high-res canvas
    # Using a 3-column structured grid with dedicated wiring channels
    fig, ax = plt.subplots(figsize=(34, 26), dpi=300)
    ax.set_xlim(0, 340)
    ax.set_ylim(0, 260)
    ax.axis('off')

    # Background canvas
    fig.patch.set_facecolor('#ffffff')
    ax.set_facecolor('#ffffff')

    # Top Academic Title Banner matching reference format
    ax.text(12, 252, "PES UNIVERSITY  •  DEPARTMENT OF CSE", fontsize=14, weight='black', color='#1e293b')
    ax.text(170, 252, "JurisPredict: Relational Schema Specification (3NF / BCNF)", fontsize=18, weight='black', ha='center', color='#0f172a')
    ax.text(328, 252, "Shantheni Shenoy & Shriranjini", fontsize=14, weight='bold', ha='right', color='#1e293b')
    ax.text(170, 246, "Course: DBMS Experiential Learning (Level 3)  •  Instructor: Dr. Nagasundari S", fontsize=12, ha='center', color='#475569')

    # Legend Block
    ax.text(12, 239, "NOTATION GUIDE:", fontsize=10.5, weight='black', color='#0f172a')
    ax.text(48, 239, "Underlined = Primary Key (PK)", fontsize=10, weight='bold', color='#0f172a')
    ax.text(112, 239, "Dotted Underline = Foreign Key (FK)", fontsize=10, style='italic', color='#1d4ed8')
    ax.text(188, 239, "── Overhead Red Arrows = Functional Dependency (PK → Attributes)", fontsize=10, color='#dc2626')
    ax.text(262, 239, "── Stepped Black Arrows = Foreign Key Reference (FK → PK)", fontsize=10, color='#0f172a')

    # Table Layout Definitions (3 Balanced Columns)
    # Col 1: X = 12..105 (Center ~ 58)
    # Col 2: X = 118..220 (Center ~ 169)
    # Col 3: X = 232..328 (Center ~ 280)
    # Each table: (x, y, [(attr_name, is_pk, is_fk)])

    tables = {
        # ------------------ COLUMN 1: USERS & INSTITUTION ------------------
        'ROLES': (12, 212, [
            ('role_id', True, False),
            ('role_name', False, False),
            ('description', False, False)
        ]),
        'USERS': (12, 172, [
            ('user_id', True, False),
            ('role_id', False, True),
            ('name', False, False),
            ('email', False, False),
            ('status', False, False)
        ]),
        'COURTS': (12, 132, [
            ('court_id', True, False),
            ('court_name', False, False),
            ('court_type', False, False),
            ('location', False, False)
        ]),
        'JUDGES': (12, 92, [
            ('judge_id', True, False),
            ('court_id', False, True),
            ('name', False, False),
            ('designation', False, False),
            ('status', False, False)
        ]),
        'PERSONS': (12, 52, [
            ('person_id', True, False),
            ('name', False, False),
            ('gender', False, False),
            ('date_of_birth', False, False),
            ('phone', False, False)
        ]),
        'CASE_PARTIES': (12, 12, [
            ('case_id', True, True),
            ('person_id', True, True),
            ('party_role', False, False),
            ('is_active', False, False)
        ]),

        # ------------------ COLUMN 2: LITIGATION & LAW ------------------
        'CASES': (120, 212, [
            ('case_id', True, False),
            ('court_id', False, True),
            ('filed_by', False, True),
            ('case_number', False, False),
            ('title', False, False),
            ('status', False, False)
        ]),
        'OFFENCES': (120, 172, [
            ('offence_id', True, False),
            ('offence_name', False, False),
            ('bailable', False, False),
            ('severity_level', False, False)
        ]),
        'CHARGES': (120, 132, [
            ('charge_id', True, False),
            ('case_id', False, True),
            ('offence_id', False, True),
            ('description', False, False)
        ]),
        'LAW_SECTIONS': (120, 92, [
            ('section_id', True, False),
            ('act_name', False, False),
            ('section_number', False, False),
            ('punishment_summary', False, False)
        ]),
        'CHARGE_LAW_SECTIONS': (120, 52, [
            ('charge_id', True, True),
            ('section_id', True, True)
        ]),
        'DOCUMENTS': (120, 12, [
            ('document_id', True, False),
            ('case_id', False, True),
            ('uploaded_by', False, True),
            ('document_type', False, False)
        ]),

        # ------------------ COLUMN 3: HEARINGS, BAIL & PRECEDENTS ------------------
        'HEARINGS': (232, 212, [
            ('hearing_id', True, False),
            ('case_id', False, True),
            ('judge_id', False, True),
            ('hearing_date', False, False),
            ('stage', False, False)
        ]),
        'BAIL_APPLICATIONS': (232, 160, [
            ('bail_id', True, False),
            ('case_id', False, True),
            ('applied_by', False, True),
            ('bail_type', False, False),
            ('grounds', False, False),
            ('risk_score', False, False)
        ]),
        'BAIL_DECISIONS': (232, 108, [
            ('decision_id', True, False),
            ('bail_id', False, True),
            ('judge_id', False, True),
            ('hearing_id', False, True),
            ('decision', False, False),
            ('surety_amount', False, False)
        ]),
        'JUDICIAL_PRECEDENTS': (232, 42, [
            ('precedent_id', True, False),
            ('citation', False, False),
            ('court_level', False, False),
            ('decision_outcome', False, False),
            ('embedding_384d', False, False)
        ])
    }

    cell_h = 6.2
    cell_coords = {}

    # Render Tables and Columns
    for tname, (x, y, cols) in tables.items():
        # Title of Table
        ax.text(x, y + 8.2, tname, fontsize=12, weight='black', color='#0f172a')

        curr_x = x
        pk_centers = []
        non_pk_centers = []

        for cname, is_pk, is_fk in cols:
            # Calculate width based on character length
            cw = max(13.0, len(cname) * 1.55 + 3.0)

            # Cell box
            if is_pk and is_fk:
                fc = '#f0fdf4' # Soft emerald for composite PK+FK
            elif is_pk:
                fc = '#f8fafc' # Crisp light slate for PK
            elif is_fk:
                fc = '#fffbeb' # Soft warm amber for FK
            else:
                fc = '#ffffff'

            rect = patches.Rectangle((curr_x, y), cw, cell_h, linewidth=1.4, edgecolor='#0f172a', facecolor=fc, zorder=2)
            ax.add_patch(rect)

            cx = curr_x + cw / 2.0
            cy = y + cell_h / 2.0

            # Text
            if is_pk:
                ax.text(cx, cy, cname, fontsize=9.2, weight='black', ha='center', va='center', zorder=3, color='#0f172a')
                # Underline for PK
                ax.plot([curr_x + 1.5, curr_x + cw - 1.5], [y + 1.4, y + 1.4], color='#0f172a', linewidth=1.6, zorder=3)
                pk_centers.append(cx)
            elif is_fk:
                ax.text(cx, cy, cname, fontsize=9.2, style='italic', weight='bold', ha='center', va='center', zorder=3, color='#1e3a8a')
                # Dotted underline for FK
                ax.plot([curr_x + 1.5, curr_x + cw - 1.5], [y + 1.4, y + 1.4], color='#2563eb', linestyle=':', linewidth=1.8, zorder=3)
                non_pk_centers.append(cx)
            else:
                ax.text(cx, cy, cname, fontsize=9.0, ha='center', va='center', zorder=3, color='#334155')
                non_pk_centers.append(cx)

            cell_coords[(tname, cname)] = {
                'cx': cx,
                'cy': cy,
                'top': y + cell_h,
                'bottom': y,
                'left': curr_x,
                'right': curr_x + cw
            }

            curr_x += cw

        # Draw red Functional Dependency overhead lines: PK -> Attributes (matching Image 1)
        if pk_centers and non_pk_centers:
            first_pk_cx = pk_centers[0]
            top_y = y + cell_h
            bar_y = top_y + 3.2

            # Up from PK
            ax.plot([first_pk_cx, first_pk_cx], [top_y, bar_y], color='#dc2626', linewidth=1.1, zorder=4)

            # Horizontal distribution line
            max_attr_cx = max(non_pk_centers)
            ax.plot([first_pk_cx, max_attr_cx], [bar_y, bar_y], color='#dc2626', linewidth=1.1, zorder=4)

            # Down arrows to each non-pk attribute
            for ncx in non_pk_centers:
                ax.plot([ncx, ncx], [bar_y, top_y + 0.8], color='#dc2626', linewidth=1.1, zorder=4)
                # Arrowhead triangle pointing down
                ah = patches.Polygon([(ncx - 0.7, top_y + 0.8), (ncx + 0.7, top_y + 0.8), (ncx, top_y)],
                                     closed=True, color='#dc2626', zorder=5)
                ax.add_patch(ah)

    # -------------------------------------------------------------
    # ORTHOGONAL (STEPPED) FOREIGN KEY ARROW ROUTER
    # Strictly 90-degree horizontal and vertical line segments!
    # Exactly like Bob Dewhurst's Reference Image 1.
    # -------------------------------------------------------------
    def draw_orthogonal_fk(from_t, from_c, to_t, to_c, drop_y_offset=-4.0, horiz_x_override=None, to_y_offset=-2.0, color='#0f172a'):
        if (from_t, from_c) not in cell_coords or (to_t, to_c) not in cell_coords:
            return
        cf = cell_coords[(from_t, from_c)]
        ct = cell_coords[(to_t, to_c)]

        # Start at bottom center of FK cell
        start_x = cf['cx']
        start_y = cf['bottom']

        # End at bottom center of target PK cell
        target_x = ct['cx']
        target_y = ct['bottom']

        # Intermediate waypoint Y level
        waypoint_y = start_y + drop_y_offset

        # Route points:
        # 1. Drop down from FK
        # 2. Horizontal to target X
        # 3. Straight up to target PK bottom
        ax.plot([start_x, start_x], [start_y, waypoint_y], color=color, linewidth=1.3, zorder=5)
        ax.plot([start_x, target_x], [waypoint_y, waypoint_y], color=color, linewidth=1.3, zorder=5)
        ax.plot([target_x, target_x], [waypoint_y, target_y - 0.8], color=color, linewidth=1.3, zorder=5)

        # Arrowhead pointing UP into bottom of PK cell
        ah = patches.Polygon([(target_x - 0.7, target_y - 0.8),
                              (target_x + 0.7, target_y - 0.8),
                              (target_x, target_y)],
                             closed=True, color=color, zorder=6)
        ax.add_patch(ah)

    # Specific channel-routed FKs:
    # 1. USERS.role_id -> ROLES.role_id (Inside Col 1)
    # Starts at USERS (y=172), routes UP to ROLES (y=212)
    # Line goes down slightly, left to margin, up to ROLES, right to role_id
    def draw_left_gutter_fk(from_t, from_c, to_t, to_c, gutter_x=7.0):
        cf = cell_coords[(from_t, from_c)]
        ct = cell_coords[(to_t, to_c)]
        # From FK bottom -> left into gutter -> up to target Y -> right into PK bottom
        ax.plot([cf['cx'], cf['cx']], [cf['bottom'], cf['bottom'] - 2.5], color='#0f172a', linewidth=1.3)
        ax.plot([cf['cx'], gutter_x], [cf['bottom'] - 2.5, cf['bottom'] - 2.5], color='#0f172a', linewidth=1.3)
        ax.plot([gutter_x, gutter_x], [cf['bottom'] - 2.5, ct['bottom'] - 2.5], color='#0f172a', linewidth=1.3)
        ax.plot([gutter_x, ct['cx']], [ct['bottom'] - 2.5, ct['bottom'] - 2.5], color='#0f172a', linewidth=1.3)
        ax.plot([ct['cx'], ct['cx']], [ct['bottom'] - 2.5, ct['bottom'] - 0.8], color='#0f172a', linewidth=1.3)
        ah = patches.Polygon([(ct['cx'] - 0.7, ct['bottom'] - 0.8), (ct['cx'] + 0.7, ct['bottom'] - 0.8), (ct['cx'], ct['bottom'])], closed=True, color='#0f172a')
        ax.add_patch(ah)

    # Column 1 Internal links:
    draw_left_gutter_fk('USERS', 'role_id', 'ROLES', 'role_id', gutter_x=6.0)
    draw_left_gutter_fk('JUDGES', 'court_id', 'COURTS', 'court_id', gutter_x=7.5)
    draw_left_gutter_fk('CASE_PARTIES', 'person_id', 'PERSONS', 'person_id', gutter_x=8.5)

    # Column 2 Internal links:
    draw_left_gutter_fk('CHARGES', 'offence_id', 'OFFENCES', 'offence_id', gutter_x=114.0)
    draw_left_gutter_fk('CHARGE_LAW_SECTIONS', 'section_id', 'LAW_SECTIONS', 'section_id', gutter_x=114.0)
    draw_left_gutter_fk('CHARGE_LAW_SECTIONS', 'charge_id', 'CHARGES', 'charge_id', gutter_x=112.5)

    # Column 3 Internal links:
    draw_left_gutter_fk('BAIL_DECISIONS', 'bail_id', 'BAIL_APPLICATIONS', 'bail_id', gutter_x=226.0)
    draw_left_gutter_fk('BAIL_DECISIONS', 'hearing_id', 'HEARINGS', 'hearing_id', gutter_x=224.5)

    # Cross-Column Orthogonal Links through dedicated horizontal and vertical avenues:
    def draw_cross_channel_fk(from_t, from_c, to_t, to_c, exit_drop, horiz_y, enter_lead=0.8):
        cf = cell_coords[(from_t, from_c)]
        ct = cell_coords[(to_t, to_c)]
        start_x = cf['cx']
        start_y = cf['bottom']
        target_x = ct['cx']
        target_y = ct['bottom']

        # Drop from start -> horiz_y -> target_x -> target_y
        ax.plot([start_x, start_x], [start_y, horiz_y], color='#0f172a', linewidth=1.3)
        ax.plot([start_x, target_x], [horiz_y, horiz_y], color='#0f172a', linewidth=1.3)
        ax.plot([target_x, target_x], [horiz_y, target_y - enter_lead], color='#0f172a', linewidth=1.3)
        ah = patches.Polygon([(target_x - 0.7, target_y - enter_lead), (target_x + 0.7, target_y - enter_lead), (target_x, target_y)], closed=True, color='#0f172a')
        ax.add_patch(ah)

    # CASES.court_id -> COURTS.court_id
    draw_cross_channel_fk('CASES', 'court_id', 'COURTS', 'court_id', -3.0, 206.0)
    # CASES.filed_by -> USERS.user_id
    draw_cross_channel_fk('CASES', 'filed_by', 'USERS', 'user_id', -5.0, 203.0)

    # CHARGES.case_id -> CASES.case_id
    draw_cross_channel_fk('CHARGES', 'case_id', 'CASES', 'case_id', -3.0, 126.0)

    # CASE_PARTIES.case_id -> CASES.case_id
    draw_cross_channel_fk('CASE_PARTIES', 'case_id', 'CASES', 'case_id', -4.0, 5.0)

    # DOCUMENTS.case_id -> CASES.case_id
    draw_cross_channel_fk('DOCUMENTS', 'case_id', 'CASES', 'case_id', -3.0, 7.0)
    # DOCUMENTS.uploaded_by -> USERS.user_id
    draw_cross_channel_fk('DOCUMENTS', 'uploaded_by', 'USERS', 'user_id', -5.0, 3.0)

    # HEARINGS.case_id -> CASES.case_id
    draw_cross_channel_fk('HEARINGS', 'case_id', 'CASES', 'case_id', -3.0, 207.0)
    # HEARINGS.judge_id -> JUDGES.judge_id
    draw_cross_channel_fk('HEARINGS', 'judge_id', 'JUDGES', 'judge_id', -5.0, 204.0)

    # BAIL_APPLICATIONS.case_id -> CASES.case_id
    draw_cross_channel_fk('BAIL_APPLICATIONS', 'case_id', 'CASES', 'case_id', -4.0, 153.0)
    # BAIL_APPLICATIONS.applied_by -> USERS.user_id
    draw_cross_channel_fk('BAIL_APPLICATIONS', 'applied_by', 'USERS', 'user_id', -6.0, 150.0)

    # BAIL_DECISIONS.judge_id -> JUDGES.judge_id
    draw_cross_channel_fk('BAIL_DECISIONS', 'judge_id', 'JUDGES', 'judge_id', -4.0, 101.0)

    # Save to docs/diagrams
    out_dir = r"docs/diagrams"
    os.makedirs(out_dir, exist_ok=True)
    out_png = os.path.join(out_dir, "relational_schema_academic.png")
    out_svg = os.path.join(out_dir, "relational_schema_academic.svg")

    # High-res 300 DPI PNG + Scalable Vector Graphics (SVG)
    plt.savefig(out_png, bbox_inches='tight', dpi=300)
    plt.savefig(out_svg, bbox_inches='tight')
    plt.close()
    print(f"Generated: {out_png} and {out_svg}")

    # Copy to artifacts directory
    artifact_dir = r"C:\Users\sheno\.gemini\antigravity\brain\a5782285-3f89-45dd-b1ab-8a23c91fce50\diagrams"
    os.makedirs(artifact_dir, exist_ok=True)
    shutil.copy(out_png, os.path.join(artifact_dir, "relational_schema_academic.png"))
    shutil.copy(out_svg, os.path.join(artifact_dir, "relational_schema_academic.svg"))
    print(f"Copied to artifact dir: {artifact_dir}")

if __name__ == '__main__':
    generate_academic_relational_schema()
